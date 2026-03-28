###############################################################################
# Outputs — copy these into ../main.tf backend block
###############################################################################

output "state_bucket_name" {
  description = "S3 bucket for Terraform state"
  value       = aws_s3_bucket.state.bucket
}

output "state_bucket_arn" {
  description = "ARN of the state bucket"
  value       = aws_s3_bucket.state.arn
}

output "dynamodb_lock_table" {
  description = "DynamoDB table name for state locking"
  value       = aws_dynamodb_table.lock.name
}

output "kms_key_arn" {
  description = "KMS key ARN used to encrypt state"
  value       = aws_kms_key.state.arn
}

output "iam_policy_arn" {
  description = "IAM policy ARN to attach to your DevOps/CI role"
  value       = aws_iam_policy.terraform_backend.arn
}

output "backend_config_block" {
  description = "Paste this into the terraform {} block in ../main.tf"
  value       = <<-EOT

    backend "s3" {
      bucket         = "${aws_s3_bucket.state.bucket}"
      key            = "eks/ap-south-1/production/terraform.tfstate"
      region         = "${var.aws_region}"
      encrypt        = true
      kms_key_id     = "${aws_kms_key.state.arn}"
      dynamodb_table = "${aws_dynamodb_table.lock.name}"
    }

  EOT
}
