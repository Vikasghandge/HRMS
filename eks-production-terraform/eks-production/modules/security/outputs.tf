output "guardduty_detector_id" { value = aws_guardduty_detector.this.id }
output "waf_web_acl_arn"       { value = aws_wafv2_web_acl.eks.arn }
output "config_bucket_name"    { value = aws_s3_bucket.config.bucket }
