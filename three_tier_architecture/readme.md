# 🏗️ Three-Tier Web Application on AWS (Lambda, DynamoDB, CloudFront, API Gateway, S3)

This project demonstrates how to build a fully serverless three-tier web application on AWS using:

- Amazon S3 – static website / frontend hosting

- Amazon CloudFront – global CDN + caching

- Amazon API Gateway – HTTP API front for backend

- AWS Lambda – backend logic / functions

- Amazon DynamoDB – NoSQL database for data persistence

The architecture enables you to host a static front-end, serve it globally, and have dynamic API-backed operations calling serverless functions which read/write data from DynamoDB.

🎯 Goals

- Host a static front-end in an S3 bucket

- Distribute the front-end globally using CloudFront

- Expose backend endpoints via API Gateway

- Implement backend logic in Lambda functions

- Use DynamoDB for storing & retrieving data

- Secure the architecture, integrate front-end and API, and deploy end-to-end

### 📦 Architecture Overview
<img width="1259" height="926" alt="Screenshot 2025-10-10 094215" src="https://github.com/user-attachments/assets/fd5e2802-0f6e-4b92-b6d7-d92d80110e18?raw=true" />

### 🏛 Architecture Summary (3 Tiers)

- Presentation Tier — Static frontend files (HTML / CSS / JS) hosted on S3, delivered via CloudFront

- Logic Tier — APIs exposed via API Gateway, backed by Lambda functions

- Data Tier — DynamoDB for storing application data

### ⚙️ Prerequisites & Setup

- An AWS account with permissions: IAM Admin, S3, CloudFront, Lambda, API Gateway, DynamoDB

- AWS CLI configured (optional but helpful)

- Basic frontend app (HTML/JS) that calls APIs (you may use a starter template)

- Use the same AWS region for all parts

### 🚀 Step-by-Step Implementation

Here’s the detailed workflow:

#### Step 1 — Presentation Tier (Frontend via S3 + CloudFront)

- Create an S3 Bucket

- In S3 console → Create bucket

- Name it (e.g. s3-three-tier-001)

- Choose region, defaults, do not block public access for now (you’ll restrict later via CloudFront)

- Create the bucket

- Upload Frontend Files

- In your local project, bundle the static site (HTML, CSS, JS, images)

- Upload the files into the S3 bucket

##### 📸 Screenshot:
<img width="1903" height="853" alt="Screenshot 2025-10-07 142042" src="https://github.com/user-attachments/assets/441ea235-e077-470e-a089-08db69400cf5?raw=true" />


- Create CloudFront Distribution

- Go to CloudFront → Create distribution

- Origin: point to your S3 bucket

- Use an Origin Access Identity (OAI) so that only CloudFront can fetch from the S3

- Set default root object (e.g. index.html)

- Configure caching, behaviors, HTTPS settings

- Create the distribution

- Restrict S3 to CloudFront Only

- After CloudFront is ready, update your S3 bucket policy to allow only the OAI (via CloudFront) to access the objects, removing the public bucket policy

- Test Frontend

- Visit the CloudFront domain (or custom domain)
##### 📸 Screenshot:
<img width="1912" height="1009" alt="Screenshot 2025-10-13 111709" src="https://github.com/user-attachments/assets/db2d4cc5-d388-4c26-8316-3dfe48f7f8d2?raw=true" />

---
#### Step 2 — Logic Tier (API via API Gateway + Lambda)

- Create Lambda Function(s)

- Lambda → Create function

- Runtime: Node.js, Python, etc.

- Function name: e.g. RetrieveUserdata
##### 📸 Screenshot:
<img width="838" height="610" alt="Screenshot 2025-10-09 155634" src="https://github.com/user-attachments/assets/1dd25138-21cf-4e2c-a02e-a7505ec02b16?raw=true" />

- click create method 

-In the code, implement logic to handle API calls (GET, POST, etc.)
```
// Import individual components from the DynamoDB client package
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const ddb = DynamoDBDocumentClient.from(ddbClient);

export async function handler(event) {
  const userId = event.queryStringParameters.userId;

  const params = {
    TableName: "UserData",
    Key: { userId }
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await ddb.send(command);

    if (Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(Item),
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": 'yourcloudfronturl'
        }
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No user data found" }),
        headers: {
           "Content-Type": "application/json" ,
           "Access-Control-Allow-Origin": 'yourcloudfronturl'
          }
      };
    }
  } catch (err) {
    console.error("Unable to retrieve data:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to retrieve user data" }),
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": 'yourcloudfronturl'
      }
    };
  }
}
```
- Deploy the code

  
- Create DynamoDB Table(s)

- DynamoDB → Create table

- Table name: e.g. UserData

- Define partition key (e.g. id) 

- Configure settings (on-demand mode is easier to start)

- Grant Lambda Permissions
##### 📸 Screenshot:

<img width="1497" height="876" alt="Screenshot 2025-10-13 124536" src="https://github.com/user-attachments/assets/40882e8b-6baf-465e-9c5c-1cc8cd451351?raw=true" />

- In IAM for the Lambda’s execution role, attach policy allowing DynamoDB actions (GetItem, PutItem, Query, etc.) on your table(s)



- Create API Gateway HTTP API (or REST API)

- API Gateway → Create API → HTTP API (or REST)

- Define routes (e.g. GET /users, POST /users)

- Integrate API Gateway routes with Lambda

- For each route + method, attach an integration to your Lambda function

- Enable CORS if the frontend and API are on different domains

- Deploy API

- Create a stage, e.g. prod

##### 📸 Screenshot:
<img width="888" height="766" alt="Screenshot 2025-10-13 121325" src="https://github.com/user-attachments/assets/bedfa533-26e3-41ec-bb99-f629aba05922?raw=true" />


Note the invoke URL

Test APIs
##### 📸 Screenshot:

<img width="1919" height="274" alt="Screenshot 2025-10-13 132136" src="https://github.com/user-attachments/assets/a7f611b4-0c1a-4777-bf3b-4c0046a99628?raw=true" />

---

### Step 3 — Data Tier & Integration

- Ensure Lambda reads / writes to DynamoDB

- From your Lambda handler, use AWS SDK to query, get or put items in DynamoDB

- Return HTTP responses containing data in JSON

- Connect Frontend to Backend

- In your frontend JavaScript, configure the API endpoint base URL

- Add functions to call API endpoints (e.g. fetch('/users'), POST /userss)

- Display data returned from the API

- End-to-End Test

- Load the website via CloudFront

- Try creating new items or fetching data

- Verify data is saved in DynamoDB
##### 📸 Screenshot:
<img width="1549" height="265" alt="Screenshot 2025-10-13 160514" src="https://github.com/user-attachments/assets/3cfb213d-dcc7-47af-9e9e-ae49596e11ad?raw=true" />
 
