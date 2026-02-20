# 🚢 Deploying a Flask Backend to Kubernetes on AWS EKS

> **Provision, containerize, register, orchestrate, and deploy  fully automated across AWS infrastructure..**

---

## The Problem

You've got backend code sitting in a GitHub repository. Your team wants it running reliably in production. But "just run the app" doesn't cut it when you need it to:

- Scale up under load without manual intervention
- Run identically across development, staging, and production
- Recover automatically if a container crashes
- Stay accessible even as individual servers come and go

Running it on a single EC2 instance works until it doesn't. The moment that instance goes down, your backend goes with it. And manually spinning up replacements, load balancing traffic between them, and keeping container versions consistent across nodes? That's a full-time job.

**There had to be a better way to manage containers at scale.**

---

## The Solution

This project walks through deploying a Python Flask backend using **Amazon EKS (Elastic Kubernetes Service)** — AWS's managed Kubernetes platform. Kubernetes handles the hard parts: scheduling containers across nodes, restarting failed pods, and keeping your desired number of replicas running at all times.

The full pipeline:

1. Launch an EC2 instance as a control environment
2. Clone the backend code from GitHub
3. Build a Docker container image from the code
4. Push the image to Amazon ECR (a private container registry)
5. Write Kubernetes manifest files that describe how to deploy and expose the app
6. Apply those manifests to a live EKS cluster using `kubectl`
7. Verify the deployment in the EKS console — right down to individual pods

---

## Architecture Overview

> **Screenshot: EKS Cluster Overview**
> <img width="1189" height="699" alt="Screenshot 2026-02-20 100132" src="https://github.com/user-attachments/assets/7a707f1f-3274-4c00-b15e-1a441dbae2b0?raw=true" />


---

## Services & Tools Used

| Tool / Service | What It Does in This Project |
|---|---|
| **Amazon EKS** | Managed Kubernetes control plane — orchestrates containers across nodes |
| **Amazon ECR** | Private container registry — stores the Docker image for EKS to pull |
| **Amazon EC2** | Acts as the control environment for running CLI commands |
| **Docker** | Builds the container image from the Flask app's Dockerfile |
| **eksctl** | CLI tool for creating and managing the EKS cluster |
| **kubectl** | CLI tool for deploying apps and managing resources within the cluster |
| **Git** | Clones the backend source code from GitHub to the EC2 instance |
| **AWS IAM** | Grants the EC2 instance permission to interact with AWS services |

---

## What I Built  Step by Step

---

### Step 1  Launch an EC2 Instance and Create the EKS Cluster

The first challenge: you need a machine with the right credentials to talk to AWS and spin up a Kubernetes cluster. Rather than configuring the AWS CLI on a local machine, I launched an EC2 instance (`t3.micro`, Amazon Linux 2023) and attached an IAM role with `AdministratorAccess` — giving the instance permission to create and manage AWS resources on my behalf.

From there, I installed `eksctl`, the purpose-built CLI for EKS cluster management:

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin
```

Then launched the cluster — a 3-node setup using `t3.micro` instances:

```bash
eksctl create cluster \
  --name nextwork-eks-cluster \
  --nodegroup-name nextwork-nodegroup \
  --node-type t3.micro \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 3 \
  --version 1.33 \
  --region your-region-code
