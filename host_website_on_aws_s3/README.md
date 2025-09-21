# 🌐 Hosting a Website on AWS S3

This project demonstrates how I hosted a **static website** using **Amazon S3**.  
It was part of my cloud journey, where I explored deploying websites in a serverless, scalable way.


---


## ✨ Why This Project?
I wanted to learn how to take a website from my computer and **make it live on the internet** using the cloud.  
Amazon S3 is one of the most reliable and cost-effective ways to do this, and through this project, I gained **hands-on cloud experience**.

---

## 🛠️ Tech Stack
- **Amazon S3** → Storage & hosting  
- **AWS Management Console** → Deployment & setup  
- **HTML, CSS, JavaScript** → Static website content  

---

## 📖 Step-by-Step Setup

### 1️⃣ Create an S3 Bucket
- Log in to **AWS Console**  
- Create a bucket (name must be globally unique)  
-For Object Ownership, choose ACLs enabled.
- Uncheck **Block all public access**  

📸 Screenshot:  

![screenshot](https://github.com/user-attachments/assets/cc5ab4d0-ed98-4b3c-a363-05ae841fd546?raw=true)

----
### 2️⃣ Upload Website Files
- Upload `index.html`, `folder`  

📸 Screenshot:  

<img width="1920" height="865" alt="Screenshot (300)" src="https://github.com/user-attachments/assets/158d9a21-a525-4fde-88e7-0eb28963b747?raw=true" />

---

### 3️⃣ Enable Static Website Hosting
- Go to **Properties** → Enable *Static website hosting*  
- Set `index.html` as the root document  

📸 Screenshot:  

<img width="1920" height="882" alt="Screenshot (301)" src="https://github.com/user-attachments/assets/e416af4d-b167-484d-a4b6-e2abd413403b?raw=true" />

-----


📸 Screenshot:  

<img width="1920" height="1080" alt="Screenshot (302)" src="https://github.com/user-attachments/assets/e7eb7eb2-e1f1-4173-9ac0-27ad1c22c2df?raw=true" />

This happened because:  
- My **bucket policy** wasn’t set to allow public read access, OR  
- The objects (like `index.html`) didn’t have the correct **permissions**.  

---

#### ✅ How I Fixed It
To resolve this, I updated the **access settings** of the files inside my bucket.  
Using **ACLs (Access Control Lists)**, I made my bucket’s files public.  

Once I checked my **S3 bucket endpoint again**, the webpage loaded up successfully 🎉  


---

### 4️⃣ Configure Bucket Policy
This allows the public to access your website files.  

Here’s the **bucket policy JSON** I used:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```
### 4️⃣.2 Test Bucket Policy with File Deletion
To confirm the policy and permissions were working correctly, I attempted to **delete `index.html`**.  
AWS displayed a warning/confirmation prompt, showing that file deletion has consequences since it is tied to the website endpoint.  

📸 Screenshot:  
<img width="1920" height="882" alt="Screenshot (303)" src="https://github.com/user-attachments/assets/d6b47ac7-368a-4c3b-8f4d-805ef0696502?raw=true" />


