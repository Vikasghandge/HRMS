# Production EKS Cluster — ap-south-1 (Mumbai)
## Organization-Grade: Highly Available, Scalable, Secure

---

## Architecture Overview

```
                          ┌─────────────────────────────────────────────┐
                          │              AWS ap-south-1                  │
                          │                                              │
                          │  ┌──────────────────────────────────────┐   │
                          │  │          VPC (10.0.0.0/16)           │   │
                          │  │                                      │   │
                          │  │  AZ-a          AZ-b          AZ-c    │   │
                          │  │ ┌──────┐     ┌──────┐     ┌──────┐  │   │
                          │  │ │Public│     │Public│     │Public│  │   │
                          │  │ │ ALB  │     │ ALB  │     │ ALB  │  │   │
                          │  │ │NAT GW│     │NAT GW│     │NAT GW│  │   │
                          │  │ └──────┘     └──────┘     └──────┘  │   │
                          │  │ ┌──────┐     ┌──────┐     ┌──────┐  │   │
                          │  │ │Priv  │     │Priv  │     │Priv  │  │   │
                          │  │ │Nodes │     │Nodes │     │Nodes │  │   │
                          │  │ └──────┘     └──────┘     └──────┘  │   │
                          │  │ ┌──────┐     ┌──────┐     ┌──────┐  │   │
                          │  │ │Intra │     │Intra │     │Intra │  │   │
                          │  │ │EKS CP│     │EKS CP│     │EKS CP│  │   │
                          │  │ └──────┘     └──────┘     └──────┘  │   │
                          │  └──────────────────────────────────────┘   │
                          └─────────────────────────────────────────────┘
```

---

## What's Included

### Networking (modules/vpc)
| Component | Detail |
|-----------|--------|
| VPC | 10.0.0.0/16, DNS enabled |
| Subnets | 3 public + 3 private + 3 intra across 3 AZs |
| NAT Gateways | 1 per AZ (HA) |
| VPC Flow Logs | → CloudWatch, 90-day retention |
| VPC Endpoints | S3 (Gateway), ECR API, ECR DKR, STS (Interface) |

### EKS Cluster (modules/eks)
| Component | Detail |
|-----------|--------|
| Kubernetes Version | 1.29 |
| Control Plane Logs | API, Audit, Authenticator, ControllerManager, Scheduler |
| Secrets Encryption | KMS with key rotation enabled |
| Endpoint | Public + Private (restrict `public_access_cidrs` in prod) |
| OIDC Provider | Enabled for IRSA |
| IMDSv2 | Enforced on all nodes |
| EBS Encryption | KMS encrypted volumes on all nodes |

### Node Groups (modules/eks)
| Group | Type | Min | Max | Purpose |
|-------|------|-----|-----|---------|
| system | On-Demand m5.xlarge | 2 | 4 | CoreDNS, kube-proxy, controllers |
| app-on-demand | On-Demand m5.2xlarge | 2 | 10 | Critical production workloads |
| app-spot | Spot m5.2xlarge (5 types) | 0 | 20 | Non-critical / batch workloads |
| monitoring | On-Demand m5.xlarge | 1 | 3 | Prometheus, Grafana (tainted) |

### EKS Managed Addons
- **vpc-cni** — Pod networking
- **coredns** — Cluster DNS
- **kube-proxy** — Service networking
- **aws-ebs-csi-driver** — Persistent volumes with IRSA

### Cluster Add-ons (modules/addons, via Helm)
| Addon | Purpose |
|-------|---------|
| AWS Load Balancer Controller | Manages ALBs and NLBs for Services/Ingresses |
| Cluster Autoscaler | Auto-scales node groups based on pending pods |
| External DNS | Syncs Ingress hostnames to Route53 |
| Metrics Server | CPU/memory metrics for HPA |
| Secrets Store CSI Driver | Mount Secrets Manager secrets as volumes |
| AWS Secrets Config Provider | Provider plugin for Secrets Manager |

### Security (modules/security)
| Feature | Detail |
|---------|--------|
| GuardDuty | EKS Audit Log + Runtime Monitoring (eBPF agent) |
| Security Hub | CIS Benchmark + AWS Foundational Best Practices |
| WAF WebACL | Core Rule Set + Known Bad Inputs + Rate Limiting |
| Falco | In-cluster runtime threat detection |
| OPA Gatekeeper | Policy-as-code enforcement (3 replicas) |
| AWS Config | EKS endpoint + secrets encryption compliance rules |
| Network Policies | Default deny ingress + allow-same-namespace |

