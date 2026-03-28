###############################################################################
# Root Variables
###############################################################################

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "org_name" {
  description = "Short name of your organization (used in resource naming)"
  type        = string
  default     = "myorg"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development."
  }
}

variable "cost_center" {
  description = "Cost center tag for billing"
  type        = string
  default     = "platform-engineering"
}

variable "owner_email" {
  description = "Team or owner email for tagging"
  type        = string
  default     = "platform@myorg.com"
}

variable "cluster_version" {
  description = "EKS Kubernetes version"
  type        = string
  default     = "1.29"
}

# ─── Networking ────────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "CIDRs for private subnets (one per AZ) — worker nodes live here"
  type        = list(string)
  default     = ["10.0.0.0/19", "10.0.32.0/19", "10.0.64.0/19"]
}

variable "public_subnet_cidrs" {
  description = "CIDRs for public subnets (one per AZ) — ALBs and NAT GWs"
  type        = list(string)
  default     = ["10.0.96.0/24", "10.0.97.0/24", "10.0.98.0/24"]
}

variable "intra_subnet_cidrs" {
  description = "CIDRs for intra subnets (no internet) — EKS control plane ENIs"
  type        = list(string)
  default     = ["10.0.99.0/28", "10.0.99.16/28", "10.0.99.32/28"]
}

# ─── Node Groups ──────────────────────────────────────────────────────────────

variable "node_groups" {
  description = "Managed node group configurations"
  type = map(object({
    name            = string
    instance_types  = list(string)
    capacity_type   = string   # ON_DEMAND | SPOT
    min_size        = number
    max_size        = number
    desired_size    = number
    disk_size_gb    = number
    labels          = map(string)
    taints          = list(object({ key = string, value = string, effect = string }))
  }))

  default = {
    system = {
      name           = "system"
      instance_types = ["m5.xlarge", "m5a.xlarge", "m6i.xlarge"]
      capacity_type  = "ON_DEMAND"
      min_size       = 2
      max_size       = 4
      desired_size   = 2
      disk_size_gb   = 50
      labels         = { role = "system", node-type = "on-demand" }
      taints         = []
    }
    app_on_demand = {
      name           = "app-on-demand"
      instance_types = ["m5.2xlarge", "m5a.2xlarge", "m6i.2xlarge"]
      capacity_type  = "ON_DEMAND"
      min_size       = 2
      max_size       = 10
      desired_size   = 2
      disk_size_gb   = 100
      labels         = { role = "app", node-type = "on-demand" }
      taints         = []
    }
    app_spot = {
      name           = "app-spot"
      instance_types = ["m5.2xlarge", "m5a.2xlarge", "m4.2xlarge", "m6i.2xlarge", "c5.2xlarge"]
      capacity_type  = "SPOT"
      min_size       = 0
      max_size       = 20
      desired_size   = 2
      disk_size_gb   = 100
      labels         = { role = "app", node-type = "spot" }
      taints         = [{ key = "spot", value = "true", effect = "NO_SCHEDULE" }]
    }
    monitoring = {
      name           = "monitoring"
      instance_types = ["m5.xlarge", "m5a.xlarge"]
      capacity_type  = "ON_DEMAND"
      min_size       = 1
      max_size       = 3
      desired_size   = 1
      disk_size_gb   = 100
      labels         = { role = "monitoring", node-type = "on-demand" }
      taints         = [{ key = "monitoring", value = "true", effect = "NO_SCHEDULE" }]
    }
  }
}
