# Encrypt Data with AWS KMS - Complete Guide

A step-by-step project demonstrating how to encrypt a database using AWS Key Management Service (KMS) to secure sensitive data and prevent unauthorized access.

## 🔴 Problem Statement
### The Security Challenge

In modern cloud applications, storing sensitive data without proper encryption poses critical security risks:

- **Plain Text Storage**: Database credentials, API keys, and sensitive user data stored in plain text are vulnerable to breaches
- **Insider Threats**: System administrators or anyone with server access can easily view unencrypted data
- **Compliance Requirements**: Regulations like GDPR, HIPAA, and PCI-DSS mandate encryption of sensitive data at rest
- **Data Breach Costs**: A single compromised API key can provide attackers access to entire infrastructure stacks
- **Key Management Complexity**: Managing encryption keys manually is error-prone and difficult to audit

### Real-World Impact

Without proper encryption:
- Database credentials in configuration files can be accessed by anyone with file system permissions
- Stolen AWS keys can lead to unauthorized access to multiple services
- Data breaches can result in financial losses, reputation damage, and legal penalties

---

## ✅ Solution Overview

### AWS Key Management Service (KMS)

AWS KMS provides a managed encryption solution that:

1. **Centralized Key Management**: Create, rotate, and manage encryption keys from a single service
2. **Automatic Encryption**: Seamlessly encrypt data at rest in AWS services like RDS, DynamoDB, and S3
3. **Fine-Grained Access Control**: Use IAM policies to control who can use encryption keys
4. **Envelope Encryption**: Efficiently encrypt large datasets using data keys

### How It Works

AWS KMS uses **envelope encryption**:
1. A Customer Master Key (CMK) is created in KMS
2. KMS generates data keys encrypted by the CMK
3. Data keys encrypt your actual data
4. Only the encrypted data key is stored with your data
5. Decryption requires both the encrypted data key and access to the CMK

This approach provides security, scalability, and performance for encrypting databases and sensitive information.

---

## 🏗️ Project Architecture


<img width="804" height="386" alt="encrypt_data_with_aws_kms" src="https://github.com/user-attachments/assets/51e871a2-a193-4171-a074-17ece5281cb4?raw=true" />

---

## 📦 Prerequisites

### AWS Service Access

Ensure you have permissions for:
- AWS Key Management Service (KMS)
- Amazon RDS or DynamoDB
- AWS Identity and Access Management (IAM)
---

## 🚀 Step-by-Step Implementation

### Step 1: Sign in to AWS Console

Access the AWS Management Console:

