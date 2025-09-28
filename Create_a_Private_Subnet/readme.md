# 🔒 Creating a Private Subnet in AWS with Public & Private NACLs

This project demonstrates how to create a **secure AWS network architecture** with:
- A custom **VPC**
- **Public and Private Subnets**
- Configured **Route Tables** for traffic flow
- **Network ACLs (NACLs)** for subnet-level security
- An **Internet Gateway** for public subnet internet access

<img width="837" height="736" alt="private_subnet" src="https://github.com/user-attachments/assets/931be86e-a9e5-4eaf-acf4-e4c0ed572081?raw=true" />

---

## 📖 Project Overview
In this project, I:
- Built a **custom VPC** for network isolation
- Created **Public** and **Private** subnets
- Configured **Route Tables** to control network paths
- Added **NACLs** for subnet-level security
- Connected the Public subnet to the internet using an **Internet Gateway**
- Learned how **NACLs** and **Route Tables** together secure traffic flows in AWS

> 💡 **Key Insight:**  
> - A subnet is **public or private** based on its **route table**.  
> - **NACLs** secure subnets, while **Security Groups** secure individual instances.

---

## 🛠 AWS Services Used
- **Amazon VPC** – for creating the network
- **Subnets** – to separate public and private workloads
- **Route Tables** – to define traffic flow
- **Network ACLs (NACLs)** – to control inbound/outbound traffic at the subnet level
- **Internet Gateway (IGW)** – connects public subnet to the internet
- **AWS Management Console**

---

## 🚀 Step-by-Step Guide (Real-World Order)

### 1️⃣ Create the VPC
1. Go to **AWS Console → VPC → Your VPCs → Create VPC**.
2. Choose **VPC only**.
3. Enter:
   - **Name tag:** `My-Vpc`
   - **IPv4 CIDR block:** `10.0.0.0/16`
4. Leave defaults and click **Create VPC**.

📸 Screenshot:  
<img width="1917" height="889" alt="Screenshot 2025-09-28 074848" src="https://github.com/user-attachments/assets/88ddda9b-3d13-4b81-bf44-0df5ca4ad8d5?raw=true" />

---

### 2️⃣ Create the Public Subnet
1. Go to **VPC → Subnets → Create subnet**.
2. Select `My-Vpc`.
3. Enter:
   - **Subnet name:** `Public-1`
   - **Availability Zone:** `us-east-1a`
   - **CIDR block:** `10.0.1.0/24`
4. Enable **Auto-assign public IPv4 address**.

📸 Screenshot:  
<img width="1903" height="877" alt="Screenshot 2025-09-28 074819" src="https://github.com/user-attachments/assets/5104ad3e-9814-4b79-9ba4-45933905aa0d?raw=true" />

---

### 3️⃣ Create the Private Subnet
1. Go to **VPC → Subnets → Create subnet**.
2. Select `My-Vpc`.
3. Enter:
   - **Subnet name:** `Private-1`
   - **Availability Zone:** `us-east-1b`
   - **CIDR block:** `10.0.2.0/24`
4. Leave **Auto-assign public IPv4 address** **disabled**.

📸 Screenshot:  
<img width="1520" height="871" alt="Screenshot 2025-09-28 082952" src="https://github.com/user-attachments/assets/3ca00845-cb1c-4cab-b050-9bdf69379d62?raw=true" />

---

### 4️⃣ Attach an Internet Gateway
1. Go to **VPC → Internet Gateways → Create internet gateway**.
2. Name it: `My-IGW`.
3. Select the IGW → **Attach to VPC** → choose `My-Vpc`.

📸 Screenshot:  
<img width="1542" height="859" alt="Screenshot 2025-09-28 075034" src="https://github.com/user-attachments/assets/278604b2-9aa4-4dd4-aaad-b3e9330244a0?raw=true" />

---

### 5️⃣ Configure Route Tables

