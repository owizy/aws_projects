# 🔐 VPC Traffic Flow and Security on AWS

This project explores **how traffic flows within an AWS Virtual Private Cloud (VPC)** and how to apply **security controls** to protect network resources.  
It demonstrates the core AWS networking concepts: **VPC**, **subnets**, **security groups**, and **network ACLs**.

<img width="1485" height="812" alt="architecture (1)" src="https://github.com/user-attachments/assets/ccca56ba-fd15-45ea-aa84-3786ebf7917b?raw=true" />

---

## 📖 Project Overview
In this project, I:
- Built a **custom VPC** to understand network isolation
- Created **public  subnets**
- Configured **security groups** to control inbound/outbound traffic at the instance level
- Explored **network ACLs (NACLs)** to secure subnets
- Learned how AWS routes traffic between subnets and the internet

---

## 🛠 AWS Services Used
- **Amazon VPC** – for creating a private network
- **Subnets** – logical network segments in the VPC
- **Internet Gateway (IGW)** – enables external connectivity
- **Security Groups (SGs)** – instance-level traffic control
- **Network ACLs (NACLs)** – subnet-level traffic control
- **AWS Management Console**

---

## 🚀 Step-by-Step Walkthrough

### 1️⃣ Create a VPC
1. Go to **AWS Console → VPC → Create VPC**.
2. Name: `MY-VPC-01`.
3. CIDR block: `10.0.0.0/16`.
4. Leave defaults for tenancy and DNS settings.
5. Click **Create VPC**.

📸 `screenshots`
  <img width="1903" height="873" alt="Screenshot 2025-09-27 160711" src="https://github.com/user-attachments/assets/34fbd133-edb0-4152-8610-96804f65f331?raw=true" />

  
---

### 2️⃣ Create Subnets
1. Go to **Subnets → Create Subnet**.
2. Select `Public-01`.
3. Create subnets:
   - **PublicSubnet** → CIDR: `10.0.1.0/24` → Enable **Auto-assign Public IPv4**
4. Choose different Availability Zones for high availability.

📸 `screenshots`
     <img width="1900" height="868" alt="Screenshot 2025-09-27 160623" src="https://github.com/user-attachments/assets/82d2da6a-8be9-47ce-b8a0-f990f811f8bf?raw=true" />

---

### 3️⃣ Attach an Internet Gateway
1. Go to **Internet Gateways → Create IGW** → name it `MY-IGW`.
2. Attach the IGW to `Public-01`.

📸 `screenshots`
    <img width="1892" height="866" alt="Screenshot 2025-09-27 164223" src="https://github.com/user-attachments/assets/e1652d04-170e-4c7b-af1e-377706b3f01f?raw=true" />

   
---

### 4️⃣ Configure Security Groups
Security groups act as **stateful firewalls** for instances.

1. Go to **Security Groups → Create Security Group**.
2. Name: `My_Security_Vpc`.
3. Attach to `MY-VPC-01`.
4. Add **Inbound Rules**:
   - Allow **HTTP (80)** from `0.0.0.0/0`
   - Allow **SSH (22)** from your IP
5. Add **Outbound Rule**: Allow **All traffic** by default.

📸 `screenshots`
     <img width="1907" height="876" alt="Screenshot 2025-09-27 180619" src="https://github.com/user-attachments/assets/beec95b0-d621-46f8-887a-693eec0bee2a?raw=true" />
     
---

### 5️⃣ Configure Network ACLs (NACLs)
Network ACLs control **traffic at the subnet level** and are **stateless**.

1. Go to **Network ACLs → Create NACL** → name: `my_network_acl`.
2. Associate it with **PublicSubnet**.
3. Add **Inbound Rules**:
   - Allow HTTP (80) from `0.0.0.0/0`
   - Allow SSH (22) from your IP
   - Allow Ephemeral ports (1024–65535) for return traffic
4. Add corresponding **Outbound Rules**.

📸 `screenshots`

       
   <img width="1905" height="493" alt="Screenshot 2025-09-27 195742" src="https://github.com/user-attachments/assets/f8cfeb67-c5e3-4281-b39a-532cad5909a5?raw=true" />
          
   <img width="1919" height="490" alt="Screenshot 2025-09-27 195802" src="https://github.com/user-attachments/assets/132c1377-7686-454a-be60-6ceceb92597b?raw=true" />
  

---


## 📝 Key Concepts
- **VPC:** Your isolated AWS network.
- **Subnets:** Divide the VPC into public and private zones.
- **Security Groups:** Control traffic at the instance level (stateful).
- **NACLs:** Control traffic at the subnet level (stateless).
- **Internet Gateway:** Connects public subnets to the internet.

---


