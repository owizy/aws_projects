# 🛡️ AI Threat Detection Pipeline on AWS

## 🚨 Problem Statement

### The Security Challenge

Modern cloud environments face increasingly sophisticated and evolving security threats that require immediate detection and response. Organizations struggle with:

#### 1. **Lack of Real-Time Threat Visibility**
- Security incidents can go undetected for days or weeks
- Manual log analysis is time-consuming and error-prone
- Traditional security tools can't keep pace with cloud-native threats
- By the time threats are discovered, significant damage has already occurred

#### 2. **Slow Incident Response Times**
- Manual investigation and remediation can take hours or days
- Security teams are overwhelmed with alert fatigue
- Critical vulnerabilities remain unpatched during investigation
- Attackers have time to escalate privileges and exfiltrate data

#### 3. **Complex Multi-Service Monitoring**
- AWS environments generate massive volumes of log data from:
  - CloudTrail (API activity)
  - VPC Flow Logs (network traffic)
  - DNS query logs
  - Application logs
- Correlating events across services is extremely difficult
- Security teams lack unified visibility

#### 4. **Common Attack Scenarios**
- **Credential Compromise**: Stolen AWS access keys used from unauthorized locations
- **Cryptocurrency Mining**: Unauthorized EC2 instances mining cryptocurrency
- **Data Exfiltration**: Unusual data transfers to external IP addresses
- **Privilege Escalation**: Attackers gaining elevated permissions
- **Malware Communication**: EC2 instances communicating with known malicious domains
- **Port Scanning**: Reconnaissance activities targeting your infrastructure

### Real-World Impact

Without automated threat detection and response:
- **Average breach detection time**: 207 days (IBM 2024 Cost of Data Breach Report)
- **Average cost of a data breach**: $4.45 million
- **Ransomware attacks** increasing by 13% year-over-year
- **Compliance violations** resulting in regulatory fines and penalties
- **Reputation damage** leading to customer trust erosion

---

## ✅ Solution Overview

### AI-Powered Automated Threat Detection System

We'll build a **serverless, real-time security monitoring pipeline** that:

1. ✅ **Continuously monitors** your AWS environment 24/7
2. ✅ **Detects threats instantly** using AI and machine learning
3. ✅ **Responds automatically** to security incidents
4. ✅ **Notifies security teams** with human-readable alerts
5. ✅ **Provides actionable recommendations** for remediation

### How It Works

Our solution leverages AWS's native security services to create an intelligent, automated defense system:

#### **Amazon CloudTrail** 📝
- Records every API call made in your AWS account
- Tracks who did what, when, and from where
- Provides a complete audit trail for compliance and forensics
- Feeds activity data to GuardDuty for analysis

#### **Amazon GuardDuty** 🤖
- **AI-powered threat intelligence** using machine learning models
- Analyzes billions of events across multiple data sources
- Leverages AWS threat intelligence feeds and third-party sources
- Detects 90+ different threat types including:
  - Backdoors and botnets
  - Cryptocurrency mining
  - Trojan malware
  - Unauthorized access attempts
  - Command and control activity
  - Data exfiltration

#### **Amazon EventBridge** 🔄
- Event-driven serverless event bus
- Routes GuardDuty findings to appropriate targets
- Filters events based on severity, type, or custom patterns
- Triggers multiple actions simultaneously

#### **AWS Lambda** ⚡
- Serverless compute for automated response
- Transforms complex JSON findings into readable messages
- Can perform automated remediation actions like:
  - Isolating compromised instances
  - Revoking IAM credentials
  - Updating security groups
  - Creating support tickets

#### **Amazon SNS** 📧
- Simple Notification Service for real-time alerts
- Sends formatted notifications via:
  - Email
  - SMS
  - Slack/Teams webhooks
  - PagerDuty
  - Mobile push notifications

### Why This Solution?

✅ **Fully Managed** - No infrastructure to maintain
✅ **Serverless** - Pay only for what you use
✅ **Scalable** - Handles any volume of events
✅ **Real-Time** - Sub-minute detection and response
✅ **Intelligent** - AI-powered detection reduces false positives
✅ **Compliant** - Meets SOC 2, PCI-DSS, HIPAA requirements

---

## 🏗️ Architecture