#### 🔹 Public Route Table
1. Go to **VPC → Route Tables → Create route table**.
2. Name it: `Public-RT`.
3. Associate it with `My-Vpc`.
4. Edit **Routes → Add route**:
   - **Destination:** `0.0.0.0/0`
   - **Target:** `My-IGW`
5. Save changes.
6. Under **Subnet Associations → select `Public-1` → Save**.
 📸 Screenshot:
<img width="1524" height="639" alt="Screenshot 2025-09-27 171648" src="https://github.com/user-attachments/assets/c7ea33ac-63e1-4826-91a4-fe4b2cbfcd9d?raw=true" />

---

#### 🔹 Private Route Table
1. Go to **VPC → Route Tables → Create route table**.
2. Name it: `Private-routetable`.
3. Associate it with `My-Vpc`.
4. Leave the default local route:
   - `10.0.0.0/16 → Local`
5. Under **Subnet Associations → select `Private-1` → Save**.

> ✅ Public subnet now routes traffic to the internet, while private subnet stays internal.
 📸 Screenshot:
    <img width="1497" height="406" alt="Screenshot 2025-09-28 090505" src="https://github.com/user-attachments/assets/ac38cd91-69f4-44f8-ae1d-64aecd7eeca4?raw=true" />

  
---

### 6️⃣ Configure Network ACLs (NACLs)

NACLs add an **extra layer of security at the subnet level**.

#### 🔹 Public NACL
1. Go to **VPC → Network ACLs → Create NACL**.
2. Name it: `my_networkacl`.
3. Associate it with `Public-1`.
4. Add **Inbound Rules**:
   - Allow HTTP (80) from `0.0.0.0/0`
   - Allow HTTPS (443) from `0.0.0.0/0`
   - Allow SSH (22) from your IP
   - Allow ephemeral ports (1024–65535) for return traffic
5. Add corresponding **Outbound Rules** for the same ports.

 📸 Screenshot: 
    <img width="1905" height="493" alt="Screenshot 2025-09-27 195742" src="https://github.com/user-attachments/assets/be00e0d4-35dc-4093-9bd0-d3c550234f92?raw=true" />
    <img width="1919" height="490" alt="Screenshot 2025-09-27 195802" src="https://github.com/user-attachments/assets/2c56b3a7-1429-4746-a04c-4893fa023d2e?raw=true" />


---

#### 🔹 Private NACL
1. Go to **VPC → Network ACLs → Create NACL**.
2. Name it: `NACL-Private`.
3. Associate it with `Private-1`.
4. Add **Inbound Rules**:
   - Allow internal traffic from `10.0.0.0/16`
   - Deny all external traffic
5. Add **Outbound Rules** to allow internal communication only.

> 💡 **Tip:** NACLs are **stateless**, so you must allow both inbound and outbound directions.
📸 Screenshot:
<img width="1613" height="403" alt="Screenshot 2025-09-28 095257" src="https://github.com/user-attachments/assets/5c2a3759-b63e-441e-a532-6033f954e42f?raw=true" />


<img width="1621" height="411" alt="Screenshot 2025-09-28 095309" src="https://github.com/user-attachments/assets/8af7e0db-45e1-48f5-b0ec-a56034fb3784?raw=true" />


---

## 📝 Key Concepts

### 🟩 Public vs Private Subnets
- Public subnets have a route to the **IGW** and allow external access.
- Private subnets remain internal without an IGW route.

### 🟩 Route Tables
- Decide traffic paths.
- Public RT → internet route → `0.0.0.0/0 → IGW`.
- Private RT → local only → `10.0.0.0/16 → Local`.

### 🟩 NACLs
- Operate at the subnet level.
- Provide **stateless** firewall rules, applied to all resources in the subnet.

### 🟩 Internet Gateway
- Enables resources in **public subnets** to communicate with the internet.

---

## ⚠️ Notes
- No **NAT Gateway** was configured — resources in the private subnet can’t access the internet.
- No EC2 instances were deployed — the focus was on **network architecture**.

---
