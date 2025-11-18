# 🌐 Connecting a Web App to Amazon Aurora (EC2 + Aurora MySQL Project)

This project walks through building a small but realistic cloud application:
a web app hosted on an EC2 instance that connects to a relational database on Amazon Aurora.

It’s the classic architecture behind login systems, e-commerce platforms, dashboards, and internal company tools.
We re-create this pattern from scratch using AWS services.

---

## 🧩 Real-Life Problem Scenario

Imagine you're hired to build a simple internal tool that lets staff submit customer details from a web form.
The app must be:

Accessible through a browser

Always available even during traffic spikes

Able to store data in a secure database

Hosted in the cloud, not on a local computer

A single laptop or a shared Google Sheet won’t cut it.
You need reliable compute, a managed relational database, and a clean way to connect both.

---
 ## 💡 Solution Overview

To solve the problem, you build:

A web server (EC2) that displays a web page and handles user input.

An Aurora MySQL database to store that input safely and reliably.

A secure connection between the web app and the database.

A PHP interface that reads/writes data to the database.

By the end, you’ll have a working mini-application where:

You enter data in the web page,

It gets stored in Aurora,

You query the database and see the exact same records.

---

## 🏗 Architecture Diagram


<img width="1464" height="1051" alt="aurora_connected _with web_app" src="https://github.com/user-attachments/assets/54864ffb-bd0a-4916-8dab-c46afff1f616?raw=true" />

---

- EC2 hosts the web application.
- Aurora stores the data.
- PHP + MySQL client allow the two sides to talk.

### 🚀 Step-By-Step Guide
#### Step 0 — Understand What We’re Building

In this project, you deploy a web server on EC2, set up an Aurora MySQL database, and integrate them.
You’ll install a simple PHP app that can save and display data from Aurora.

#### Step 1 — Log in Using an IAM User

For safety, never build cloud projects with the AWS root account.
Instead:

- Log in using your IAM Admin user with full permissions.

#### Step 2 — Launch the EC2 Instance (Your Web Server)

- Open EC2 → Instances → Launch Instance and configure:

- Name: ec2-instance-web-server

- AMI: Amazon Linux 2023

- Type: t2.micro (Free Tier)

- Key Pair: (Create  a key pair    name :AuroraWebApp, key type: RSA  , file format:pem  )

##### Network Settings:

- Allow SSH from your IP 

- Allow HTTP from anywhere

- Launch the instance and note:

- Public IPv4 DNS

- Key pair name

  📸 Screenshot:


   <img width="888" height="902" alt="Screenshot 2025-11-17 225951" src="https://github.com/user-attachments/assets/0e650e00-719c-42b3-b902-0addb418c048?raw=true" />
  
  
---

#### Step 3A — Create the Aurora MySQL Database

- Go to RDS → Databases → Create Database
- Choose Standard Create → Aurora (MySQL Compatible).

##### Use the following:

- Engine: Aurora MySQL

- Version: Default recommended

- Template: Dev/Test

- Cluster Identifier: db-cluster

- Master Username: admin

- Password:  ( your own)

- Instance Class: db.t3.medium

- Initial database name: sample

- Connect to EC2: choose your EC2 instance

- Create the cluster and wait until the status becomes Available.

- Note the Writer Endpoint — we will use this later.

 📸 Screenshot:
                  

        
<img width="925" height="900" alt="Screenshot 2025-11-17 220453" src="https://github.com/user-attachments/assets/62f00180-c446-41d4-b53f-c3ad857c98a9?raw=true" />



#### step 3B - connect to your EC2 Instance with ssh
 ###### 🖥 For window user 
 - install wsl: wsl --install
 - Start wsl manually : wsl
 - mkdir -p ~/awskeys
- cp /mnt/c/Users/dell/Downloads/AuroraWebApp.pem ~/awskeys/   (Note: know the part where AuroraWebApp.pem is located)
- chmod 400 ~/awskeys/AuroraWebApp.pem (give permission to read it)
- curl ifconfig.me      # Used to check your public IP
- Go to your Security Group  edit your inbound rule update your public IP  
- SSH into your EC2 instance:

  ```
  
   ssh -i ~/awskeys/AuroraWebApp.pem ec2-user@YOUR_PUBLIC_DNS


  ```
You’re in.

  ###### 🖥 For mac user 
