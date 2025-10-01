# 🚀 Launching VPC Resources on AWS

This project demonstrates how to **launch essential AWS resources inside a custom Virtual Private Cloud (VPC)**.  
It includes creating the VPC, configuring subnets, route tables, attaching an Internet Gateway, launching EC2 instances, and securing the environment with **Security Groups** and **Network ACLs**.

<img width="1009" height="733" alt="vpc_resources" src="https://github.com/user-attachments/assets/3d8af612-9ffb-45aa-a4d5-81b9bf5ded0c?raw=true" />

---

## 📖 Project Overview
In this project, I:
- Created a **VPC** to host AWS resources
- Configured **Public** and **Private Subnets**
- Set up **Route Tables** to manage traffic flow
- Attached an **Internet Gateway** for external connectivity
- Configured **Security Groups** for instance-level security
- Configured **Network ACLs** for subnet-level security
- Launched **EC2 instances** into the subnets
- Learned how VPC components work together to securely host applications

> 💡 **Key Insight:**  
> Combining **Route Tables**, **Security Groups**, and **Network ACLs** gives fine-grained control over traffic flow and improves network security.

---

## 🛠 AWS Services Used
- **Amazon VPC** – for creating an isolated network
- **Subnets** – separate public and private workloads
- **Route Tables** – control network traffic
- **Internet Gateway (IGW)** – connects public subnets to the internet
- **Security Groups (SG)** – control inbound/outbound traffic for EC2 instances
- **Network ACLs (NACLs)** – control inbound/outbound traffic at the subnet level
- **EC2 Instances** – compute resources launched inside the VPC
- **AWS Management Console**

---

## 🚀 Step-by-Step Guide (Real-World Order)

### 1️⃣ Create a Custom VPC
1. Go to **AWS Console → VPC → Create VPC**.
2. Choose **VPC only**.
3. Enter:
   - **Name tag:** `My-VPC`
   - **CIDR block:** `10.0.0.0/16`
4. Click **Create VPC**.

📸 Screenshot:  
<img width="1529" height="744" alt="Screenshot 2025-09-29 130855" src="https://github.com/user-attachments/assets/b94bbb48-610f-437f-8ad0-8c0848143162?raw=true" />

---

### 2️⃣ Create Public and Private Subnets
1. Go to **Subnets → Create Subnet**.
2. Select `My-VPC`.
3. Create:
   - **PublicSubnet** → CIDR: `10.0.0.0/24`
   - **PrivateSubnet** → CIDR: `10.0.1.0/24`
4. Enable **Auto-assign Public IPv4** for the public subnet only.

📸 Screenshots:  
<img width="1538" height="811" alt="Screenshot 2025-09-29 131411" src="https://github.com/user-attachments/assets/7111fbd5-e6d2-4e87-9dd0-5903470e23b9?raw=true" />

<img width="1537" height="872" alt="Screenshot 2025-09-29 195803" src="https://github.com/user-attachments/assets/3043fe88-294f-458e-9910-90687a9b26e2?raw=true" />

---

### 3️⃣ Attach an Internet Gateway
1. Go to **Internet Gateways → Create Internet Gateway**.
2. Name it: `My-IGW`.
3. Attach it to `My-VPC`.

📸 Screenshot:  
<img width="1543" height="778" alt="Screenshot 2025-09-29 131603" src="https://github.com/user-attachments/assets/a840afa0-771b-466c-a16a-6a877369f830?raw=true" />

---

### 4️⃣ Configure Route Tables
1. **Public Route Table (Public-RT)**:
   - Add route: `0.0.0.0/0 → My-IGW`
   - Associate with **PublicSubnet**
2. **Private Route Table (Private-RT)**:
   - Keep default: `10.0.0.0/16 → Local`
   - Associate with **PrivateSubnet**
📸 Screenshot:
<img width="1918" height="888" alt="Screenshot 2025-09-27 171136" src="https://github.com/user-attachments/assets/82408568-1423-4c55-b35a-250556127c3c?" />

<img width="1537" height="807" alt="Screenshot 2025-09-29 200008" src="https://github.com/user-attachments/assets/21c7f1ce-e6c7-45bc-a25b-34c707c5e84a?raw=true" />

> ✅ The Public subnet can reach the internet, while the Private subnet remains internal.

---

### 5️⃣ Configure Network ACLs (NACLs)

#### 🔹 Public NACL
1. Go to **VPC → Network ACLs → Create NACL**.
2. Name it: `NACL-Public`.
3. Associate it with **PublicSubnet**.
4. Add **Inbound Rules**:
   - Allow HTTP (80) from `0.0.0.0/0`
   - Allow HTTPS (443) from `0.0.0.0/0`
   - Allow SSH (22) from your IP
   - Allow ephemeral ports (1024-65535) for return traffic
5. Add corresponding **Outbound Rules** for the same ports.

#### 🔹 Private NACL
1. Go to **VPC → Network ACLs → Create NACL**.
2. Name it: `NACL-Private`.
3. Associate it with **PrivateSubnet**.
4. Add **Inbound Rules**:
   - Allow internal VPC traffic: `10.0.0.0/16`
   - Deny all external inbound traffic
5. Add **Outbound Rules** to allow internal communication only.

> 💡 **Tip:** NACLs are **stateless**, so you must allow both inbound and outbound rules for expected traffic.
📸 Screenshot:  
<img width="1552" height="877" alt="Screenshot 2025-09-29 195233" src="https://github.com/user-attachments/assets/36a4fd03-2655-4e2c-a8ae-9d50e7114194?raw=true" />
<img width="1552" height="882" alt="Screenshot 2025-09-29 204005" src="https://github.com/user-attachments/assets/03d3cc6c-2fe7-4ae0-af94-bdd001430925?raw=true" />



---

### 6️⃣ Launch EC2 Instances
1. Go to **EC2 → Launch Instances**.
2. Choose Amazon Linux 2 AMI and `t2.micro`.
3. Launch:
   - **Public EC2 Instance:** in **PublicSubnet**
   - **Private EC2 Instance:** in **PrivateSubnet**
4. Configure **Security Groups**:
   - Public instance → Allow SSH (22) from your IP + HTTP (80) from `0.0.0.0/0`
   - Private instance → Allow traffic only from **PublicSubnet** or internal CIDR
📸 Screenshot:  

<img width="1916" height="901" alt="Screenshot 2025-09-30 124917" src="https://github.com/user-attachments/assets/77981fd1-4b29-41ad-8d91-ed4bfe0eaa1b?raw=true" />

<img width="1534" height="860" alt="Screenshot 2025-10-01 140921" src="https://github.com/user-attachments/assets/308a8127-5a49-4d9c-86d7-a8d04c9b8422?raw=true" />

---

## 📝 Key Concepts
- **VPC:** Isolated AWS network.
- **Subnets:** Divide workloads into public (internet-facing) and private (internal-only).
- **Route Tables:** Define network paths; public subnets route to **IGW**.
- **Internet Gateway:** Connects public subnets to the internet.
- **Security Groups:** Stateful firewalls controlling instance-level access.
- **Network ACLs:** Stateless firewalls providing subnet-level control.

---

## ⚠️ Notes
- A **NAT Gateway** would be required if private EC2s need outbound internet access (not implemented in this project).
- Combining **Security Groups + NACLs** creates a layered security model.
