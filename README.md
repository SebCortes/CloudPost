# Cloud Post

Cloud Post is a production-ready sample web application designed to demonstrate how to build a secure full-stack application on AWS. It includes infrastructure as code with Terraform, a NestJS backend, a Next.js frontend, and a self-hosted observability stack with Grafana, Prometheus, and Loki. Users can share anonymous text posts, comment on them, and vote on them through an infinitely scrolling feed.

![CloudPost main page](./static/image.png)

## Summary

- [Technologies used](#technologies-used)
- [Engineering choices](#engineering-choices)
- [Todo](#todo)
- [Architecture](#architecture)
- [Main application](#main-application)
- [Monitoring and Observability](#monitoring-and-observability)
- [CI/CD](#ci--cd)
- [Possible improvements](#possible-improvements)
- [Deployment](#deployment)

## Technologies used

- **Frontend**: [Next.js](https://github.com/vercel/next.js/)
- **Backend**: [Nest.js](https://github.com/nestjs/nest)
- **Database**: [PostgreSQL](https://github.com/postgres/postgres)
- **Infrastructure**: [Terraform](https://github.com/hashicorp/terraform)
- **Observability**: [Grafana](https://github.com/grafana/grafana), [Prometheus](https://github.com/prometheus/prometheus), [Loki](https://github.com/grafana/loki)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) and [AWS ECR](https://aws.amazon.com/fr/ecr/)

## Engineering choices

This project is intentionally built with a few practical patterns that make it easier to maintain, debug, and scale.

### Backend

- **NestJS** for built-in software development best practices, including dependency injection, structured architecture, route decorators, and pipe-based validation.
- **DTOs + Zod** for body, query, and param validation, with Zod pipes to validate and format incoming data at the edge.
- **Prisma** as the ORM for its simple integration with NestJS and its built-in migration system, which keeps schema changes safe and versioned.
- **/health** route for simple liveness checks and infrastructure monitoring.
- **Logger middleware** to centralize logging during both development and production, making request debugging and tracing easier.
- **Swagger** decorators to generate interactive API documentation at **/swagger**, with **/swagger/yaml** and **/swagger/json** (available in development mode only).
- **robots.txt** route to discourage indexing and reduce unwanted bot traffic.
- **Environment validation** with **ConfigModule**, **class-validator**, and **class-transformer** to keep runtime configuration type-safe.
- **AWS RDS certificate via Terraform** to ensure secure database connections in production, with conditional validation that allows local development without the certificate.

### Frontend

- **Next.js** for a scalable React framework that supports SSR, CSR, and fast iteration on the same codebase.
- **SSR with initial API fetches and caching** to improve first-load performance and reduce repeated requests.
- **Shared components** across the application to keep the UI consistent and avoid duplication.
- **Tailwind CSS** and **Turbopack** to speed up UI development and local feedback loops.
- **Axios** for centralized API communication logic and consistent request handling.

### AWS infrastructure

- **ECS Fargate** for a serverless container orchestration service that abstracts away server management and allows for easy scaling.
- **ECR** for a fully managed container registry to store and manage Docker images.
- **ALB** for a highly available load balancer that can route traffic to multiple services and handle SSL termination.
- **RDS** for a managed relational database service that provides scalability, availability, and security for the PostgreSQL database.
- **CloudFront** for a global content delivery network to serve the frontend with low latency and high transfer speeds.
- **Terraform** for infrastructure as code to automate the provisioning and management of AWS resources in a consistent and repeatable way.
- **Secrets Manager** for secure storage and management of sensitive information like database credentials, with seamless integration into ECS task definitions.


## TODO

> [!NOTE]
> This project is about 90% complete, with only the Grafana observability stack left to implement. Everything else is production-ready and can be deployed to AWS as-is.
- [x] Backend done
- [x] Frontend done
- [x] Add documentation to NestJS
- [x] Terraform code for AWS infrastructure setup
- [x] Validate terraform code by deploying to AWS and testing the app
- [ ] Observability stack with Grafana, Prometheus and Loki

## AWS Architecture

This microservice architecture is designed for a simple web application. It could be enhanced with more sophisticated features (see the [Possible improvements](#possible-improvements) section) and by referring to the AWS documentation (see [AWS Reference Architecture Diagrams](https://aws.amazon.com/fr/architecture/reference-architecture-diagrams/)).

### Main application

![Main application architecture](./static/architecture_diagram.png)

### Monitoring and Observability

The self-hosted observability stack is deployed on AWS, with Grafana for visualization, Prometheus for metrics collection, and Loki for log aggregation. It is deployed in a private network, with access restricted to developers through a secure VPN connection.
- A managed PostgreSQL database using Amazon RDS could be used to store the required data and AWS Secrets Manager to manage the credentials for the database.
- Kafka could also be used to handle high volumes of logs and metrics, but for simplicity, I would use Prometheus and Loki directly to scrape and collect data from the application.

![Monitoring and Observability](./static/monitoring_observability.png)

### CI / CD

This is a simple CI/CD pipeline using GitHub Actions to build and push Docker images to AWS ECR. ECS Fargate then pulls the latest images and deploys the application. The pipeline should be triggered on every push to the main branch and include stages for building, testing, and deploying the application.

![CI / CD](./static/ci_cd.png)

## Possible improvements

As this is a simple sample application, some features have not been implemented. The following additions could make the architecture more scalable and production-ready:

- **CloudFront & WAF**: Could be added to protect against common web exploits
- **API Gateway**: Could be added as an initial entry point for improved routing, caching, and security. It could also be coupled with an S3 bucket to serve static assets
- **AWS CodeDeploy and CodeBuild**: For a more robust CI/CD pipeline at scale (blue/green deployments and custom deployment stages), AWS CodeDeploy and CodeBuild could be used
- **Mailing**: Use a third-party service like Brevo, SendGrid or AWS SES
- **Multi-region Deployment**
- **AWS KMS** for RDS data encryption
- **CDN**: Could be added to serve static assets and improve performance for users around the world
- **SSL/TLS**: Could be added using AWS Certificate Manager, to be used over the internet and between services
- **Event queue**: For highly scalable applications, an event queue like Kafka could be added
- **Data Pipeline**: A data pipeline for analytics may be added to gather insights (see [medallion architecture](https://www.databricks.com/blog/what-is-medallion-architecture)).
- **Orchestration**: For complex applications, an orchestration tool could be added to manage workflows with dependencies between services
- **Kubernetes**: For better scalability and management of containerized applications, Kubernetes can be used instead of EC2 instances
- **Proper code pipeline**: The current CI/CD pipeline is very basic and should be improved for production use, with proper testing stages, a staging environment, and manual approval before production deployment
- **Backup and Disaster Recovery**: Backup strategies and a disaster recovery plan should be implemented to ensure business continuity in case of failures.

# Deployment

## Local deployment

The application can be deployed locally using Docker Compose. This is useful for development and testing purposes, but not recommended for production use.

### Configure environment variables

Create a `.env` file in the root of the project by first copying the `example.env` file.

```
cp example.env .env
```

Then fill in the required values depending on your local setup.

### Start the application using Docker Compose

```bash
./local-setup.sh
```

## Local development

Install dependencies:
```bash
cd cloud-post-api && npm ci && cd ../cloud-post-front && npm ci && cd ..
```

Build images:
```bash
docker compose build
```

Run the database:
```bash
docker compose up -d cloud-post-db
```

Apply database migrations (`.env` should contain the database URL variable):
```bash
cd cloud-post-api && npx env-cmd -f ../.env npx prisma migrate dev && cd ..
```

Start the backend:
```bash
cd cloud-post-api && npx prisma generate && npm run start:dev
```

Start the frontend:
```bash
cd cloud-post-front && npm run dev
```

## AWS setup

### Prerequisites

- AWS CLI configured (`aws configure` and `aws login` to authenticate)
- Terraform installed (>= 1.5)
- Docker installed
- An AWS account with sufficient permissions for:
  - ECS
  - ECR
  - ALB
  - RDS
  - CloudFront
  - IAM
  - Secrets Manager

## Production deployment with single command

The root-level [`prod-deploy.sh`](prod-deploy.sh) script wraps all commands needed to deploy the application to AWS. It uses Terraform to provision the infrastructure, builds Docker images for both the frontend and backend, pushes them to ECR, and triggers ECS deployments.

Run it from the repository root:

```bash
./prod-deploy.sh <command> [options]
```

Usage:

- `./prod-deploy.sh` or `./prod-deploy.sh help`: show the script help
- `./prod-deploy.sh apply`: apply Terraform, build both Docker images, and push them to ECR
- `./prod-deploy.sh apply --redeploy`: do the same as `apply`, then force a new ECS deployment for both services
- `./prod-deploy.sh redeploy back`: rebuild, push, and redeploy only the backend service
- `./prod-deploy.sh redeploy front`: rebuild, push, and redeploy only the frontend service
- `./prod-deploy.sh destroy`: destroy the Terraform-managed AWS infrastructure

Optional overrides:

- `AWS_REGION` defaults to `eu-west-3`
- `CLUSTER_NAME` defaults to `cloud-post-cluster`
- `FRONTEND_SERVICE_NAME` defaults to `frontend-service`
- `BACKEND_SERVICE_NAME` defaults to `backend-service`

Example:

```bash
AWS_REGION=eu-west-3 ./prod-deploy.sh apply --redeploy
```

## Manual production deploy

### 1. Terraform workflow

All Terraform commands must be executed from the `terraform/` directory.

#### Initialize Terraform

```bash
terraform init
````

#### Format and validate configuration

```bash
terraform fmt
terraform validate
```

#### Lock provider versions for all platforms

```bash
terraform providers lock -platform=darwin_arm64 -platform=linux_amd64 -platform=windows_amd64
```

#### Plan infrastructure changes

```bash
terraform plan
```

#### Apply infrastructure

```bash
terraform apply
```

Confirm with `yes` when prompted.

#### Destroy infrastructure

When you're done testing, run this command to avoid unnecessary costs:

```bash
terraform destroy
```

This will destroy all AWS resources created by Terraform.

### 2. Build and push Docker images to ECR

ECS requires container images to exist in ECR before services can start successfully.

This project currently runs the ECS tasks on ARM64 Fargate. That matches the image architecture you get when building on Apple Silicon by default.

#### Where ECS environment variables come from

- The Docker image only packages the application code and dependencies.
- Terraform injects runtime environment values into the ECS task definition.
- Secrets Manager stores sensitive values, and ECS pulls them into the container at start time.
- For local development, `docker-compose.yml` injects values directly from your `.env` file instead.

For this project:

- Backend `DATABASE_URL` comes from a Secrets Manager secret created by Terraform.
- Backend `API_PORT` and `NODE_ENV` are set directly in the ECS task definition.
- Backend `FRONT_END_DOMAIN_NAME` is set from the CloudFront URL created by Terraform.
- Frontend `NEXT_PUBLIC_API_BASE_URL` is set from the CloudFront URL plus `/api`.
- Locally, the same app reads those values from `.env` through Docker Compose.
- In production, the backend container runs `npx prisma migrate deploy` automatically before starting NestJS because `NODE_ENV=production` is injected by Terraform.

In production, the public entrypoint is the CloudFront URL shown by `terraform output cloudfront_url`.
The frontend lives at that URL, and the backend is reached through the same host under `/api`.

#### Authenticate Docker to ECR

```bash
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com
```

Replace `<AWS_ACCOUNT_ID>` with your AWS account ID.

#### Retrieve ECR repository URLs

After Terraform deployment:

```bash
terraform output frontend_ecr
terraform output backend_ecr
```

Example output:

```
1234.dkr.ecr.eu-west-3.amazonaws.com/project-frontend
1234.dkr.ecr.eu-west-3.amazonaws.com/project-backend
```

#### Build Docker images

From the repository root. If you are still inside `terraform/` after running the Terraform commands, go back first:

```bash
cd ..
```

Then build the images:

```bash
docker build -t frontend ./cloud-post-front
docker build -t backend ./cloud-post-api
```

#### Tag images for ECR

```bash
docker tag frontend:latest <FRONTEND_ECR_URL>:latest
docker tag backend:latest <BACKEND_ECR_URL>:latest
```

#### Push images to ECR

```bash
docker push <FRONTEND_ECR_URL>:latest
docker push <BACKEND_ECR_URL>:latest
```

### 3. Deployment order

Follow this order to avoid ECS startup issues:

1. `terraform init`
2. `terraform apply`
3. Build Docker images
4. Push images to ECR
5. ECS services will automatically pull and start containers

### 4. Updating the application

After making changes to the code:

#### Rebuild and push backend

```bash
docker build -t backend ./cloud-post-api
docker tag backend:latest <BACKEND_ECR_URL>:latest
docker push <BACKEND_ECR_URL>:latest
```

#### Rebuild and push frontend

```bash
docker build -t frontend ./cloud-post-front
docker tag frontend:latest <FRONTEND_ECR_URL>:latest
docker push <FRONTEND_ECR_URL>:latest
```

#### Force ECS redeployment

```bash
aws ecs update-service --region eu-west-3 --cluster <CLUSTER_NAME> --service backend-service --force-new-deployment
```

Repeat the same process for the frontend service:

```bash
aws ecs update-service --region eu-west-3 --cluster <CLUSTER_NAME> --service frontend-service --force-new-deployment
```