-  mkdir -p ~/awskeys 
- cp /mnt/c/Users/dell/Downloads/AuroraWebApp.pem ~/awskeys/   (Note: know the part where AuroraWebApp.pem is located)
- chmod 400 ~/awskeys/AuroraWebApp.pem (give permission to read it)
- SSH into your EC2 instance:

  ```
  
   ssh -i ~/awskeys/AuroraWebApp.pem ec2-user@YOUR_PUBLIC_DNS


  ```
You’re in.
 📸 Screenshot:



<img width="1919" height="999" alt="Screenshot 2025-11-17 232944" src="https://github.com/user-attachments/assets/b6135f01-728f-4871-abd4-197c100b34ae?raw?true" />



---

#### Step 4 — Install and Run the Web App on EC2

- SSH into your EC2 instance and update system packages:
```
sudo dnf update -y
```

- Install:
```
sudo dnf install -y httpd php php-mysqli mariadb105
```

- Start Apache:
```
sudo systemctl start httpd
```

- Open the EC2 public DNS in your browser:
```
http://YOUR_PUBLIC_DNS
```

If you see the Apache test page, your server is working.

---

#### Step 5 — Connect the EC2 Instance to the Aurora Database
A. Create folder structure for DB config:
```
cd /var/www
sudo chown ec2-user:ec2-user /var/www
mkdir inc
ls -ld
cd ../../
sudo chown ec2-user:ec2-user /var/www
ls -ld var/www
cd /var/www
mkdir inc
cd inc
> dbinfo.inc
nano dbinfo.inc

```
- Paste (dbinfo.inc):
```
<?php
define('DB_SERVER', 'YOUR_WRITER_ENDPOINT');
define('DB_USERNAME', 'admin');
define('DB_PASSWORD', 'n3xtw0rk');
define('DB_DATABASE', 'sample');
?>

```
- Save (Ctrl+S) → Exit (Ctrl+X)
- Visit:
```
http://YOUR_PUBLIC_DNS

```
📸 Screenshot:


  <img width="1857" height="1078" alt="Screenshot 2025-11-17 233228" src="https://github.com/user-attachments/assets/17031924-814a-461f-8d72-b7687c0df7bb?raw=true" />



- B. Create Your App Interface
```
cd /var/www/html
ls -ld
sudo chown ec2-user:ec2-user .
> SamplePage.php
nano SamplePage.php

```
Paste the full PHP file (the one that handles form input, creates the EMPLOYEES table, inserts rows, and displays data).

Save + Exit.

- Visit:
```
http://YOUR_PUBLIC_DNS/SamplePage.php

```
You should see the app page with input fields.

Try adding a name + address — your first live database entry.


📸 Screenshot:

  
  <img width="1848" height="1066" alt="Screenshot 2025-11-17 234323" src="https://github.com/user-attachments/assets/f80ac88d-dee2-43d5-84d0-8a4b95db7df2?raw=true" />

       

---
 ### Step 6 — Verify the App Data in Aurora (MySQL CLI)

- Install MySQL tools inside EC2:
```
sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm -y
sudo yum install mysql-community-client -y
```

- Connect:
```
mysql -h YOUR_WRITER_ENDPOINT -P 3306 -u admin -p
```

- Enter your password.

- Run:
```
SHOW DATABASES;

USE sample;

SHOW TABLES;

DESCRIBE EMPLOYEES;

SELECT * FROM EMPLOYEES;

```
You should see the records you added from the web page.

This confirms your EC2 → Aurora → Web App connection works end-to-end.

📸 Screenshot:


<img width="903" height="898" alt="Screenshot 2025-11-18 005846" src="https://github.com/user-attachments/assets/068bf799-a83a-4fac-a1af-b3c7650097ba" />



----
### 🧠 Key Concepts Learned
- EC2 Web Server
A virtual machine that runs your web application.

- Amazon Aurora
A highly available, scalable relational database that automatically creates replicas and manages failover.

- PHP + MySQL Client
Allows your application to send SQL commands to Aurora.

- Database Endpoints
Aurora exposes separate endpoints for readers and writers.

- End-to-End Data Flow
  Browser → EC2 Web App → Aurora Writer → Stored Rows


### 📁 Repository Structure 

```
 📦 aurora-webapp-project
 ├── README.md
 ├── webapp/
   ├── SamplePage.php
   └── inc/dbinfo.inc

```
   
