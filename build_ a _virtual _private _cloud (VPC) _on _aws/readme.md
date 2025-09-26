# 🌐 Build a Virtual Private Cloud (VPC) on AWS

This project demonstrates how to create a **Virtual Private Cloud (VPC)** in AWS.  
A VPC allows you to launch AWS resources in a **logically isolated network** that you control — including **subnets**, **IP ranges**, and **internet gateways**.

<img width="989" height="811" alt="architecture" src="https://github.com/user-attachments/assets/bbea0f06-f42d-4c45-ad50-ca8c39b8a452?raw=true" />

---

## 📖 Project Overview
In this project, I:
- Created a **new custom VPC** (instead of using the default one)
- Added a **subnet** inside the VPC
- Attached an **Internet Gateway** to the VPC
- Explored how VPCs provide network isolation for AWS resources


---

## 🛠️ Services Used
- **Amazon VPC** – Virtual Private Cloud
- **Subnets** – Logical divisions within the VPC
- **Internet Gateway** – To connect the VPC to the internet
- **AWS Management Console**


---

## 🚀 Step-by-Step Guide

### 1️⃣ Create a VPC
1. Go to **AWS Console → VPC → Your VPCs → Create VPC**.  
2. Choose **VPC only**.  
3. Enter:
   - **Name tag:** `MY_VPC_1`
   - **IPv4 CIDR block:** e.g., `10.0.0.0/16`
4. Leave other defaults as is and click **Create VPC**.

📸 `screenshots`
 <img width="1901" height="1026" alt="Screenshot 2025-09-26 095102" src="https://github.com/user-attachments/assets/5bb1204c-b454-4668-8ccf-0f05c62564ae?raw=true" />


---

### 2️⃣ Understand the Default VPC
- Every AWS account comes with a **default VPC**.  
- The default VPC allows AWS services like **S3** or **Lambda** to connect to the internet automatically.  
- In this project, we created a **new custom VPC** to have full control of networking.

---

### 3️⃣ Create a Subnet
1. Go to **VPC → Subnets → Create subnet**.  
2. Select your new VPC (``MY_VPC_1`).  
3. Enter:
   - **Subnet name:** `Public 1`
   - **Availability Zone:** (pick one, e.g., `us-east-1a`)
   - **IPv4 CIDR block:** e.g., `10.0.1.0/24`
4. Enable **Auto-assign public IPv4 address**.  

📸 `screenshots`

<img width="1910" height="949" alt="Screenshot 2025-09-26 102305" src="https://github.com/user-attachments/assets/fefaa183-324c-458c-9f50-97b958150f7a?raw=true" />



> 💡 **Note:**  
> - **Public Subnets** → connected to an Internet Gateway  
> - **Private Subnets** → not directly reachable from the internet

---


### 4️⃣ Attach an Internet Gateway
1. Go to **VPC → Internet Gateways → Create internet gateway**.  
2. Name it: `My_IG`.  
3. After creation, click **Attach to VPC** and choose `My_VPC_1`.  

📸 `screenshots`
<img width="1892" height="988" alt="Screenshot 2025-09-26 105039" src="https://github.com/user-attachments/assets/6d54762c-a3d5-4c96-9187-43dd5b87aa1f?raw=true" />

---


## 📝 Key Concepts

### 🟩 Virtual Private Cloud (VPC)
A VPC is a **logically isolated network** in AWS where you can launch resources like EC2 instances.  
You control the **IP range** and **networking components**.

---

### 🟩 Subnet
A **subnet** is a range of IP addresses within a VPC.
- Public subnets can be connected to the internet via an Internet Gateway.
- Private subnets remain isolated from the internet.

---

### 🟩 Internet Gateway
An **Internet Gateway** connects your VPC to the internet.  
Attaching one allows resources in **public subnets** to reach external networks.

---

## 💡 Insights
- The **default VPC** is automatically created by AWS for each region.  
- A **custom VPC** gives you more control over IP ranges and networking.  
- Creating a subnet and attaching an Internet Gateway were straightforward steps.

---

## ⚠️ Notes
- No custom **route tables** were created in this project; the default route table was used.  
- We didn’t launch EC2 instances or verify connectivity — the focus was solely on VPC creation.

---