![aws_ai_threat_detection_pipeline](https://github.com/user-attachments/assets/57baa773-3f6b-4303-8e63-0fe1d755ce2d)


### Data Flow Explained

1. **Event Capture** → CloudTrail records all AWS API activity
2. **AI Analysis** → GuardDuty analyzes logs using ML models and threat intel
3. **Threat Detection** → When suspicious activity is found, a "finding" is created
4. **Event Routing** → EventBridge receives the finding and matches it to rules
5. **Parallel Actions** → EventBridge triggers Lambda and SNS simultaneously
6. **Message Formatting** → Lambda transforms JSON into human-readable text
7. **Alert Delivery** → SNS sends formatted alerts to security team
8. **Response** → Team investigates and remediates based on recommendations

---

## 📦 Prerequisites

### Required AWS Services & Permissions

#### 1. **AWS Account**
- Active AWS account with billing enabled
- IAM user with administrative access or these specific permissions:
  - `GuardDutyFullAccess`
  - `CloudTrailFullAccess`
  - `AmazonSNSFullAccess`
  - `AWSLambda_FullAccess`
  - `AmazonEventBridgeFullAccess`
  - `IAMFullAccess` (for creating Lambda execution roles)

#### 2. **AWS CLI** (for testing)
- AWS CLI version 2.x or higher installed
- Configured with your credentials:
  ```bash
  aws configure
  ```

---

## 🚀 Step-by-Step Implementation

### Step 1: Enable CloudTrail

CloudTrail records all API activity in your AWS account. GuardDuty needs this data to detect threats.

#### Why CloudTrail?
- Creates an audit trail of all actions in your account
- Tracks who, what, when, and where for every API call
- Essential for compliance and forensic investigations
- Feeds data to GuardDuty for threat analysis

#### Instructions:

1. **Navigate to CloudTrail Console**
   - Sign in to AWS Management Console
   - In the search bar, type **"CloudTrail"**
   - Click on **CloudTrail** from the results

2. **Create a New Trail**
   - Click the **Create trail** button
   - **Trail name**: Enter `Management events`
   - **Storage location**: Select **Create new S3 bucket**
   - The bucket name will be auto-generated (e.g., `aws-cloudtrail-logs-123456789012-abc123`)
   - Keep the default settings

3. **Choose Log Events**
   - **Management events**: Keep checked (enabled by default)
   - This logs all API calls made in your account
   - **Read events**: Checked
   - **Write events**: Checked

4. **Review and Create**
   - Scroll to the bottom
   - Click **Create trail**
   - Wait for confirmation message: "Trail created successfully"

6. **Verify Trail is Logging**
   - Go back to **Trails** in the left sidebar
   - Your trail should show status: **Logging**
   - This means CloudTrail is now recording all activity

**✅ Checkpoint**: CloudTrail status shows "Logging" with a green indicator

📸 Screenshot:

<img width="1837" height="907" alt="Screenshot 2025-11-22 163310" src="https://github.com/user-attachments/assets/ffad3872-ef02-4336-8075-bde65db9a8b1?raw=true" />

---

### Step 2: Enable Amazon GuardDuty

GuardDuty is AWS's intelligent threat detection service that uses machine learning to identify malicious behavior.

#### What GuardDuty Detects:
- 🔴 Compromised EC2 instances
- 🔴 Reconnaissance activities (port scanning)
- 🔴 Unauthorized access attempts
- 🔴 Cryptocurrency mining
- 🔴 Malware and backdoors
- 🔴 Data exfiltration attempts

#### Instructions:

1. **Navigate to GuardDuty Console**
   - In the search bar, type **"GuardDuty"**
   - Click on **GuardDuty** from the results

2. **Enable GuardDuty**
   - If this is your first time, you'll see a welcome screen
   - Click the **Get Started** button
   - Click **Enable GuardDuty**

3. **Wait for Initialization**
   - GuardDuty takes 5-10 minutes to start analyzing logs
   - You'll see a message: "GuardDuty is now enabled"
   - Status will show as **Enabled** with a green checkmark

4. **Verify GuardDuty is Active**
   - Click **Settings** in the left sidebar
   - Note down your **Detector ID** (you'll need this for testing later)
   - It looks like: `12abc34d56ef78gh90ij12kl34mn56op`
   - Copy it to a text file for later use

**✅ Checkpoint**: GuardDuty shows status "Enabled" and you have saved your Detector ID

📸 Screenshot:

<img width="1838" height="894" alt="Screenshot 2025-11-22 163602" src="https://github.com/user-attachments/assets/c61eda5c-44c1-43d1-b3d8-fe2ba4563cac?raw=true" />

---

### Step 3: Set Up SNS Topic for Notifications

SNS (Simple Notification Service) will send you email alerts whenever GuardDuty detects a threat.

#### Instructions:

1. **Navigate to SNS Console**
   - In the search bar, type **"SNS"**
   - Click on **Simple Notification Service**

2. **Create SNS Topic**
   - Click **Topics** in the left sidebar
   - Click the **Create topic** button

3. **Configure Topic**
   - **Type**: Select **Standard** (not FIFO)
   - **Name**: Enter `GuardDuty-Threat-Alerts`
   - **Display name** (optional): `GuardDuty Alerts`
   - Leave other settings as default
   - Click **Create topic**

4. **Copy Topic ARN**
   - After creation, you'll see your topic details
   - Copy the **ARN** (Amazon Resource Name)
   - It looks like: `arn:aws:sns:us-east-1:123456789012:GuardDuty-Threat-Alerts`
   - Save this ARN in a text file - you'll need it for Lambda configuration

5. **Create Email Subscription**
   - Click the **Create subscription** button
   - **Protocol**: Select **Email**
   - **Endpoint**: Enter your email address (e.g., `security@yourcompany.com`)
   - Click **Create subscription**
   - Status will show: **Pending confirmation**

6. **Confirm Email Subscription**
   - Check your email inbox (including spam/junk folders)
   - Look for email from: **AWS Notifications**
   - Subject: "AWS Notification - Subscription Confirmation"
   - Click the **Confirm subscription** link in the email
   
   **Alternative confirmation method:**
   - Copy the confirmation URL from the email
   - Go back to SNS console
   - Click on your subscription
   - Click **Confirm subscription** button
   - Paste the URL and click **Confirm subscription**

7. **Verify Subscription**
   - Go to **Subscriptions** in the left sidebar
   - Your subscription status should now show: **Confirmed** ✅
   - If still pending, check your email again

**✅ Checkpoint**: SNS topic created and email subscription shows "Confirmed" status

📸 Screenshot:

 
<img width="1836" height="904" alt="Screenshot 2025-11-22 164716" src="https://github.com/user-attachments/assets/4b1a9f57-3b98-4283-86d3-81c5c3ce2a2a?raw=true" />


---

### Step 4: Create Lambda Function

Lambda will act as our "alert processor" - it takes complex JSON output from GuardDuty and transforms it into easy-to-read messages.

#### What This Lambda Function Does:
- 📥 Receives GuardDuty findings from EventBridge
- 🔍 Extracts key threat information (type, severity, affected resources)
- 📝 Formats a clean, human-readable message
- 📧 Publishes the formatted alert to SNS
- 💡 Provides remediation recommendations

#### Step 4.1: Create IAM Role for Lambda

1. **Navigate to IAM Console**
   - In search bar, type **"IAM"**
   - Click on **IAM** (Identity and Access Management)

2. **Create Role**
   - Click **Roles** in the left sidebar
   - Click **Create role** button

3. **Select Trusted Entity**
   - **Trusted entity type**: Select **AWS service**
   - **Use case**: Select **Lambda**
   - Click **Next**

4. **Add Permissions**
   - In the search box, type: `AWSLambdaBasicExecutionRole`
   - Check the box next to **AWSLambdaBasicExecutionRole**
   - This allows Lambda to write logs to CloudWatch
   - Click **Next**

5. **Name the Role**
   - **Role name**: Enter `GuardDuty-Lambda-Role`
   - **Description**: "Execution role for GuardDuty alert Lambda function"
   - Click **Create role**

**✅ Checkpoint**: IAM role "GuardDuty-Lambda-Role" is created

📸 Screenshot:


<img width="1837" height="912" alt="Screenshot 2025-11-22 165939" src="https://github.com/user-attachments/assets/b39c573d-f9f9-4548-bb12-fd583db610f9?raw=true" />

#### Step 4.2: Create the Lambda Function

1. **Navigate to Lambda Console**
   - In search bar, type **"Lambda"**
   - Click on **Lambda**

2. **Create Function**
   - Click **Create function** button
   - Select **Author from scratch**

3. **Basic Information**
   - **Function name**: `GuardDuty-Automated-Response`
   - **Runtime**: Select **Python 3.13** (or latest Python 3.x)
   - **Architecture**: **x86_64** (default)

4. **Permissions**
   - Expand **Change default execution role**
   - Select **Use an existing role**
   - **Existing role**: Select `GuardDuty-Lambda-Role`
   - Click **Create function**

5. **Add Function Code**
   - You'll be taken to the function's code editor
   - Delete the default code in `lambda_function.py`
   - Copy and paste the following code:

```python

import boto3
import json
import os
from datetime import datetime

sns = boto3.client('sns')

def lambda_handler(event, context):
    try:
        detail = event["detail"]
        instance_id = detail["resource"]["instanceDetails"]["instanceId"]
        public_ip = detail["resource"]["instanceDetails"]["networkInterfaces"][0]["publicIp"]
        finding_type = detail["type"]
        region = detail["region"]
        description = detail["description"]
        time = detail["service"]["eventFirstSeen"]
        profile = detail["resource"]["instanceDetails"]["iamInstanceProfile"]["arn"]
        remote_ip = detail["service"]["action"]["networkConnectionAction"]["remoteIpDetails"]["ipAddressV4"]
        remote_port = detail["service"]["action"]["networkConnectionAction"]["remotePortDetails"]["port"]
        
        readable_message = f"""
🚨 GuardDuty Alert: Trojan Activity Detected

🔍 Type: {finding_type}
💡 Description: {description}

🖥 Instance ID: {instance_id}
🔐 Instance Profile: {profile}
🌐 Public IP: {public_ip}
➡️ Remote IP: {remote_ip}:{remote_port}
📍 Region: {region}
🕒 Time: {datetime.strptime(time, "%Y-%m-%dT%H:%M:%S.%fZ").strftime('%Y-%m-%d %H:%M:%S')} UTC

🧠 Recommendation:
Isolate or stop the EC2 instance and investigate for malware or unauthorized traffic.

📘 Learn more: https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings.html
"""

        sns.publish(
            TopicArn=os.environ["SNS_TOPIC_ARN"],
            Subject="🚨 GuardDuty Alert: EC2 Threat Detected",
            Message=readable_message
        )

        return {
            'statusCode': 200,
            'body': f"Formatted alert sent to SNS topic for instance {instance_id}"
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'body': f"Error processing event: {str(e)}"
        }

```

6. **Deploy the Code**
   - Click **Deploy** button (orange button at top)
   - Wait for success message: "Successfully updated the function GuardDuty-Automated-Response"

**✅ Checkpoint**: Lambda function created with code deployed

#### Step 4.3: Configure Environment Variables

1. **Go to Configuration Tab**
   - In your Lambda function, click the **Configuration** tab
   - Click **Environment variables** in the left menu

2. **Add Environment Variable**
   - Click **Edit**
   - Click **Add environment variable**
   - **Key**: `SNS_TOPIC_ARN`
   - **Value**: Paste the SNS Topic ARN you saved earlier
     - Should look like: `arn:aws:sns:us-east-1:123456789012:GuardDuty-Threat-Alerts`
   - Click **Save**

**✅ Checkpoint**: Environment variable configured with SNS Topic ARN

#### Step 4.4: Add SNS Publish Permission to Lambda Role
The Lambda function needs permission to publish messages to SNS.

1. **Navigate to IAM from Lambda**

- In your Lambda function, stay on the Configuration tab
- Click Permissions in the left menu
- Under Execution role, click the role name GuardDuty-Lambda-Role
- This opens the IAM role in a new tab


Add Inline Policy

- In the IAM role page, click Add permissions dropdown
- Select Create inline policy


- Create Policy Using JSON

- Click the JSON tab
- Delete the default JSON
- Paste the following policy:
```


json{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:YOUR-REGION:YOUR-ACCOUNT-ID:GuardDuty-Threat-Alerts"
    }
  ]
}
```
- Update the Policy

**⚠️ IMPORTANT: Replace the placeholders in the Resource ARN:**

-Replace YOUR-REGION with your AWS region (e.g., us-east-1)
-Replace YOUR-ACCOUNT-ID with your 12-digit AWS account ID

```
Example: arn:aws:sns:us-east-1:1234567891011:GuardDuty-Threat-Alerts
```

 **Name and Create Policy**

- Click Next
- Policy name: Enter AllowSNSPublish
- Click Create policy



✅ Checkpoint: Lambda function has permission to publish to SNS topic

### Step 5: Integrate Services with EventBridge
- EventBridge acts as the "router" - it detects GuardDuty findings and triggers our Lambda function.
#### Instructions:

**Navigate to EventBridge Console**

- In search bar, type "EventBridge"
- Click on Amazon EventBridge


- Create Rule

- Click Rules in the left sidebar
- Click Create rule button


**Define Rule Detail**

- Name: Enter GuardDuty-EC2-Threat-Rule
- Description: "Triggers Lambda function when GuardDuty detects EC2 threats"
- Event bus: Keep as default
- Rule type: Select Rule with an event pattern
- Click Next


**Build Event Pattern**

- Event source: Select AWS events or EventBridge partner events
- Method: Select Custom pattern (JSON editor)
- In the Event pattern box, paste:

```

json{
  "source": ["aws.guardduty"],
  "detail-type": ["GuardDuty Finding"],
  "detail": {
    "type": ["Trojan:EC2/BlackholeTraffic"]
  }
}
```
- This pattern matches EC2 instances communicating with known malicious IPs
- You can modify this later to match other threat types
- Click Next


**Select Target**

- Target types: Select AWS service
- Select a target: Choose Lambda function
- Function: Select GuardDuty-Automated-Response from dropdown
- Click Next



**Review and Create**

- Review all settings carefully
- Click Create rule
- You'll see success message: "Rule GuardDuty-EC2-Threat-Rule was created successfully"

✅ Checkpoint: EventBridge rule created and active with Lambda as target

📸 Screenshot:

<img width="1919" height="848" alt="Screenshot 2025-11-22 174015" src="https://github.com/user-attachments/assets/3de06c45-c431-4111-92a1-95a7628c6848?raw=true" />

---

### Step 6: Test the System
Now let's verify that everything works by generating a sample GuardDuty finding!
#### Instructions:

**Get Your Detector ID**

- Go to GuardDuty Console
- Click Settings in the left sidebar
- Copy your Detector ID
- It looks like: 12abc34d56ef78gh90ij12kl34mn56op


**Open AWS CloudShell or Terminal**

##### Option A - AWS CloudShell (Easiest):

- In AWS Console, click the CloudShell icon (terminal icon) in the top-right toolbar
- Wait for CloudShell to initialize (~30 seconds)
- Run this command (replace YOUR_DETECTOR_ID with your actual Detector ID):

```

aws guardduty create-sample-findings \
--detector-id YOUR_DETECTOR_ID \
--finding-types "Trojan:EC2/BlackholeTraffic"
```
Option B - Local Terminal:

- Open your terminal/command prompt
- Ensure AWS CLI is installed and configured:

```
       aws configure
```
- Generate Sample Finding

- Run this command (replace YOUR_DETECTOR_ID with your actual Detector ID):
 ```

aws guardduty create-sample-findings \
--detector-id YOUR_DETECTOR_ID \
--finding-types "Trojan:EC2/BlackholeTraffic"
```


#### 6.1 Verification   
- Now, let's verify that each component of our project worked as expected.

**Check for the SNS Notification**
-  Go to your email inbox that you subscribed to the SNS topic.
-📬 You should instantly receive an alert email that looks like this:
- 🚨 GuardDuty Alert: Threat Detected

📸 Screenshot:

<img width="1399" height="695" alt="Screenshot 2025-11-22 174621" src="https://github.com/user-attachments/assets/6d5f99b4-fa5c-458a-b3f7-c17e62e51fc4?raw=true" />


**Check GuardDuty Findings**
- Go to GuardDuty Console, you'll now see a full list of GuardDuty findings, each row representing a detection event:
- Finding Type:
```
Recon:EC2/Portscan
Trojan:EC2/BlackholeTraffic
UnauthorizedAccess:EC2/TorClient
• Severity Type: Medium
```

**Check the Lambda Function Logs**
• Navigate to the Lambda console and select your GuardDuty-Automated-Response function.
• Click on the Monitor tab, and then View CloudWatch logs.

---
## 🗑️ Cleaning Up
When you are finished with the project, you can delete all the created AWS resources to avoid incurring further costs.
