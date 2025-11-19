# Load Data into DynamoDB (Step-by-Step Guide)

######  This project walks through creating DynamoDB tables, loading data, and editing items using both the AWS Console and AWS CloudShell + AWS CLI. It’s designed to mirror a real workflow you’d follow as a cloud engineer setting up non-relational databases on AWS.


## 📌 Overview

###### You’ve just joined the example engineering team as a Data Engineer. Your job in this project is to prepare DynamoDB so it can store the platform’s community data: projects, videos, comments, forums, students—everything.

By the end, you’ll have:

- Created tables in DynamoDB

- Loaded structured JSON data using AWS CloudShell

- Explored and edited items in the DynamoDB console

- Cleaned up your environment to avoid charges

<img width="966" height="452" alt="load_data_into_dynamoDB" src="https://github.com/user-attachments/assets/18e0872c-a0fd-47d9-bf2b-1c2d37287788?raw=true" />

----
### Step 1  Log in Using Your IAM Admin User

- Use your IAM Admin User (not the root account) to sign in to the AWS Console.
- This is standard practice for security.

### Step 2  Create Your First DynamoDB Table (Console Method)

- We start by building a simple table manually to understand the fundamentals.

#### 2.1 Open DynamoDB Console

Navigate to:

- AWS Console → DynamoDB → Tables → Create table

#### 2.2 Table Setup

- Table name: NextWorkStudents

- Partition key: StudentName (String)

#### 2.3 Customize Settings

- Select Customize settings

##### Under Read/Write capacity settings:

Turn Auto scaling OFF

##### Set:

- Read capacity units: 1

- Write capacity units: 1

- Create the table.

📸 Screenshot:

<img width="856" height="919" alt="Screenshot 2025-11-19 222740" src="https://github.com/user-attachments/assets/7a5930b8-deeb-4467-9933-d57ffba3bea9?raw=true" />

 
2.4 Add Your First Item

##### Inside the table:

- Go to Explore table items → Create item

##### Add:

- StudentName: Nikko

##### Add new attribute:

- ProjectsComplete: 4 (Number)

Save the item.

This step introduces how attributes work in DynamoDB—each item can have its own unique attributes.

📸 Screenshot:

  <img width="900" height="768" alt="Screenshot 2025-11-19 223124" src="https://github.com/user-attachments/assets/00afbe6e-1446-45a1-a6a3-a4d26499581f?raw=true" />

---
### Step 3  Create DynamoDB Tables Using AWS CloudShell

Manual entry works for learning, but real projects need automation.
CloudShell already includes AWS CLI, so it makes life easy.

###### 3.1 Open CloudShell

- Click the CloudShell icon at the top of the console and wait for it to initialize.

##### 3.2 Create the Four Project Tables

- Run the following commands:
```
aws dynamodb create-table \
    --table-name ContentCatalog \
    --attribute-definitions AttributeName=Id,AttributeType=N \
    --key-schema AttributeName=Id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1

aws dynamodb create-table \
    --table-name Forum \
    --attribute-definitions AttributeName=Name,AttributeType=S \
    --key-schema AttributeName=Name,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1

aws dynamodb create-table \
    --table-name Post \
    --attribute-definitions AttributeName=ForumName,AttributeType=S AttributeName=Subject,AttributeType=S \
    --key-schema AttributeName=ForumName,KeyType=HASH AttributeName=Subject,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1

aws dynamodb create-table \
    --table-name Comment \
    --attribute-definitions AttributeName=Id,AttributeType=S AttributeName=CommentDateTime,AttributeType=S \
    --key-schema AttributeName=Id,KeyType=HASH AttributeName=CommentDateTime,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
```
##### 3.3 Wait for All Tables to Be Created
```
aws dynamodb wait table-exists --table-name ContentCatalog
aws dynamodb wait table-exists --table-name Forum
aws dynamodb wait table-exists --table-name Post
aws dynamodb wait table-exists --table-name Comment

```
- Refresh your DynamoDB Tables page to confirm all four tables appear.

📸 Screenshot:

<img width="1902" height="837" alt="Screenshot 2025-11-19 225439" src="https://github.com/user-attachments/assets/a58e2f3b-cb41-4941-adf8-044f5145d2bd?raw=true" />

### Step 4  Load Data into the Tables
##### 4.1 Download and Unzip the Sample Data
```
curl -O https://storage.googleapis.com/nextwork_course_resources/courses/aws/AWS%20Project%20People%20projects/Project%3A%20Query%20Data%20with%20DynamoDB/nextworksampledata.zip

unzip nextworksampledata.zip
cd nextworksampledata
ls
```
##### Inside the folder, you’ll see:
 
- ContentCatalog.json

- Forum.json

- Post.json

- Comment.json

##### 4.2 Load Each JSON File into Its Matching Table
```
aws dynamodb batch-write-item --request-items file://ContentCatalog.json
aws dynamodb batch-write-item --request-items file://Forum.json
aws dynamodb batch-write-item --request-items file://Post.json
aws dynamodb batch-write-item --request-items file://Comment.json

```
###### You should see:

- "UnprocessedItems": {}


- This means the data was inserted correctly.

### Step 5  Explore and Edit Table Data
###### 5.1 View Loaded Data

####### In the DynamoDB console:

- Go to Tables → ContentCatalog → Explore table items

####### You’ll see:

- Partition key: Id

- Mixed item types:

- Some ContentType = Project

- Some ContentType = Video

📸 Screenshot:


<img width="1704" height="891" alt="Screenshot 2025-11-19 230252" src="https://github.com/user-attachments/assets/f98f71c7-297e-456c-8ae4-e4b50628731c?raw=true" />


###### 5.2 Edit an Existing Item

- Click on the item with Id = 1.

###### Add a new attribute:

- Attribute name: StudentsComplete

- Type: String

- Value: Nikko

- Save the item.

- Observe that this attribute appears only on this item—illustrating DynamoDB’s flexible schema.

📸 Screenshot:


<img width="1919" height="884" alt="Screenshot 2025-11-19 230634" src="https://github.com/user-attachments/assets/8bdbb0a4-cd49-4033-b8be-644858765a34" />


### Step 6  Cleanup (Avoid Charges)

CloudShell is free, but DynamoDB tables are not unless you delete them.

Run:
```
aws dynamodb delete-table --table-name Comment
aws dynamodb delete-table --table-name Forum
aws dynamodb delete-table --table-name ContentCatalog
aws dynamodb delete-table --table-name Post
aws dynamodb delete-table --table-name NextWorkStudents
```

- All items inside each table are deleted automatically.
---
#### Key Concepts
- DynamoDB : A fully managed non-relational (NoSQL) key-value and document database.

- Attributes :Individual pieces of data inside items. Each item can have its own unique set of attributes.

- Partition Key :The primary key used to distribute and locate data efficiently.

- Sort Key :A secondary part of the primary key, allowing multiple items with the same partition key.

- RCUs/WCUs

- Read Capacity Units : how fast data can be read

- Write Capacity Units : how fast data can be written

  We set both to 1 to stay within the free tier.

- AWS CloudShell :Browser-based shell with AWS CLI pre-installed—perfect for creating tables and loading data quickly.
