#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$ROOT_DIR/terraform"
AWS_REGION="${AWS_REGION:-eu-west-3}"
CLUSTER_NAME="${CLUSTER_NAME:-cloud-post-cluster}"
FRONTEND_SERVICE_NAME="${FRONTEND_SERVICE_NAME:-frontend-service}"
BACKEND_SERVICE_NAME="${BACKEND_SERVICE_NAME:-backend-service}"

# Disable the AWS CLI pager so command output does not pause for interactive input.
export AWS_PAGER=""

usage() {
  cat <<'EOF'
Usage:
  ./prod-deploy.sh apply [--redeploy]
  ./prod-deploy.sh redeploy <back|front>
  ./prod-deploy.sh destroy

Commands:
  apply             Apply Terraform, build both Docker images, and push them to ECR.
                    Use --redeploy to force a new ECS deployment after pushing.
  redeploy back     Rebuild, push, and force a new ECS deployment for the backend only.
  redeploy front    Rebuild, push, and force a new ECS deployment for the frontend only.
  destroy           Destroy the Terraform-managed infrastructure.
EOF
}

log() {
  printf '\n[%s] %s\n' "$(date +'%H:%M:%S')" "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_command aws
require_command docker
require_command terraform

build_and_push_frontend() {
  log "Building and pushing frontend image"
  docker buildx build --platform linux/arm64 --load -t "$FRONTEND_ECR_URL:latest" "$ROOT_DIR/cloud-post-front"
  docker push "$FRONTEND_ECR_URL:latest"
}

build_and_push_backend() {
  log "Building and pushing backend image"
  docker buildx build --platform linux/arm64 --load -t "$BACKEND_ECR_URL:latest" "$ROOT_DIR/cloud-post-api"
  docker push "$BACKEND_ECR_URL:latest"
}

force_redeploy_backend() {
  log "Forcing ECS redeployment for backend"
  aws --no-cli-pager ecs update-service --region "$AWS_REGION" --cluster "$CLUSTER_NAME" --service "$BACKEND_SERVICE_NAME" --force-new-deployment
}

force_redeploy_frontend() {
  log "Forcing ECS redeployment for frontend"
  aws --no-cli-pager ecs update-service --region "$AWS_REGION" --cluster "$CLUSTER_NAME" --service "$FRONTEND_SERVICE_NAME" --force-new-deployment
}

load_terraform_outputs() {
  FRONTEND_ECR_URL="$(terraform -chdir="$TERRAFORM_DIR" output -raw frontend_ecr)"
  BACKEND_ECR_URL="$(terraform -chdir="$TERRAFORM_DIR" output -raw backend_ecr)"
}

command="${1:-}"

if [[ -z "$command" ]]; then
  usage
  exit 0
fi

case "$command" in
  apply)
    redeploy_after_push="${2:-}"

    if [[ $# -gt 2 ]]; then
      usage
      exit 1
    fi

    if [[ -n "$redeploy_after_push" && "$redeploy_after_push" != "--redeploy" ]]; then
      usage
      exit 1
    fi

    log "Using AWS region: $AWS_REGION"
    log "Initializing Terraform"
    terraform -chdir="$TERRAFORM_DIR" init -input=false

    log "Applying Terraform"
    terraform -chdir="$TERRAFORM_DIR" apply -auto-approve

    log "Reading Terraform outputs"
    load_terraform_outputs

    AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text --region "$AWS_REGION")"
    ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

    log "Logging Docker into ECR registry $ECR_REGISTRY"
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

    build_and_push_frontend
    build_and_push_backend

    if [[ "$redeploy_after_push" == "--redeploy" ]]; then
      force_redeploy_backend
      force_redeploy_frontend
    fi

    log "Deployment complete"
    log "CloudFront URL: $(terraform -chdir="$TERRAFORM_DIR" output -raw cloudfront_url)"
    ;;
  redeploy)
    if [[ $# -ne 2 ]]; then
      usage
      exit 1
    fi

    log "Using AWS region: $AWS_REGION"
    log "Initializing Terraform"
    terraform -chdir="$TERRAFORM_DIR" init -input=false

    load_terraform_outputs

    AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text --region "$AWS_REGION")"
    ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

    log "Logging Docker into ECR registry $ECR_REGISTRY"
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

    service_name="${2:-}"

    case "$service_name" in
      back|backend)
        build_and_push_backend
        force_redeploy_backend
        ;;
      front|frontend)
        build_and_push_frontend
        force_redeploy_frontend
        ;;
      *)
        echo "Invalid service name: $service_name" >&2
        usage
        exit 1
        ;;
    esac

    log "Redeploy complete"
    ;;
  destroy)
    if [[ $# -ne 1 ]]; then
      usage
      exit 1
    fi

    log "Using AWS region: $AWS_REGION"
    log "Initializing Terraform"
    terraform -chdir="$TERRAFORM_DIR" init -input=false

    log "Destroying Terraform infrastructure"
    terraform -chdir="$TERRAFORM_DIR" destroy -auto-approve
    log "Destroy complete"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac
