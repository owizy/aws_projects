# 🛡 Cloud Security with AWS IAM + EC2 (Dev & Prod Environments)

This project demonstrates how to secure AWS resources using **Identity and Access Management (IAM)** and enforce **environment separation** with **Amazon EC2 tagging**.  
The goal is to implement **least privilege access**, organize resources for **Development** and **Production**, and ensure that IAM users only access what they’re authorized to.

---

## 📖 About the Project
- Launched **EC2 instances** for **Development** and **Production** environments  
- Tagged resources with `Environment=Development` / `Environment=Production`  
- Wrote **IAM policies** that use tags to restrict access  
- Created **IAM users, groups, and roles**  
- Tested access to validate the configuration  

---

## 🛠 Services & Tools Used
- **Amazon EC2** (compute instances)  
- **AWS IAM** (Users, Groups, Roles, Policies)  
- **AWS Management Console**  
- **AWS CLI** (optional)  
- **JSON Policy Documents**  

---

## 🚀 Step-by-Step Walkthrough

### 1️⃣ Create EC2 Instances (Dev & Prod)
1. Go to **AWS Console → EC2 → Launch instance**.  
2. Select an AMI (e.g., Amazon Linux 2).  
3. Choose instance type (`t2.micro` for free-tier testing).  
4. Configure storage and networking (default is fine for demo).  
5. Add **Name and tags**:
   - **Development instance**:
     - `Name=WebServer-Dev`
     - `resource types=instance`
   
     - `Env=Development`
    - `resource types=instance`
   - **Production instance**: 
     - `Name=WebServer-Prod`
     - `resource types=instance`
   
     - `Env=Production`
     - `resource types=instance`  
7. Configure security group (allow only necessary ports).  
8. Launch and download your key pair.  

<img width="1204" height="571" alt="Screenshot 2025-09-23 124428" src="https://github.com/user-attachments/assets/6cffa83f-7d52-4a65-9973-9ade29851780?raw=true" />

---

### 2️⃣ Write IAM Policy for Tag-Based Access
We want developers interns to only manage **Development** instances, not Production.  
Here’s a custom IAM policy using **tag conditions**:

```json
{    
  "Version": "2012-10-17",    
  "Statement": [        
    {            
      "Effect": "Allow",            
      "Action": "ec2:*",            
      "Resource": "*",            
      "Condition": {                
        "StringEquals": {                    
          "ec2:ResourceTag/Env": "development"                
        }            
      }        
    },        
    {            
      "Effect": "Allow",            
      "Action": "ec2:Describe*",            
      "Resource": "*"        
    },        
    {            
      "Effect": "Deny",            
      "Action": [                
        "ec2:DeleteTags",                
        "ec2:CreateTags"            
      ],            
      "Resource": "*"        
    }    
  ] 
}

```
Save as devEnvironmentalPolicy.

Developers can start/stop Dev EC2s, but cannot touch Prod EC2s.

📸 screenshots

<img width="1897" height="884" alt="Screenshot 2025-09-25 001556" src="https://github.com/user-attachments/assets/2b09e934-0967-440e-8be9-7f51a5cd421e?raw=true" />

---
3️⃣ Create Alias Account

 1.Go to AWS Console → IAM → create Account Alias .
 2.Username: aliassuser-1.
 - Enable:
    AWS Management Console access

<img width="905" height="500" alt="Screenshot 2025-09-o24 212509" src="https://github.com/user-attachments/assets/7ea0d0bd-b7e0-49a5-b483-9ac9f2d6c499?raw=true" />


<img width="1892" height="816" alt="Screenshot 2025-09-24 213944" src="https://github.com/user-attachments/assets/98cf51fb-e090-46f6-83f3-4250d8a22eac?raw=true" />


---

4️⃣ Create IAM Groups

1.Go to IAM → Groups → Create group.

2.Name it Developers.

---

5️⃣ Create IAM Users

1. Go to AWS Console → IAM → Users → Add user.

2.Username: developer-user.

3.Permissions options
  Add user to group and add it to Developers.  

 ----

6️⃣ Test the Policy

You can test IAM policies in **two ways**:

#### 🔹 Option 1: Test by Logging in with Account Alias
1. Go to the **IAM dashboard** → **Account Alias**.  
2. Copy your AWS account login URL with the alias (e.g., `https://your-alias.signin.aws.amazon.com/console`).  
3. Log in as the IAM user (e.g., `developer-user`).  
4. Try to manage EC2:
   - ✅ You should be able to **Start/Stop** the **Development instance**.  
   - ❌ You should be **Denied** when trying to manage the **Production instance**.  

📸 `screenshots`
  
  <img width="1458" height="382" alt="Screenshot 2025-09-24 220124" src="https://github.com/user-attachments/assets/ecefc568-e77b-4311-9ac2-fe13fce22579?raw=true" />
  
  
  <img width="1877" height="815" alt="Screenshot 2025-09-25 001012" src="https://github.com/user-attachments/assets/a0490b9c-44fc-4e51-9c90-836c43a31466?raw=true" />


---

#### 🔹 Option 2: Test Using IAM Policy Simulator
1. Go to **IAM → Policy Simulator** in the AWS Console.  
2. Select your policy (`EC2DevelopmentAccessPolicy`).  
3. Choose **Service = EC2**.  
4. Select actions like `StartInstances`, `StopInstances`.  
5. Add **Resource ARNs**:
   - Dev instance (tag: `Environment=Development`) → ✅ Allowed  
   - Prod instance (tag: `Environment=Production`) → ❌ Denied  
6. Click **Run Simulation** to see results.

📸 screenshots
<img width="1370" height="871" alt="Screenshot 2025-09-24 221548" src="https://github.com/user-attachments/assets/f8df56aa-68a8-466b-8c96-c53a901a49fe?raw=true" />


---

💡 Best practice: Use **Policy Simulator first** to verify your JSON logic, then log in through the **account alias** to confirm real-world behavior.
  
