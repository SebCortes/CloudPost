data "http" "rds_ca_bundle" {
  url = "https://truststore.pki.rds.amazonaws.com/eu-west-3/eu-west-3-bundle.pem"
}

resource "aws_secretsmanager_secret" "db_secret" {
  name_prefix             = "${var.project_name}-db-secret"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "db_secret_value" {
  secret_id = aws_secretsmanager_secret.db_secret.id

  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
  })
}

resource "aws_secretsmanager_secret" "database_url" {
  name_prefix             = "${var.project_name}-database-url"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database_url_value" {
  secret_id = aws_secretsmanager_secret.database_url.id

  secret_string = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.address}:5432/${aws_db_instance.postgres.db_name}?schema=public"
}

resource "aws_secretsmanager_secret" "rds_ca_cert" {
  name_prefix             = "${var.project_name}-rds-ca-cert"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "rds_ca_cert_value" {
  secret_id = aws_secretsmanager_secret.rds_ca_cert.id

  secret_string = data.http.rds_ca_bundle.response_body
}
