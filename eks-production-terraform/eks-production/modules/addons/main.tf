###############################################################################
# Module: Addons
# - AWS Load Balancer Controller (IRSA)
# - Cluster Autoscaler (IRSA)
# - External DNS (IRSA)
# - Metrics Server
# - AWS Secrets & Config Provider (ASCP)
###############################################################################

locals {
  oidc_issuer = replace(var.oidc_issuer_url, "https://", "")
}

###############################################################################
# Helper: IRSA assume-role policy factory
###############################################################################

data "aws_iam_policy_document" "irsa_assume" {
  for_each = {
    lbc        = "kube-system:aws-load-balancer-controller"
    autoscaler = "kube-system:cluster-autoscaler"
    extdns     = "kube-system:external-dns"
    secretsCSI = "kube-system:secrets-store-csi-driver"
  }

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_issuer}:sub"
      values   = ["system:serviceaccount:${each.value}"]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_issuer}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

###############################################################################
# AWS Load Balancer Controller
###############################################################################

resource "aws_iam_role" "lbc" {
  name               = "${var.cluster_name}-lbc-role"
  assume_role_policy = data.aws_iam_policy_document.irsa_assume["lbc"].json
}

resource "aws_iam_policy" "lbc" {
  name        = "${var.cluster_name}-lbc-policy"
  description = "AWS Load Balancer Controller policy"

  # Full policy from AWS docs — trimmed here, fetched at plan time via data source in real usage
  policy = file("${path.module}/policies/lbc-policy.json")
}

resource "aws_iam_role_policy_attachment" "lbc" {
  role       = aws_iam_role.lbc.name
  policy_arn = aws_iam_policy.lbc.arn
}

resource "helm_release" "lbc" {
  name             = "aws-load-balancer-controller"
  repository       = "https://aws.github.io/eks-charts"
  chart            = "aws-load-balancer-controller"
  namespace        = "kube-system"
  create_namespace = false
  version          = "1.7.2"

  values = [yamlencode({
    clusterName = var.cluster_name
    region      = var.aws_region
    vpcId       = var.vpc_id

    serviceAccount = {
      create = true
      name   = "aws-load-balancer-controller"
      annotations = {
        "eks.amazonaws.com/role-arn" = aws_iam_role.lbc.arn
      }
    }

    replicaCount = 2

    resources = {
      requests = { cpu = "100m", memory = "128Mi" }
      limits   = { cpu = "500m", memory = "512Mi" }
    }

    podDisruptionBudget = {
      maxUnavailable = 1
    }

    tolerations = [{
      key      = "CriticalAddonsOnly"
      operator = "Exists"
    }]
  })]

  depends_on = [aws_iam_role_policy_attachment.lbc]
}

###############################################################################
# Cluster Autoscaler
###############################################################################

resource "aws_iam_role" "autoscaler" {
  name               = "${var.cluster_name}-autoscaler-role"
  assume_role_policy = data.aws_iam_policy_document.irsa_assume["autoscaler"].json
}

