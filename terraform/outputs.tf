output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "cloudfront_url" {
  value = aws_cloudfront_distribution.main.domain_name
}

output "frontend_ecr" {
  value = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr" {
  value = aws_ecr_repository.backend.repository_url
}
