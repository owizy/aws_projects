# Query Data with DynamoDB ( Step-by-Step Guide)

##### This project builds on the DynamoDB setup from the previous exercise. Now that all your data is loaded, the goal here is to learn how to query DynamoDB using both the AWS Console and the AWS CLI. You’ll also work with transactions to update related tables in a single atomic operation — something you’ll see in real-world systems all the time.

<img width="966" height="452" alt="load_data_into_dynamoDB" src="https://github.com/user-attachments/assets/1069e07a-31b5-490a-ac5d-0f70f28bd029?raw=true" />

----
## 📌 What This Project Covers

- By the end of this guide, you’ll know how to:

- Set up DynamoDB tables using the AWS CLI

- Load JSON data into your tables using CloudShell

- Query items using both the console UI and AWS CLI

- Use partition keys and sort keys effectively

- Run transactions to update multiple tables at once

- Clean up all DynamoDB resources safely

---

## Step 1  Log In Using Your IAM Admin User

- Sign in to the AWS Management Console with your IAM Admin User, not your root account.
- This is standard AWS security practice.

---
## Step 2  Create Your DynamoDB Tables Using CloudShell

- Open AWS CloudShell from the top navigation bar. It comes with AWS CLI pre-installed, so you can run commands immediately.

- Run the following commands to create the project’s four core tables:
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
- Wait for all tables to finish creating:
```
aws dynamodb wait table-exists --table-name ContentCatalog
aws dynamodb wait table-exists --table-name Forum
aws dynamodb wait table-exists --table-name Post
aws dynamodb wait table-exists --table-name Comment

```
- Go back to the DynamoDB console and confirm the tables are visible.

 📸 Screenshot:

<img width="1881" height="806" alt="Screenshot 2025-11-21 074306" src="https://github.com/user-attachments/assets/01bfe382-5ec8-44c7-93b9-d170decb0222?raw=true" />

---

## Step 3  Load Data into All Tables

- Open CloudShell again and download the pre-prepared dataset:
```
curl -O https://storage.googleapis.com/nextwork_course_resources/courses/aws/AWS%20Project%20People%20projects/Project%3A%20Query%20Data%20with%20DynamoDB/nextworksampledata.zip

unzip nextworksampledata.zip
cd nextworksampledata

```
- Now load each file into its matching table:
```
aws dynamodb batch-write-item --request-items file://ContentCatalog.json
aws dynamodb batch-write-item --request-items file://Forum.json
aws dynamodb batch-write-item --request-items file://Post.json
aws dynamodb batch-write-item --request-items file://Comment.json
```

- If you see:
```
"UnprocessedItems": {}
```

- …everything loaded successfully.

- Go back to DynamoDB → Tables → ContentCatalog → Explore table items
- You should now see items for projects and videos, all identified by the Id partition key.
📸 Screenshot:

<img width="1704" height="891" alt="Screenshot 2025-11-19 230252" src="https://github.com/user-attachments/assets/ec321a02-d15b-4eec-a4df-642e019f4f56" />

--- 

## Step 4  Query Data Using the Console
### 4.1 Query by Partition Key

- Inside ContentCatalog, open the Query tab.

- Enter:

 Partition key: Id

 Value: 201

- Run the query — only that single item will appear.

### 4.2 Query a Table With Both a Partition and Sort Key

- Switch to the Comment table.

 Here you’ll see:

- Partition key → Id

- Sort key → CommentDateTime

- To find comments for a specific post after a certain date:

- Id: I have a question/Just Complete Project #7 Dependencies and CodeArtifacts

- Sort key condition → Greater than

- Value → 2024-09-01

- Run it — you should see only comments on or after September 1st, 2024.

### 4.3 Try Filtering (And See the Problem)

- Try filtering by commenter:

- Expand Filters

- Attribute name → PostedBy

- Value → User Abdulrahman

 Run
  
- DynamoDB throws an error because queries must include the partition key.
- This is why designing key structures upfront (data modelling) matters.

📸 Screenshot:
   
<img width="1909" height="662" alt="Screenshot 2025-11-21 080338" src="https://github.com/user-attachments/assets/a7c8a75e-a234-434f-bb8c-7f2e123cc974?raw=true" />

---
## Step 5  Query DynamoDB Using AWS CLI

### 5.1 Basic Read
```
aws dynamodb get-item \
    --table-name ContentCatalog \
    --key '{"Id":{"N":"201"}}'
```
### 5.2 Read With Strong Consistency + Projection
```
aws dynamodb get-item \
    --table-name ContentCatalog \
    --key '{"Id":{"N":"202"}}' \
    --projection-expression "Title, ContentType, Services" \
    --return-consumed-capacity TOTAL

```
- A strongly consistent read guarantees the latest version of the item.
- An eventually consistent read is cheaper and the default.
- Compare the consumed capacity values between runs.

---
## Step 6  Use a Transaction (Update 2 Tables at Once)

- When someone comments on a post, two tables need to update:

- Comment → insert the actual comment

- Forum → increase the comment count

- A single transaction ensures both happen together or neither happens.

- Run:
```
aws dynamodb transact-write-items --client-request-token TRANSACTION1 --transact-items '[
    {
        "Put": {
            "TableName" : "Comment",
            "Item" : {
                "Id" : {"S": "Events/Do a Project Together - NextWork Study Session"},
                "CommentDateTime" : {"S": "2024-9-27T17:47:30Z"},
                "Comment" : {"S": "Excited to attend!"},
                "PostedBy" : {"S": "User Connor"}
            }
        }
    },
    {
        "Update": {
            "TableName" : "Forum",
            "Key" : {"Name" : {"S": "Events"}},
            "UpdateExpression": "ADD Comments :inc",
            "ExpressionAttributeValues" : { ":inc": {"N" : "1"} }
        }
    }
]'


Verify the update:

aws dynamodb get-item \
    --table-name Forum \
    --key '{"Name" : {"S": "Events"}}'

```
- You'll see the Comments count increased.

📸 Screenshot:

 
<img width="1916" height="840" alt="Screenshot 2025-11-21 080859" src="https://github.com/user-attachments/assets/ef7903fc-f408-427a-89cc-66845b88bc23?raw=true" />

--
## Step 7  Delete All Resources
```
aws dynamodb delete-table --table-name Comment
aws dynamodb delete-table --table-name Forum
aws dynamodb delete-table --table-name ContentCatalog
aws dynamodb delete-table --table-name Post
cd ..
rm -rf nextworksampledata nextworksampledata.zip
```

