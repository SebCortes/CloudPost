terraform {
  required_version = ">= 1.15.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.45.0"
    }
    http = {
      source  = "hashicorp/http"
      version = "~> 3.4.5"
    }
  }
}

provider "aws" {
  region = var.aws_region
}