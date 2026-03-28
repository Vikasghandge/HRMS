variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "org_name" {
  description = "Short org name used in resource naming (e.g. myorg, acme)"
  type        = string
  default     = "myorg"
}