---

## Prerequisites

```bash
# Tools required
terraform >= 1.6
aws-cli  >= 2.x
kubectl  >= 1.28
helm     >= 3.14

# AWS credentials configured
aws configure --profile myorg-production
export AWS_PROFILE=myorg-production
```

---

## Bootstrap (First Time Only)

### 1. Create S3 backend + DynamoDB lock table

```bash
# Create state bucket
aws s3api create-bucket \
  --bucket myorg-terraform-state \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

aws s3api put-bucket-versioning \
  --bucket myorg-terraform-state \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket myorg-terraform-state \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# Create DynamoDB lock table
aws dynamodb create-table \
  --table-name myorg-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

### 2. Uncomment the backend block in `main.tf` and update bucket/table names.

---

## Deployment

```bash
# 1. Initialize
terraform init

# 2. Plan — review all changes
terraform plan -out=tfplan

# 3. Apply
terraform apply tfplan

# 4. Configure kubectl
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name myorg-production-eks

# 5. Verify
kubectl get nodes -o wide
kubectl get pods -A
```

---

## Post-Deployment Hardening Checklist

- [ ] Restrict `public_access_cidrs` in `modules/eks/main.tf` to your org's IP ranges
- [ ] Set `endpoint_public_access = false` after VPN/bastion is configured
- [ ] Configure Falco Slack webhook in `modules/security/main.tf`
- [ ] Set `txtOwnerId` and Route53 hosted zone for External DNS
- [ ] Create `SecretProviderClass` resources for each app using Secrets Manager
- [ ] Set up Prometheus + Grafana in the `monitoring` namespace
- [ ] Configure GuardDuty findings → SNS → Slack/PagerDuty
- [ ] Enable AWS Config aggregator for multi-account setup
- [ ] Attach WAF WebACL ARN (from outputs) to your ALBs

---

## Module Structure

```
eks-production/
├── main.tf               # Root — wires all modules
├── variables.tf          # All input variables
├── outputs.tf            # Key outputs (endpoint, OIDC, VPC)
├── terraform.tfvars      # Org-specific values
│
└── modules/
    ├── vpc/              # VPC, subnets, NAT, flow logs, endpoints
    ├── eks/              # EKS cluster, node groups, KMS, IRSA, addons
    ├── addons/           # Helm: LBC, CA, ExternalDNS, Metrics, Secrets CSI
    │   └── policies/
    │       └── lbc-policy.json
    └── security/         # GuardDuty, SecurityHub, WAF, Falco, Gatekeeper, Config
```

---

## IRSA Pattern (for your application teams)

To give a pod access to AWS services without static credentials:

```hcl
# 1. Create an IAM role
resource "aws_iam_role" "my_app" {
  name = "myorg-production-eks-myapp"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = "<oidc_provider_arn>" }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "<oidc_issuer>:sub" = "system:serviceaccount:production:my-app-sa"
        }
      }
    }]
  })
}
```

```yaml
# 2. Annotate the ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-sa
  namespace: production
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT:role/myorg-production-eks-myapp
```

---

## Cost Estimate (ap-south-1, approximate)

| Component | Monthly Cost |
|-----------|-------------|
| EKS Control Plane | ~$73 |
| NAT Gateways (3x) | ~$100–150 |
| System nodes (2x m5.xlarge) | ~$120 |
| App On-Demand (2x m5.2xlarge) | ~$240 |
| App Spot (2x m5.2xlarge) | ~$50 |
| Monitoring node (1x m5.xlarge) | ~$60 |
| VPC Endpoints | ~$50 |
| **Total (base)** | **~$693–750/mo** |

> Spot instances can reduce compute costs by 60–70% at peak scale.

---

## Security Standards Compliance

- ✅ CIS EKS Benchmark
- ✅ AWS Well-Architected Security Pillar
- ✅ NIST 800-190 (Container Security)
- ✅ IMDSv2 enforced
- ✅ No public node IPs
- ✅ Secrets encrypted at rest (KMS)
- ✅ All control plane logs captured
- ✅ Audit trail via CloudTrail (enable separately)
