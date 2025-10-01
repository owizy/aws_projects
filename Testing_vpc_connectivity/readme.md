# 🌐 AWS VPC Setup & Testing Connectivity 

This project demonstrates how to **create a complete VPC network using AWS “VPC and more”**, launch EC2 instances in public and private subnets, and **test connectivity** between the instances and the internet.

<img width="944" height="832" alt="vpc_connectivity" src="https://github.com/user-attachments/assets/1d310fc7-2158-48b8-8509-763f2c5e313f?raw=true" />

---

## 📖 Project Overview
In this project, I:
- Used **VPC and more** to quickly create a **custom VPC**
- Configured **Public and Private Subnets**
- Set up **Route Tables** and an **Internet Gateway (IGW)**
- Configured **Network ACLs (NACLs)** for subnet-level security
- Configured **Security Groups (SGs)** for instance-level security
- Launched **EC2 instances** in both subnets
- Tested **internal connectivity** with `ping`
- Verified **internet connectivity** from the public subnet using `curl`
- Practiced troubleshooting of **NACLs and SGs**

> 💡 **Key Insight:**  
> Using **“VPC and more”** simplifies creating the core network components in one wizard instead of doing them separately.

---

## 🛠 AWS Services Used
- **VPC and more** – to create the VPC, subnets, IGW, and route tables
- **Amazon VPC** – for custom networking
- **Subnets** – public and private segments
- **Route Tables** – to manage traffic flow
- **Internet Gateway (IGW)** – to provide internet access to public resources
- **Network ACLs (NACLs)** – stateless subnet-level firewalls
- **Security Groups (SGs)** – stateful instance-level firewalls
- **Amazon EC2** – compute resources for testing
- **EC2 Instance Connect** – for SSH access without manual key management
- **AWS Management Console**

---

## 🚀 Step-by-Step Guide

### 1️⃣ Create a VPC Using **VPC and More**
1. Go to **AWS Console → VPC → Create VPC → VPC and more**.
2. Configure:
   - **Name tag:** `My-VPC`
   - **Number of Availability Zones:** 2
   - **Number of public subnets:** 1
   - **Number of private subnets:** 1
   - **IPv4 CIDR block:** `10.0.0.0/16`
3. Ensure **Enable DNS hostnames** is checked.
4. Choose **Create new Internet Gateway**.
5. Click **Create VPC**.

✅ This automatically creates:
- The VPC
- A **PublicSubnet** and **PrivateSubnet**
- A **Route Table** for each subnet
- An **Internet Gateway (IGW)** attached to the VPC
📸 Screenshot:

<img width="1635" height="852" alt="Screenshot 2025-10-01 143852" src="https://github.com/user-attachments/assets/282d190b-ebb9-4505-8cda-51ebe598987d?raw=true" />

---

### 2️⃣ Verify Subnets
1. Go to **VPC → Subnets**.
2. Ensure:
   - `PublicSubnet` (e.g., `10.0.0.0/24`) has **Auto-assign Public IPv4** enabled.
   - `PrivateSubnet` (e.g., `10.0.1.0/24`) has **Auto-assign Public IPv4** disabled.

---

### 3️⃣ Verify Route Tables
1. Go to **VPC → Route Tables**.
2. Check:
   - **Public Route Table:** has a default route `0.0.0.0/0 → IGW`.
   - **Private Route Table:** routes traffic only within the VPC `10.0.0.0/16 → Local`.

---

### 4️⃣ Verify Internet Gateway
1. Go to **VPC → Internet Gateways**.
2. Confirm that `My-IGW` is **attached to My-VPC**.

---

### 5️⃣ Configure Network ACLs

#### 🔹 Public NACL
- Go to **VPC → Network ACLs → NACL-Public** (created automatically by VPC and more).
- Ensure inbound rules allow:
  - HTTP (80) – `0.0.0.0/0`
  - HTTPS (443) – `0.0.0.0/0`
  - SSH (22) – from your IP
  - Ephemeral Ports (1024–65535) – `0.0.0.0/0`