1. **Navigate to AWS Console**
   - Go to [https://console.aws.amazon.com](https://console.aws.amazon.com)
   - Sign in with your AWS account credentials
   - Select your preferred region from the top-right dropdown (e.g., US East N. Virginia)

2. **Verify Permissions**
   - Ensure your IAM user has the following permissions:
     - KMS full access or `AWSKeyManagementServicePowerUser`
     - RDS or DynamoDB access depending on your database choice
     - IAM read access for viewing roles and policies

---

### Step 2: Create a Customer Master Key (CMK)

Create your encryption key using the AWS Console:

1. **Navigate to KMS Dashboard**
   - In the AWS Console search bar, type "KMS" or "Key Management Service"
   - Click on **Key Management Service** from the results
   - From the left sidebar, click **Customer managed keys**

2. **Create New Key**
   - Click the orange **Create key** button in the top-right

3. **Configure Key Type**
   - **Key type**: Select **Symmetric** (default)
   - **Key usage**: Select **Encrypt and decrypt** (default)
   - Click **Next**

4. **Add Labels**
   - **Alias**: Enter `kms-key`
   - **Description**: Enter "CMK for encrypting database and sensitive data"
   - **Tags** (optional but recommended):
     - Key: `Environment`, Value: `Production`
     - Key: `Purpose`, Value: `Database-Encryption`
     - Key: `Project`, Value: `KMS-Demo`
   - Click **Next**

5. **Define Key Administrative Permissions**
   - **Key administrators**: Check the box next to your IAM user
   - This allows you to manage and delete the key
   - (Optional) Select additional IAM users or roles who should administer this key
   - **Key deletion**: Keep the default "Allow key administrators to delete this key" checked
   - Click **Next**

6. **Define Key Usage Permissions**
   - **Key users**: Check the box next to your IAM user
   - This allows you to use the key for encryption and decryption
   - **Other AWS accounts**: Leave blank (unless sharing with other accounts)
   - (Optional) Select IAM roles that AWS services will use (like RDS service role)
   - Click **Next**

7. **Review and Create**
   - Review all your settings carefully
   - Scroll through the key policy preview to see the JSON policy
   - Click **Finish**

8. **Note Your Key Details**
   - You'll be redirected to the keys list
   - Click on your new key (`kms-key`)
   - **Copy and save** the following:
     - **Key ID**: (looks like `1234abcd-12ab-34cd-56ef-1234567890ab`)
     - **ARN**: (looks like `arn:aws:kms:us-east-1:123456789012:key/...`)
   - These will be needed for future steps

**✅ Checkpoint**: You should now see your key in the "Customer managed keys" list with status "Enabled"

📸 Screenshot:

<img width="1898" height="811" alt="Screenshot 2025-11-22 103049" src="https://github.com/user-attachments/assets/7e0c424b-c7ca-49ea-b8f6-8891e1bc90d4?raw=true" />


---

### Step 3: Verify IAM Permissions

Ensure your IAM user has the correct permissions to use the KMS key:

1. **Navigate to IAM Console**
   - In the search bar, type "IAM"
   - Click on **IAM** (Identity and Access Management)

2. **Check User Permissions**
   - Click **Users** from the left sidebar
   - Find and click on your username
   - Click the **Permissions** tab

3. **Verify KMS Permissions**
   - Look for policies that include KMS permissions
   - You should have one of these:
     - `AWSKeyManagementServicePowerUser` (managed policy)
     - A custom policy with KMS encrypt/decrypt permissions
   - If you don't see KMS permissions, you'll need an administrator to add them

4. **Confirm Key Access**
   - Go back to **KMS Console**
   - Click on your `kms-key`
   - Scroll down to **Key users** section
   - Verify your IAM user is listed

**✅ Checkpoint**: Your IAM user should be listed as both a key administrator and key user

---

### Step 4: Create an Encrypted Database

####  Amazon DynamoDB (NoSQL Table)

1. **Navigate to DynamoDB Console**
   - In the search bar, type "DynamoDB"
   - Click on **DynamoDB** from the results
   - Click **Create table** button

2. **Table Settings**
   - **Table name**: Enter `kms-table`
   - **Partition key**: Enter `ID` (Type: **String**)
   - **Sort key**: Leave blank (or add `OrderDate` as **Number** if desired)

3. **Table Settings**
   - Keep **Default settings** selected initially

4. **🔐 Encryption Settings (CRITICAL STEP)**
   - Scroll down to **Encryption at rest** section
   - Select **AWS owned key** dropdown and change it to:
   - Select **Stored in your account** option
   - Select **Customer managed CMK**
   - **AWS KMS key**: Select `kms-key` from dropdown
   - ⚠️ **Important**: Encryption type cannot be changed after creation!

5. **Review and Create**
   - Scroll to bottom
   - Click **Create table**
   - Wait 1-2 minutes for table creation

6. **Verify Creation**
   - You'll be redirected to the tables list
   - Your table should show status as "Active"
   - Click on the table name to view details

**✅ Checkpoint**: Table status is "Active" and shows your custom KMS key in encryption details


---

### Step 5: Enable Automatic Key Rotation

Enable automatic key rotation for enhanced security:

1. **Navigate to KMS Console**
   - Go back to **KMS** service
   - Click **Customer managed keys** from the left sidebar

2. **Select Your Key**
   - Find and click on `kms-key`

3. **Enable Rotation**
   - Click on the **Key rotation** tab
   - Click the **Edit** button
   - Check the box for **Automatically rotate this KMS key every year**
   - Click **Save changes**

4. **Verify Rotation**
   - You should see: "Automatic key rotation: Enabled"
   - The key will automatically rotate every 365 days
   - AWS keeps old key versions to decrypt previously encrypted data

**✅ Checkpoint**: Key rotation tab shows "Enabled" with next rotation date

---


## 🧪 Testing the Encryption

### Test 1: Verify Database Encryption Status

#### For DynamoDB:

1. **Navigate to DynamoDB Console**
   - Go to **DynamoDB** in AWS Console
   - Click **Tables** from the left sidebar

2. **Check Your Table**
   - Click on `kms-table`
   - Click on the **Additional settings** tab
   - Scroll down to **Encryption** section
   - You should see:
     - **Encryption type**: KMS
     - **KMS key ARN**: Shows your custom key

**✅ Expected Result**: Encryption shows "KMS" with your custom key ARN

📸 Screenshot:

<img width="1912" height="734" alt="Screenshot 2025-11-22 104727" src="https://github.com/user-attachments/assets/9448fde6-7474-4d6e-aa74-0c1f58f01cb9?raw=true" />

---

### Test 2: Add Sample Data (DynamoDB Example)

1. **Navigate to Your Table**
   - Go to DynamoDB Console
   - Click on `kms-table`
   - Click **Explore table items**

2. **Create Items**
   - Click **Create item** button
   - Enter sample data:
     - **ID**: `1`
   - Click **Create item**
3. **Verify Encryption**
   - The data is now stored encrypted at rest
   - AWS automatically encrypts/decrypts using your KMS key
   - The data appears in plain text in the console (after KMS decryption)
   - But on disk, it's fully encrypted

**✅ Expected Result**: You can view the data, but it's encrypted at rest using your KMS key

📸 Screenshot:


<img width="1878" height="880" alt="Screenshot 2025-11-22 105734" src="https://github.com/user-attachments/assets/c335777f-8bd5-4c46-bf09-5a3be7dfe1f5?raw=true" />


---


### Test 3: Test Access Control 

To verify that only authorized users can access the encrypted data:

1. **Create a Test IAM User** (if you have permissions)
   - Go to **IAM** console
   - Create a new user called `kms-user`
   - Attach `AmazonRDSReadOnlyAccess` or `AmazonDynamoDBReadOnlyAccess`
   - Do NOT give KMS permissions

2. **Attempt Access**
   - Sign in as the new user (use incognito window)
   - Try to view the encrypted database or table
   - Result: User can see the resource exists but CANNOT decrypt the data

3. **What This Proves**
   - Even users with database permissions cannot access encrypted data
   - They need explicit KMS key permissions
   - This provides defense-in-depth security

**✅ Expected Result**: Users without KMS permissions cannot decrypt the data
📸 Screenshot:

<img width="1821" height="893" alt="Screenshot 2025-11-22 112209" src="https://github.com/user-attachments/assets/a2c1288b-9a6a-4ef7-b760-5865e3a077c7?raw=true>" />

---

## 🛡️ Best Practices

### Security Best Practices

1. **Use Separate Keys**
   - Use different CMKs for different environments (dev, staging, production)
   - Create separate keys for different data classifications

2. **Implement Least Privilege**
   - Grant only necessary KMS permissions
   - Use separate key administrator and key user roles
   - Regularly audit IAM policies

3. **Enable Key Rotation**
   - Always enable automatic annual key rotation
   - For custom key material, implement manual rotation procedures

4. **Delete Keys Carefully**
   - Use a minimum waiting period of 7 days for key deletion
   - Ensure no encrypted data depends on the key before deletion

5. **Use Encryption Context**
   - Add encryption context for additional security
   - Useful for audit trails and preventing unauthorized decryption

### Operational Best Practices

1. **Monitor and Alert**
   - Set up CloudWatch alarms for unusual KMS activity
   - Monitor failed decryption attempts
   - Track key usage patterns

2. **Backup Strategy**
   - For RDS, snapshots are automatically encrypted with the same key
   - Test snapshot restoration regularly
   - Document key recovery procedures

3. **Cross-Region Replication**
   - Create replica keys in disaster recovery regions
   - Use KMS multi-region keys for global applications

4. **Documentation**
   - Document which keys protect which data
   - Maintain key lifecycle documentation
   - Create runbooks for key rotation and recovery

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "AccessDeniedException" when using KMS

**Cause**: Insufficient IAM permissions

**Solution**:
```bash
# Verify your permissions
aws kms describe-key --key-id alias/database-encryption-key

# Check IAM policies attached to your user/role
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

#### Issue 2: Cannot decrypt data

**Possible causes**:
- Key was disabled or deleted
- Insufficient permissions
- Wrong key used for decryption

**Solution**:
```bash
# Check key state
aws kms describe-key \
    --key-id alias/database-encryption-key \
    --query 'KeyMetadata.KeyState'

# Enable key if disabled
aws kms enable-key --key-id alias/database-encryption-key
```


#### Issue 3: High KMS costs

**Cause**: Too many encrypt/decrypt operations

**Solution**:
- Implement caching for frequently decrypted values
- Use envelope encryption with data keys
- Consider AWS KMS Hierarchical keyring for high-throughput applications

---
