###############################################################################
# Production EKS Cluster - ap-south-1 (Mumbai)
# Organization-grade: HA, Scalable, Secure
###############################################################################

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  # ─── Remote State (S3 + DynamoDB locking) ───────────────────────────────────
  # STEP 1: Run bootstrap/ first:  cd bootstrap && terraform apply
  # STEP 2: Copy the backend_config_block output here and uncomment it.
  # STEP 3: Run: terraform init -migrate-state  (migrates local → S3)
  #
  # backend "s3" {
  #   bucket         = "myorg-terraform-state-<account-id>"   # from bootstrap output
  #   key            = "eks/ap-south-1/production/terraform.tfstate"
  #   region         = "ap-south-1"
  #   encrypt        = true
  #   kms_key_id     = "arn:aws:kms:ap-south-1:<account-id>:key/<key-id>"
  #   dynamodb_table = "myorg-terraform-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", var.aws_region]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", var.aws_region]
    }
  }
}

###############################################################################
# Data Sources
###############################################################################

data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

###############################################################################
# Locals
###############################################################################

locals {
  account_id   = data.aws_caller_identity.current.account_id
  cluster_name = "${var.org_name}-${var.environment}-eks"
  azs          = slice(data.aws_availability_zones.available.names, 0, 3)

  common_tags = {
    Organization = var.org_name
    Environment  = var.environment
    ManagedBy    = "Terraform"
    ClusterName  = local.cluster_name
    CostCenter   = var.cost_center
    Owner        = var.owner_email
  }
}

###############################################################################
# Modules
###############################################################################

module "vpc" {
  source = "./modules/vpc"

  cluster_name = local.cluster_name
  org_name     = var.org_name
  environment  = var.environment
  aws_region   = var.aws_region
  azs          = local.azs

  vpc_cidr            = var.vpc_cidr
  private_subnet_cidrs = var.private_subnet_cidrs
  public_subnet_cidrs  = var.public_subnet_cidrs
  intra_subnet_cidrs   = var.intra_subnet_cidrs
}

module "eks" {
  source = "./modules/eks"

  cluster_name       = local.cluster_name
  cluster_version    = var.cluster_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  intra_subnet_ids   = module.vpc.intra_subnet_ids
  aws_region         = var.aws_region
  account_id         = local.account_id
  environment        = var.environment
  org_name           = var.org_name

  node_groups = var.node_groups
}

module "addons" {
  source = "./modules/addons"

  cluster_name                       = local.cluster_name
  cluster_version                    = var.cluster_version
  cluster_endpoint                   = module.eks.cluster_endpoint
  cluster_certificate_authority_data = module.eks.cluster_certificate_authority_data
  oidc_provider_arn                  = module.eks.oidc_provider_arn
  oidc_issuer_url                    = module.eks.cluster_oidc_issuer_url
  vpc_id                             = module.vpc.vpc_id
  aws_region                         = var.aws_region
  account_id                         = local.account_id
  environment                        = var.environment
  org_name                           = var.org_name

  depends_on = [module.eks]
}

module "security" {
  source = "./modules/security"

  cluster_name = local.cluster_name
  vpc_id       = module.vpc.vpc_id
  aws_region   = var.aws_region
  account_id   = local.account_id
  environment  = var.environment
  org_name     = var.org_name

  depends_on = [module.eks]
}