- Ensure outbound rules allow all.

#### 🔹 Private NACL
- Go to **VPC → Network ACLs → NACL-Private**.
- By default, inbound and outbound rules block most traffic.
- We’ll update this later for **ICMP (ping)**.

---

### 6️⃣ Configure Security Groups

#### 🔹 Public Security Group
- Inbound Rules:
  - SSH (22) – from your IP
  - HTTP (80) – from `0.0.0.0/0`

#### 🔹 Private Security Group
- Inbound Rules:
  - Allow only internal traffic initially.

---

### 7️⃣ Launch EC2 Instances
1. Go to **EC2 → Launch Instances**.
2. Choose **Amazon Linux 2 AMI**, instance type `t2.micro`.
3. Launch:
   - `NextWork Public Server` in the **PublicSubnet**
   - `NextWork Private Server` in the **PrivateSubnet**
4. Assign each the corresponding security group.

---

## 🧪 Testing Connectivity

### 8️⃣ Connect to the Public Server
1. Go to **EC2 → Instances → NextWork Public Server → Connect → EC2 Instance Connect**.
2. Use the default username: `ec2-user`.
3. Click **Connect**.
📸 Screenshot:
  <img width="1909" height="858" alt="Screenshot 2025-10-01 155323" src="https://github.com/user-attachments/assets/3e58c9ea-5621-4f1e-8ad3-4a90deab2431?raw=true" />
 
> ⚠️ If connection fails:
- Edit **Public SG** inbound rules:
  - Type: SSH (22) → Source: Anywhere-IPv4 (`0.0.0.0/0`) *(demo only; restrict in production)*
📸 Screenshot:
<img width="1917" height="886" alt="Screenshot 2025-10-01 153829" src="https://github.com/user-attachments/assets/b7760a3c-2b11-4371-8486-3df4a93697a5?raw=true" />

---

### 9️⃣ Test EC2-to-EC2 Connectivity
1. Copy the **Private IPv4 address** of the Private Server.
2. In the Public Server terminal:
   ```bash
   ping <PRIVATE_SERVER_IP>
   ```
📸 Screenshot:
   <img width="1907" height="869" alt="Screenshot 2025-10-01 160430" src="https://github.com/user-attachments/assets/54cce7f4-2d2d-478c-9fb8-08052e21e030?raw=true" />

   If you see no reply or only one line, it means ICMP traffic is blocked.

💡 Troubleshooting:

The issue is usually in the Private NACL or the Private Security Group.

We’ll fix it next.
#### 🔟  Fix Network ACLs for ICMP Traffic

Update the Private NACL to allow ping (ICMP) traffic from the Public Subnet.

Go to VPC → Network ACLs → NextWork Private NACL.

Edit Inbound Rules:

Rule #: 100

Type: All ICMP – IPv4

Source: 10.0.0.0/24 (Public Subnet CIDR)

Edit Outbound Rules:

Rule #: 100

Type: All ICMP – IPv4

Destination: 10.0.0.0/24

Save changes.
📸 Screenshot:
<img width="1860" height="804" alt="Screenshot 2025-10-01 173844" src="https://github.com/user-attachments/assets/a9af8329-b7b6-43da-8299-d7c208704507?raw=true" />
<img width="1916" height="792" alt="Screenshot 2025-10-01 173916" src="https://github.com/user-attachments/assets/88ba7244-b3fa-44b0-99ea-1a2f24684a06?raw=true" />


Type: All ICMP – IPv4 → Source: NextWork Public SG

Re-run:
```
ping <PRIVATE_SERVER_IP>
```
1️⃣1️⃣ Test Internet Connectivity

From the Public Server terminal:

curl example.com


✅ If HTML output appears, the public subnet has internet access.
📸 Screenshot:

<img width="1919" height="877" alt="Screenshot 2025-10-01 165244" src="https://github.com/user-attachments/assets/a25ff218-c60c-4bd3-8fa3-a2d998785f35?raw=true" />
