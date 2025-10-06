# 🪣 Access S3 from a VPC

This project shows how to **access Amazon S3 from inside a VPC using an EC2 instance**.  
You will create a VPC with a public subnet, launch an EC2 instance, create an S3 bucket with sample files, configure **AWS CLI credentials** (Access Keys) on the EC2 instance, and then use CLI commands to interact with S3.

<img width="1333" height="773" alt="Access _S3 _from_ _a_ VPC" src="https://github.com/user-attachments/assets/c79e1558-123f-4071-ac0b-7ee01d032e26?raw=true" />


---

## ⭐ Goals
By following this README, you will:

- Build a **NextWork-VPC** (CIDR `10.0.0.0/16`) using **VPC and more** wizard.  
- Launch an **EC2 instance** in the public subnet of this VPC.  
- Create an **S3 bucket** and upload **two sample files**.  
- Generate **AWS Access Keys** (Access Key ID + Secret Key) in IAM to give the EC2 instance permission to use AWS CLI.  
- Configure **AWS CLI** on the EC2 instance and list bucket contents.  
- **Upload** a test file from EC2 to the S3 bucket using CLI.  

> 💡 This project demonstrates how VPC-based resources (like EC2) can securely talk to AWS services that live **outside** the VPC, such as S3.

---

## 🛠 AWS Services Used
- **Amazon VPC** – create an isolated network (NextWork-VPC)
- **Amazon EC2** – launch a Linux instance inside the VPC
- **Amazon S3** – object storage service (create bucket & store files)
- **AWS CLI** – interact with S3 from EC2’s terminal
- **IAM Access Keys** – grant EC2 permissions to access S3

---

## 🔑 Prerequisites
- An **AWS account** with admin-level IAM user  
- Completion of the earlier VPC networking labs:  
  1. Build a VPC  
  2. VPC Traffic Flow & Security  
  3. Launching VPC Resources  
  4. Testing VPC Connectivity  
- Use the **same AWS Region** for VPC, EC2, and S3.  
---

## 📦 Resource Naming
Use these names to follow the guide exactly:
- VPC: **My-VPC**
- Subnet: **My-Public-Subnet**
- EC2 Instance: **Public Server**
- Security Group: **SG – VPC Project**
- S3 Bucket: **vpc-aws-s3-bucket**
- Access Key description: *Access key to access an S3 bucket from an EC2 instance – my VPC project*

---

# 🚀 Step-by-Step Guide

### Step 1 — Create a VPC & EC2 Instance
1. Go to **VPC Console → Create VPC → VPC and more**  
2. **Name:** `My-VPC`  
   - IPv4 CIDR: `10.0.0.0/16` (default)  
   - AZs: 1  Public subnets: 1  Private subnets: 0  
   - NAT Gateways: None VPC endpoints: None  
   - Leave DNS options checked → **Create VPC**

📸 

<img width="1624" height="841" alt="Screenshot 2025-10-05 153751" src="https://github.com/user-attachments/assets/2a086d09-6011-4947-808f-f18a0c8a14df?raw=true" />


3. Go to **EC2 Console → Launch instances**  
   - **Name:** `Public Server`  
   - **AMI:** Amazon Linux 2023  Type: `t2.micro`  
   - Key pair: *Proceed without key pair* (lab uses EC2 Instance Connect)  
   - **Network settings → Edit:**  
     - VPC: `My-VPC`  
     - Subnet: public subnet created above  
     - Auto-assign public IP: **Enable** (needed for EC2 Instance Connect)  
   - **Firewall / Security group → Create new SG:**  
     - Name: `SG –  VPC Project`  
     - Inbound rule: **SSH (22)** from My IP  
       (No ICMP rule required for this project)  
   - **Launch instance**

---

### Step 2 — Connect to EC2 Instance
1. In **EC2 → Instances**, select your instance → **Connect → EC2 Instance Connect → Connect**  
2. You should land in the EC2 terminal.  

Test AWS CLI by running:
```bash
aws s3 ls

```
Expected: an error asking for credentials.

---

## Step 3 — Create IAM Access Keys

1. Go to **IAM Console → Access keys → Create access key** for your IAM Admin User.  
2. Select **Command Line Interface (CLI)** → check the warning box → **Next**.  
3. **Description:** `Access key to access an S3 bucket from an EC2 Public Server`  
4. Click **Create access key → Download CSV file → keep it safe.**

⚠️ **Important:** This is the only time you can view or download the **Secret Access Key**.  
> 💡 **Best Practice:** In production, use **IAM roles** for EC2 instead of long-term access keys.  

---

## Step 4 — Create an S3 Bucket & Upload 2 Files

1. Go to **S3 Console → Create bucket**.  
2. **Bucket name:** `vpc-aws-s3-bucket` *(must be globally unique)*  
3. **Bucket type:** General purpose → **Create bucket**.  
4. Open your new bucket → click **Upload → Add files → select 2 local files → Upload**.

📸 
<img width="1877" height="863" alt="Screenshot 2025-10-05 172700" src="https://github.com/user-attachments/assets/e01089d2-e69d-48e6-b5d9-9ca0d9a6faad?raw=true" />

---

## Step 5 — Configure AWS CLI in EC2

Back in your EC2 terminal, configure AWS CLI:

```bash
aws configure
```
Provide the following when prompted:

Paste Access Key ID from CSV → press Enter

Paste Secret Access Key → press Enter

Enter your Default Region (e.g., us-east-1) → press Enter

Leave default output format empty → press Enter

Re-run to verify connection:
```
aws s3 ls
```
✅ You should now see your S3 bucket name listed.

---
## Step 6 — List Objects & Upload from EC2

List objects inside your S3 bucket:
```
aws s3 ls s3://vpc-aws-s3-bucket

```
✅ You should see the 2 uploaded files.

Create a test file in EC2 and upload it:
```
sudo touch /tmp/test.txt
aws s3 cp /tmp/test.txt s3://vpc-aws-s3-bucket
```
List objects again to confirm upload:
```
aws s3 ls s3://vpc-aws-s3-bucket

```

✅ test.txt appears with size 0 bytes (empty file).

Go to your S3 Console → Objects tab → refresh → test.txt is visible.

📸 
<img width="1899" height="866" alt="Screenshot 2025-10-05 180918" src="https://github.com/user-attachments/assets/66632a15-adc2-415c-b144-9a7b9745194b?raw=true" />

---

## 📝 Key Concepts

- AWS CLI: Command-line tool to manage AWS services from EC2 or local machine.

- Access Keys: Credential pair (Access Key ID + Secret Access Key) for programmatic AWS access.

- EC2 Instance Connect: Allows SSH access to EC2 without a key-pair file.

- S3 Integration: EC2 inside a VPC can interact with S3 (outside VPC) via the internet using proper credentials.

> ⚠️ Security Tip: For production workloads, always use IAM roles for EC2 instances instead of storing long-term access keys.