resource "aws_iam_policy" "autoscaler" {
  name        = "${var.cluster_name}-autoscaler-policy"
  description = "Cluster Autoscaler policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeScalingActivities",
          "autoscaling:DescribeTags",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeLaunchTemplateVersions"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeImages",
          "ec2:GetInstanceTypesFromInstanceRequirements",
          "eks:DescribeNodegroup"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "autoscaler" {
  role       = aws_iam_role.autoscaler.name
  policy_arn = aws_iam_policy.autoscaler.arn
}

resource "helm_release" "cluster_autoscaler" {
  name             = "cluster-autoscaler"
  repository       = "https://kubernetes.github.io/autoscaler"
  chart            = "cluster-autoscaler"
  namespace        = "kube-system"
  create_namespace = false
  version          = "9.36.0"

  values = [yamlencode({
    autoDiscovery = {
      clusterName = var.cluster_name
    }

    awsRegion = var.aws_region

    rbac = {
      serviceAccount = {
        create = true
        name   = "cluster-autoscaler"
        annotations = {
          "eks.amazonaws.com/role-arn" = aws_iam_role.autoscaler.arn
        }
      }
    }

    extraArgs = {
      balance-similar-node-groups   = "true"
      skip-nodes-with-system-pods   = "false"
      expander                      = "least-waste"
      scale-down-delay-after-add    = "5m"
      scale-down-unneeded-time      = "10m"
    }

    resources = {
      requests = { cpu = "100m", memory = "300Mi" }
      limits   = { cpu = "500m", memory = "600Mi" }
    }
  })]

  depends_on = [aws_iam_role_policy_attachment.autoscaler]
}

###############################################################################
# External DNS
###############################################################################

resource "aws_iam_role" "extdns" {
  name               = "${var.cluster_name}-extdns-role"
  assume_role_policy = data.aws_iam_policy_document.irsa_assume["extdns"].json
}

resource "aws_iam_policy" "extdns" {
  name        = "${var.cluster_name}-extdns-policy"
  description = "External DNS policy for Route53"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["route53:ChangeResourceRecordSets"]
        Resource = ["arn:aws:route53:::hostedzone/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["route53:ListHostedZones", "route53:ListResourceRecordSets"]
        Resource = ["*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "extdns" {
  role       = aws_iam_role.extdns.name
  policy_arn = aws_iam_policy.extdns.arn
}

resource "helm_release" "external_dns" {
  name             = "external-dns"
  repository       = "https://kubernetes-sigs.github.io/external-dns/"
  chart            = "external-dns"
  namespace        = "kube-system"
  create_namespace = false
  version          = "1.14.4"

  values = [yamlencode({
    provider = "aws"
    aws = {
      region = var.aws_region
    }

    serviceAccount = {
      create = true
      name   = "external-dns"
      annotations = {
        "eks.amazonaws.com/role-arn" = aws_iam_role.extdns.arn
      }
    }

    policy = "sync"

    txtOwnerId = var.cluster_name

    resources = {
      requests = { cpu = "50m", memory = "50Mi" }
      limits   = { cpu = "100m", memory = "100Mi" }
    }
  })]

  depends_on = [aws_iam_role_policy_attachment.extdns]
}

###############################################################################
# Metrics Server
###############################################################################

resource "helm_release" "metrics_server" {
  name             = "metrics-server"
  repository       = "https://kubernetes-sigs.github.io/metrics-server/"
  chart            = "metrics-server"
  namespace        = "kube-system"
  create_namespace = false
  version          = "3.12.1"

  values = [yamlencode({
    replicas = 2
    resources = {
      requests = { cpu = "50m", memory = "100Mi" }
      limits   = { cpu = "200m", memory = "200Mi" }
    }
  })]
}

###############################################################################
# AWS Secrets & Config Provider (ASCP) — mounts Secrets Manager into pods
###############################################################################

resource "helm_release" "secrets_store_csi" {
  name             = "secrets-store-csi-driver"
  repository       = "https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts"
  chart            = "secrets-store-csi-driver"
  namespace        = "kube-system"
  create_namespace = false
  version          = "1.4.3"

  values = [yamlencode({
    syncSecret = { enabled = true }
    enableSecretRotation = true
    rotationPollInterval = "120s"
  })]
}

resource "helm_release" "ascp" {
  name             = "aws-secrets-manager"
  repository       = "https://aws.github.io/secrets-store-csi-driver-provider-aws"
  chart            = "secrets-store-csi-driver-provider-aws"
  namespace        = "kube-system"
  create_namespace = false
  version          = "0.3.9"

  depends_on = [helm_release.secrets_store_csi]
}

###############################################################################
# Kubernetes Namespaces — standard org layout
###############################################################################

resource "kubernetes_namespace" "namespaces" {
  for_each = toset(["production", "staging", "monitoring", "security", "infra"])

  metadata {
    name = each.value

    labels = {
      environment = each.value == "production" ? "production" : "non-production"
      managed-by  = "terraform"
    }
  }
}

###############################################################################
# Default Network Policies — deny-all ingress, allow same-namespace
###############################################################################

resource "kubernetes_network_policy" "default_deny_ingress" {
  for_each = toset(["production", "staging"])

  metadata {
    name      = "default-deny-ingress"
    namespace = each.value
  }

  spec {
    pod_selector {}
    policy_types = ["Ingress"]
  }

  depends_on = [kubernetes_namespace.namespaces]
}

resource "kubernetes_network_policy" "allow_same_namespace" {
  for_each = toset(["production", "staging"])

  metadata {
    name      = "allow-same-namespace"
    namespace = each.value
  }

  spec {
    pod_selector {}

    ingress {
      from {
        pod_selector {}
      }
    }

    policy_types = ["Ingress"]
  }

  depends_on = [kubernetes_namespace.namespaces]
}
