
---

# application_cluster Folder Documentation

## Overview

The application_cluster directory contains the Terraform and Kubernetes resources required to provision, configure, and manage the core application cluster infrastructure on AWS. This includes the setup of compute clusters, networking, IAM roles, storage, monitoring, ingress, and backup resources. The folder is structured to support modular, reusable, and environment-specific deployments, following best practices for infrastructure-as-code and GitOps.

12345

## Folder Structure

```
application_cluster/
├── .terraform.lock.hcl
├── alb.tf
├── cluster.tf
├── IAM_S3LogWritter.tf
├── main.tf
├── outputs.tf
├── README.md
├── rke2.yaml
├── setup-env.md
├── manifests/
│   ├── 00_set-namespace.yaml
│   ├── ingress/
│   │   ├── 06_argocd.yaml
│   │   ├── 06_loki.yaml
│   │   └── 06_prometheus.yaml
│   ├── middleware/
│   │   └── traefik_middleware.yml
│   └── values/
│       ├── argocd.yaml
│       ├── aws_csi_values.yaml
│       ├── gha_runner_values.yaml
│       ├── loki_values.yaml
│       ├── prometheus_values.yaml
│       ├── sftpgo_values.yaml
│       ├── traefik_values.yml
│       └── velero_values.yaml
├── rke2-aws-tf/
│   ├── .terraform-docs.yml
│   ├── data.tf
│   ├── main.tf
│   ├── outputs.tf
│   ├── variables.tf
│   ├── versions.tf
│   └── modules/
│       ├── agent-nodepool/
│       ├── common/
│       ├── nlb/
│       ├── nodepool/
│       ├── policies/
│       ├── statestore/
│       └── userdata/
└── s3-backup/
    ├── main.tf
    └── variables.tf
```

## Key Components

### Top-Level Files

- **main.tf, alb.tf, cluster.tf, IAM_S3LogWritter.tf, outputs.tf**: Core Terraform files for defining AWS infrastructure, including clusters, load balancers, IAM roles, and outputs.
- **README.md**: High-level documentation for the folder.
- **rke2.yaml**: Kubernetes RKE2 cluster configuration.
- **setup-env.md**: Environment setup instructions for developers and CI/CD.

### `manifests/`

Contains Kubernetes manifests and Helm values for deploying and configuring cluster services:
- **00_set-namespace.yaml**: Namespace definitions.
- **ingress/**: Ingress resources for ArgoCD, Loki, and Prometheus.
- **middleware/**: Middleware configuration for Traefik.
- **values/**: Helm values for various services (ArgoCD, AWS CSI, GitHub Actions Runner, Loki, Prometheus, SFTPGo, Traefik, Velero).

### `rke2-aws-tf/`

A submodule for provisioning RKE2 clusters on AWS using Terraform:
- **Terraform files**: Define data sources, variables, versions, and outputs.
- **modules/**: Modular Terraform code for agent node pools, network load balancers, node pools, IAM policies, state storage, and user data scripts.

### `s3-backup/`

Contains Terraform code for managing S3-based backup resources for the cluster.

## Purpose

This folder is designed to:

- Provision and manage a secure, scalable Kubernetes (RKE2) cluster on AWS.
- Automate the deployment of essential cluster services (monitoring, ingress, backup, CI/CD).
- Enable GitOps workflows using ArgoCD and Helm.
- Support modular, environment-specific infrastructure deployments.
- Provide reusable Terraform modules for common AWS and Kubernetes resources.

## Usage

- **Terraform**: Run `terraform init` and `terraform apply` in the relevant directories to provision infrastructure.
- **Kubernetes**: Apply manifests in the `manifests/` directory to configure cluster services.
- **CI/CD**: This folder is structured for integration with CI/CD pipelines, including Confluence documentation publishing.

---

This documentation provides a high-level overview and structure explanation for the application_cluster folder. For more details, refer to the README.md files and inline comments within each subdirectory.