variable "aws_region" {
  default = "eu-west-3"
}

variable "project_name" {
  default = "cloud-post"
}

variable "db_username" {
  sensitive = true
}

variable "db_password" {
  sensitive = true
}