```

This takes around 15–20 minutes. EKS is provisioning the control plane, worker nodes, networking, and IAM integration in the background.

> **Screenshot: EKS cluster creation running in EC2 Instance Connect**
> <img width="1522" height="948" alt="Screenshot 2026-02-20 080945" src="https://github.com/user-attachments/assets/d601334c-6bd4-4282-bf59-cb60a66d102d?raw=true" />


---

### Step 2  Clone the Backend Code from GitHub

While the cluster was initializing, I opened a second EC2 Instance Connect session (you can run multiple sessions on the same instance simultaneously) and pulled the backend code:

```bash
sudo dnf install git -y
git clone https://github.com/your-team-member/nextwork-flask-backend
cd nextwork-flask-backend
ls
```

The repository contains a Flask web application, a `Dockerfile` defining how to containerize it, and a `requirements.txt` listing its Python dependencies. The code itself isn't the focus here  what matters is that it exists and has a Dockerfile ready to build from.

> **Screenshot: Cloned repository contents listed in terminal**
> <img width="1575" height="534" alt="Screenshot 2026-02-20 092722" src="https://github.com/user-attachments/assets/af39ece2-122b-4559-8bd7-b316c589e477?raw=true" />


---

### Step 3  Build a Docker Container Image

Kubernetes doesn't run code directly — it runs containers built from images. The `Dockerfile` in the repository contains the build instructions; Docker executes them to produce a portable, self-contained image of the application:

```bash
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
# (reconnect session to apply group change)
docker build -t nextwork-flask-backend .
```

Adding `ec2-user` to the Docker group is a small but important step — it means you can run Docker commands without prefixing every single one with `sudo`, which reduces friction and is considered better security practice than relying on root access for routine commands.

The resulting image packages the Flask app, its Python runtime, and all dependencies together. This image will behave identically whether it runs on one node or thirty.

> **Screenshot: Docker build completing successfully**
> <img width="1919" height="896" alt="Screenshot 2026-02-20 093458" src="https://github.com/user-attachments/assets/120a28c3-22b3-4aaa-a4bc-4c37db7c8732?raw=true" />


---

### Step 4  Push the Container Image to Amazon ECR

A container image sitting on the EC2 instance isn't accessible to a Kubernetes cluster running elsewhere. Amazon ECR is the answer  a private registry that EKS can pull from with minimal authentication setup, since both are AWS services.

First, create the ECR repository:

```bash
aws ecr create-repository \
  --repository-name nextwork-flask-backend \
  --image-scanning-configuration scanOnPush=true
```

Then authenticate Docker to ECR, tag the image, and push it using the commands from the ECR console's "View push commands" panel:

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com

# Tag the image
docker tag nextwork-flask-backend:latest your-ecr-uri:latest

# Push
docker push your-ecr-uri:latest
```

The `scanOnPush=true` flag means ECR will automatically scan the image for known vulnerabilities every time a new version is pushed  a low-effort win for security hygiene.

> **Screenshot: Container image visible in ECR repository**
> <img width="1914" height="881" alt="Screenshot 2026-02-20 094522" src="https://github.com/user-attachments/assets/713c836b-0584-4a6c-985d-c7a2c5fd3479?raw=true" />


---

### Step 5  Write the Kubernetes Manifest Files

With the image in ECR and the cluster running, the next step is telling Kubernetes *how* to deploy the app. That's what manifest files are for  YAML declarations of the desired state of resources inside the cluster.

**Deployment manifest** (`flask-deployment.yaml`) — tells Kubernetes to maintain 3 identical replicas of the Flask backend, pulling from the ECR image:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nextwork-flask-backend
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nextwork-flask-backend
  template:
    metadata:
      labels:
        app: nextwork-flask-backend
    spec:
      containers:
        - name: nextwork-flask-backend
          image: your-ecr-image-url   # ← replace with actual ECR URI
          ports:
            - containerPort: 8080
```

**Service manifest** (`flask-service.yaml`) — creates a `NodePort` Service that routes external traffic to the backend pods on port 8080:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nextwork-flask-backend
spec:
  selector:
    app: nextwork-flask-backend
  type: NodePort
  ports:
    - port: 8080
      targetPort: 8080
      protocol: TCP
```

The Deployment handles *running* the app. The Service handles *reaching* the app. Both are required  one without the other gives you either an unreachable backend or inaccessible containers.

> **Screenshot: Deployment manifest open in nano text editor**
> <img width="1919" height="876" alt="Screenshot 2026-02-20 095723" src="https://github.com/user-attachments/assets/dc2ecaa9-26e5-4653-8e4a-d6c6dc4e5973?raw=true" />

---

### Step 6  Deploy with kubectl

With the manifests written, it was time for the actual deployment. First, install `kubectl` and configure it to point at the EKS cluster:

```bash
sudo curl -o /usr/local/bin/kubectl \
  https://s3.us-west-2.amazonaws.com/amazon-eks/1.31.0/2024-09-12/bin/linux/amd64/kubectl
sudo chmod +x /usr/local/bin/kubectl

# Point kubectl at the EKS cluster
aws eks update-kubeconfig --name nextwork-eks-cluster --region your-region-code
```

The `update-kubeconfig` step is easy to miss but essential. Without it, `kubectl` tries to reach a Kubernetes API at `localhost:8080`, finds nothing, and fails. This command writes the cluster's connection details into `~/.kube/config` so `kubectl` knows where your cluster actually lives.

Then apply both manifests:

```bash
kubectl apply -f flask-deployment.yaml
kubectl apply -f flask-service.yaml
```

> **Screenshot: kubectl apply output — deployment and service created**
><img width="1919" height="181" alt="Screenshot 2026-02-20 095845" src="https://github.com/user-attachments/assets/18b5b664-07fd-4133-95cd-11072fd8ac4b?raw=true" />
 
---

### Step 7  Verify the Deployment in the EKS Console

Applying the manifests sends instructions to Kubernetes, but how do you confirm it actually worked?

I navigated to the EKS console to inspect the cluster from the inside. One important gotcha here: **AWS IAM permissions and Kubernetes RBAC are entirely separate systems.** Having `AdministratorAccess` in AWS doesn't automatically grant visibility into cluster internals. I had to explicitly map my IAM user to Kubernetes' `system:masters` group:

```bash
eksctl create iamidentitymapping \
  --cluster nextwork-eks-cluster \
  --arn your-iam-user-arn \
  --group system:masters \
  --username admin \
  --region your-region-code
```

After that, the EKS console showed all three nodes in the node group. Drilling into each node revealed the running pods, and the Events panel for each pod confirmed the full lifecycle played out as expected:

- Pod assigned an internal cluster IP ✓
- Container image pulled from ECR ✓
- Container created and started ✓

The backend was live and running inside the cluster.

> **Screenshot: EKS console showing nodes in the node group**
> <img width="1415" height="711" alt="Screenshot 2026-02-20 091529" src="https://github.com/user-attachments/assets/c049e1a6-d981-4db6-b032-e1d7ea62e8e2?raw=true" />


> **Screenshot: Pod Events panel confirming successful deployment**
> <img width="1919" height="941" alt="Screenshot 2026-02-20 090702" src="https://github.com/user-attachments/assets/1d4ddba1-16b5-4439-8e7a-17e2dd958bdc?raw=true" />


---

## Key Takeaways

**Why not just run the app on EC2 directly?**
A single EC2 instance is a single point of failure. Kubernetes distributes the app across multiple nodes and automatically reschedules pods if a node goes down. You get resilience without manual intervention.

**Why does Kubernetes need a container image in a registry?**
Kubernetes manages nodes that can be created and destroyed dynamically. Each node that comes online needs to pull and run the same containers. A registry like ECR gives every node a consistent, accessible source of truth for the image — no manual preloading required.

**eksctl vs kubectl — what's the difference?**
`eksctl` manages cluster infrastructure (create, delete, scale node groups). `kubectl` manages what runs *inside* the cluster (deploy apps, inspect pods, apply manifests). You need both, and they serve completely different purposes.

**Why is Kubernetes RBAC separate from AWS IAM?**
Kubernetes has its own access control layer that is independent of AWS. Even as an AWS administrator, you need to be explicitly mapped into the Kubernetes access system before you can inspect or manage cluster resources. This separation is intentional  it limits blast radius if either system is compromised.

---

## Cleanup

To avoid unexpected charges, delete resources in this order:

```bash
# Delete the EKS cluster and all associated resources
eksctl delete cluster --name nextwork-eks-cluster --region your-region-code
```

Then in the AWS console:

- [ ] Terminate the `nextwork-eks-instance` EC2 instance
- [ ] Delete the `nextwork-flask-backend` ECR repository
- [ ] Check the EC2 console for any leftover Elastic IP addresses and release them
- [ ] Confirm all CloudFormation stacks are fully removed

---
