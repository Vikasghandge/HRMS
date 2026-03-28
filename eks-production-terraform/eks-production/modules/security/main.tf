###############################################################################
# Module: Security
# - GuardDuty (EKS runtime threat detection)
# - AWS Security Hub
# - AWS Config Rules for EKS
# - WAF WebACL (optional — attach to ALBs)
# - Falco (runtime security via Helm)
# - OPA Gatekeeper (policy enforcement)
###############################################################################

###############################################################################
# GuardDuty — EKS Audit Log + Runtime Monitoring
###############################################################################

resource "aws_guardduty_detector" "this" {
  enable = true

  datasources {
    kubernetes {
      audit_logs {
        enable = true
      }
    }
    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = true
        }
      }
    }
  }

  tags = { Name = "${var.cluster_name}-guardduty" }
}

# EKS Runtime Monitoring (agent-based — newer feature)
resource "aws_guardduty_detector_feature" "eks_runtime" {
  detector_id = aws_guardduty_detector.this.id
  name        = "EKS_RUNTIME_MONITORING"
  status      = "ENABLED"

  additional_configuration {
    name   = "EKS_ADDON_MANAGEMENT"
    status = "ENABLED"
  }
}

###############################################################################
# AWS Security Hub
###############################################################################

resource "aws_securityhub_account" "this" {}

resource "aws_securityhub_standards_subscription" "cis" {
  standards_arn = "arn:aws:securityhub:::ruleset/cis-aws-foundations-benchmark/v/1.2.0"
  depends_on    = [aws_securityhub_account.this]
}

resource "aws_securityhub_standards_subscription" "aws_foundational" {
  standards_arn = "arn:aws:securityhub:${var.aws_region}::standards/aws-foundational-security-best-practices/v/1.0.0"
  depends_on    = [aws_securityhub_account.this]
}

###############################################################################
# WAF WebACL — attach to ALBs created by AWS LBC
###############################################################################

resource "aws_wafv2_web_acl" "eks" {
  name  = "${var.cluster_name}-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # AWS Managed Rules — Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules — Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesKnownBadInputsRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # Rate limiting — 2000 req/5min per IP
  rule {
    name     = "RateLimit"
    priority = 3

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.cluster_name}-waf"
    sampled_requests_enabled   = true
  }

  tags = { Name = "${var.cluster_name}-waf" }
}

###############################################################################
# Falco — Runtime Security (via Helm)
###############################################################################

resource "helm_release" "falco" {
  name             = "falco"
  repository       = "https://falcosecurity.github.io/charts"
  chart            = "falco"
  namespace        = "security"
  create_namespace = false
  version          = "4.2.2"

  values = [yamlencode({
    driver = {
      kind = "ebpf"
    }

    collectors = {
      kubernetes = {
        enabled = true
      }
    }

    falcosidekick = {
      enabled = true
      config = {
        slack = {
          webhookurl = ""   # Set your Slack webhook
          outputformat = "all"
        }
      }
    }

    tolerations = [{
      operator = "Exists"
      effect   = "NoSchedule"
    }]
  })]
}

###############################################################################
# OPA Gatekeeper — Policy Enforcement
###############################################################################

resource "helm_release" "gatekeeper" {
  name             = "gatekeeper"
  repository       = "https://open-policy-agent.github.io/gatekeeper/charts"
  chart            = "gatekeeper"
  namespace        = "gatekeeper-system"
  create_namespace = true
  version          = "3.15.1"

  values = [yamlencode({
    replicas = 3

    resources = {
      requests = { cpu = "100m", memory = "256Mi" }
      limits   = { cpu = "1000m", memory = "512Mi" }
    }

    auditInterval = 60
    logLevel      = "WARNING"
  })]
}

###############################################################################
# AWS Config — EKS compliance rules
###############################################################################

resource "aws_config_configuration_recorder" "this" {
  name     = "${var.cluster_name}-config-recorder"
  role_arn = aws_iam_role.config.arn

  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }
}

resource "aws_iam_role" "config" {
  name = "${var.cluster_name}-config-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "config.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "config" {
  role       = aws_iam_role.config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWS_ConfigRole"
}

resource "aws_s3_bucket" "config" {
  bucket        = "${var.cluster_name}-config-${var.account_id}"
  force_destroy = false

  tags = { Name = "${var.cluster_name}-config" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "config" {
  bucket = aws_s3_bucket.config.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "config" {
  bucket = aws_s3_bucket.config.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "config" {
  bucket                  = aws_s3_bucket.config.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_config_delivery_channel" "this" {
  name           = "${var.cluster_name}-delivery-channel"
  s3_bucket_name = aws_s3_bucket.config.bucket
  depends_on     = [aws_config_configuration_recorder.this]
}

resource "aws_config_configuration_recorder_status" "this" {
  name       = aws_config_configuration_recorder.this.name
  is_enabled = true
  depends_on = [aws_config_delivery_channel.this]
}

# EKS-specific config rules
resource "aws_config_config_rule" "eks_endpoint_no_public_access" {
  name        = "eks-endpoint-no-public-access"
  description = "Checks whether EKS endpoint is not publicly accessible"

  source {
    owner             = "AWS"
    source_identifier = "EKS_ENDPOINT_NO_PUBLIC_ACCESS"
  }

  depends_on = [aws_config_configuration_recorder_status.this]
}

resource "aws_config_config_rule" "eks_secrets_encrypted" {
  name        = "eks-secrets-encrypted"
  description = "Checks that EKS clusters have envelope encryption for secrets"

  source {
    owner             = "AWS"
    source_identifier = "EKS_SECRETS_ENCRYPTED"
  }

  depends_on = [aws_config_configuration_recorder_status.this]
}
