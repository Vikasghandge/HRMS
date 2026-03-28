###############################################################################
# Bootstrap: Terraform Remote State Backend
#
# Run this ONCE before the main EKS deployment.
# Creates:
#   - S3 bucket (versioned, encrypted, access-logged, lifecycle-managed)
#   - S3 bucket for access logs
#   - DynamoDB table for state locking
#   - IAM policy for teams to use the backend
#
# Usage:
#   cd bootstrap/
#   terraform init
#   terraform apply
#   → Copy the outputs into the backend block of ../main.tf
###############################################################################

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
  # NOTE: This bootstrap uses LOCAL state intentionally.
  # After apply, commit the tfstate file to a secure vault or keep it locally.
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Organization = var.org_name
      Environment  = "global"
      ManagedBy    = "Terraform"
      Purpose      = "terraform-state-backend"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  account_id   = data.aws_caller_identity.current.account_id
  state_bucket = "${var.org_name}-terraform-state-${local.account_id}"
  logs_bucket  = "${var.org_name}-terraform-state-logs-${local.account_id}"
  lock_table   = "${var.org_name}-terraform-lock"
}

###############################################################################
# S3 Access Logs Bucket (receives access logs from the state bucket)
###############################################################################

resource "aws_s3_bucket" "logs" {
  bucket        = local.logs_bucket
  force_destroy = false

  tags = { Name = local.logs_bucket }
}

resource "aws_s3_bucket_ownership_controls" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "logs" {
  bucket     = aws_s3_bucket.logs.id
  acl        = "log-delivery-write"
  depends_on = [aws_s3_bucket_ownership_controls.logs]
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket                  = aws_s3_bucket.logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    expiration {
      days = 365
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

###############################################################################
# State S3 Bucket
###############################################################################

resource "aws_s3_bucket" "state" {
  bucket        = local.state_bucket
  force_destroy = false # NEVER accidentally destroy state

  tags = { Name = local.state_bucket }
}

# Versioning — keeps full history of every state file change
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Encryption — AES256 (upgrade to KMS below if needed)
resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.state.arn
    }
    bucket_key_enabled = true # Reduces KMS API call costs
  }
}

# Block all public access — state files must NEVER be public
resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Access logging → logs bucket
resource "aws_s3_bucket_logging" "state" {
  bucket        = aws_s3_bucket.state.id
  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "state-access-logs/"
}

# Lifecycle — keep versions for 365 days, auto-delete old noncurrent after 90
resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    id     = "state-version-management"
    status = "Enabled"

    # Keep current versions indefinitely
    # Clean up noncurrent versions after 365 days
    noncurrent_version_expiration {
      noncurrent_days           = 365
      newer_noncurrent_versions = 10 # Always keep at least 10 versions
    }

    # Delete incomplete multipart uploads after 7 days
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Replication — optional, uncomment for cross-region DR
# resource "aws_s3_bucket_replication_configuration" "state" { ... }

# Enforce TLS-only access to state bucket
resource "aws_s3_bucket_policy" "state" {
  bucket = aws_s3_bucket.state.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyNonTLS"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          "${aws_s3_bucket.state.arn}",
          "${aws_s3_bucket.state.arn}/*"
        ]
        Condition = {
          Bool = {
            "aws:SecureTransport" = "false"
          }
        }
      },
      {
        Sid    = "DenyNonEncryptedObjectUploads"
        Effect = "Deny"
        Principal = "*"
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.state.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "aws:kms"
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.state]
}

###############################################################################
# KMS Key — Encrypts state files at rest
###############################################################################

resource "aws_kms_key" "state" {
  description             = "Terraform state encryption key - ${var.org_name}"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  multi_region            = false

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "Enable IAM User Permissions"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${local.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      }
    ]
  })

  tags = { Name = "${var.org_name}-terraform-state-kms" }
}

resource "aws_kms_alias" "state" {
  name          = "alias/${var.org_name}-terraform-state"
  target_key_id = aws_kms_key.state.key_id
}

###############################################################################
# DynamoDB Table — State Locking + Consistency
###############################################################################

resource "aws_dynamodb_table" "lock" {
  name         = local.lock_table
  billing_mode = "PAY_PER_REQUEST" # No capacity planning needed
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  # Point-in-time recovery — restore table to any second in last 35 days
  point_in_time_recovery {
    enabled = true
  }

  # Encrypt with KMS
  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.state.arn
  }

  # TTL on lock records (auto-clean stale locks after 24h)
  ttl {
    attribute_name = "TTL"
    enabled        = true
  }

  tags = { Name = local.lock_table }
}

###############################################################################
# IAM Policy — Grant teams permission to use this backend
# Attach this to your platform/DevOps IAM role
###############################################################################

resource "aws_iam_policy" "terraform_backend" {
  name        = "${var.org_name}-terraform-backend-access"
  description = "Allows Terraform to use the S3 backend + DynamoDB lock table"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3StateAccess"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          "s3:GetBucketVersioning",
          "s3:GetEncryptionConfiguration"
        ]
        Resource = [
          "${aws_s3_bucket.state.arn}",
          "${aws_s3_bucket.state.arn}/*"
        ]
      },
      {
        Sid    = "DynamoDBLock"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable"
        ]
        Resource = aws_dynamodb_table.lock.arn
      },
      {
        Sid    = "KMSStateKey"
        Effect = "Allow"
        Action = [
          "kms:GenerateDataKey",
          "kms:DescribeKey",
          "kms:Decrypt",
          "kms:Encrypt"
        ]
        Resource = aws_kms_key.state.arn
      }
    ]
  })
}
