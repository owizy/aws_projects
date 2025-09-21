# 🌐 Hosting a Website on AWS S3

[![AWS](https://img.shields.io/badge/AWS-S3-orange?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/s3/)  
[![HTML](https://img.shields.io/badge/HTML-5-orange?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)  
[![CSS](https://img.shields.io/badge/CSS-3-blue?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)  
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

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
![Create S3 Bucket](screenshots/create-bucket.png)

---

### 2️⃣ Upload Website Files
- Upload `index.html`, `style.css`, `script.js`, and assets  

📸 Screenshot:  
![Upload Files](screenshots/upload-files.png)

---

### 3️⃣ Enable Static Website Hosting
- Go to **Properties** → Enable *Static website hosting*  
- Set `index.html` as the root document  

📸 Screenshot:  
![Enable Hosting](screenshots/enable-hosting.png)

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
### 4️⃣.2 Test Bucket Policy with File Deletion
To confirm the policy and permissions were working correctly, I attempted to **delete `index.html`**.  
AWS displayed a warning/confirmation prompt, showing that file deletion has consequences since it is tied to the website endpoint.  

📸 Screenshot:  
![Delete Index.html Attempt](screenshots/delete-index.png)
