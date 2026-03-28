###############################################################################
# terraform.tfvars  — Customize these for your organization
###############################################################################

aws_region      = "ap-south-1"
org_name        = "myorg"          # e.g. "acme", "techcorp"
environment     = "production"
cost_center     = "platform-engineering"
owner_email     = "platform@myorg.com"
cluster_version = "1.29"

vpc_cidr             = "10.0.0.0/16"
private_subnet_cidrs = ["10.0.0.0/19", "10.0.32.0/19", "10.0.64.0/19"]
public_subnet_cidrs  = ["10.0.96.0/24", "10.0.97.0/24", "10.0.98.0/24"]
intra_subnet_cidrs   = ["10.0.99.0/28", "10.0.99.16/28", "10.0.99.32/28"]
