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
- Uncheck **Block all public access**  

📸 Screenshot:  

![Screenshot (299)](https://github.com/user-attachments/assets/59ebf877-05a1-48a2-963c-75412b1ab120)

----
### 2️⃣ Upload Website Files
- Upload `index.html`, `folder`  

📸 Screenshot:  

<img width="1920" height="939" alt="Screenshot (300)" src="https://github.com/user-attachments/assets/97cbff58-791b-4537-b8e9-8ced08f8514d" />

---

### 3️⃣ Enable Static Website Hosting
- Go to **Properties** → Enable *Static website hosting*  
- Set `index.html` as the root document  

📸 Screenshot:  

<img width="1920" height="968" alt="Screenshot (301)" src="https://github.com/user-attachments/assets/cc3d3e07-06b3-417e-9493-025cbd7d8d01" />

-----


📸 Screenshot:  

<img width="1920" height="1080" alt="Screenshot (302)" src="https://github.com/user-attachments/assets/c877c4c6-7c57-4de2-a495-dca27b0be2e3" />

This happened because:  
- My **bucket policy** wasn’t set to allow public read access, OR  
- The objects (like `index.html`) didn’t have the correct **permissions**.  

---

#### ✅ How I Fixed It
1. Went to the **Permissions** tab of my S3 bucket.  
2. Updated the **Bucket Policy** to allow public `GetObject` access (see JSON in Step 4).  
3. Made sure **Block Public Access** settings were disabled.  
4. Re-uploaded `index.html` with public read permissions.  


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
<img width="1920" height="950" alt="Screenshot (303)" src="https://github.com/user-attachments/assets/f7b46adb-d337-4321-a94b-ea0461b01368" />
