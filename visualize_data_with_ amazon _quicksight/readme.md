
# 📊 Visualize Data with Amazon QuickSight

This project demonstrates how I used **Amazon S3** and **Amazon QuickSight** to turn a raw dataset into a professional dashboard.  
It’s a full, step-by-step guide — from creating the bucket to troubleshooting issues like the common `403 Forbidden` error.

---

## ✨ Why This Project?
I wanted to learn how businesses store data in the cloud and transform it into insights with visual dashboards.  
By combining **S3** for storage and **QuickSight** for BI (Business Intelligence), I got hands-on experience with cloud analytics.

---

## 🛠️ Tech Stack
- **Amazon S3** → Store dataset files (CSV/Excel)  
- **Amazon QuickSight** → Visualization & dashboard tool  
- **Manifest.json** → File QuickSight uses to locate S3 data  

---

## 🚀 Step-by-Step Process

### 1️⃣ Create an S3 Bucket
1. Go to AWS Console → Search **S3** → Click **Create bucket**.  
2. Configure:
   - **Name**: must be globally unique (e.g., `quicksight-data-portfolio`).  
   - **Region**: same region as QuickSight.  
   - **Object ownership**: set to **Bucket owner preferred**.  
   - **Block Public Access**: keep ON for production, OFF only for testing.  
3. Click **Create bucket**.  

📸 Screenshot:  

<img width="1816" height="798" alt="Screenshot 2025-09-22 154229" src="https://github.com/user-attachments/assets/b62a7705-d18e-47db-83c0-479fd54dcba6?raw=true" />


---

### 2️⃣ Upload Your Dataset
1. Open your new bucket → Click **Upload**.  
2. Add `netflix_title.csv` (or Excel file).  
3. Copy the **S3 URI** (e.g., `s3://quicksight-data-portfolio/data/dataset.csv`).  

📸 Screenshot: 

<img width="1875" height="860" alt="Screenshot 2025-09-23 094814" src="https://github.com/user-attachments/assets/251011ae-05a5-41dc-8a74-0bcb74d28f4e?raw=true" />


---

### 3️⃣ Create a Manifest File
QuickSight needs a **manifest.json** file to locate your S3 data.

```json
{
  "fileLocations": [
    {
      "URIs": [
        "s3://quicksight-data-portfolio/data/dataset.csv"
      ]
    }
  ],
  "globalUploadSettings": {
    "format": "CSV",
    "delimiter": ",",
    "containsHeader": "true"
  }
}
```
Save this as manifest.json.

Upload it into your bucket (e.g., s3://quicksight-data-portfolio/manifest/manifest.json).

📸 Screenshot:


<img width="1889" height="861" alt="Screenshot 2025-09-23 094959" src="https://github.com/user-attachments/assets/370675a0-83c1-4aad-b16a-112efb2c2c59?raw=true" />


---


4️⃣Create a Dataset in QuickSight
- Search for quicksight on your aws
- Create an account (Note it won't work for a free tier account)
📸 Screenshot:

<img width="1829" height="954" alt="Screenshot 2025-09-22 154749" src="https://github.com/user-attachments/assets/f3e4091f-a000-4df8-9840-6ff48de5d02a?raw=true" />

- QuickSight → Datasets → New dataset.

- Choose S3 as the source.

- Upload your manifest.json (or provide the S3 URI).

- Validate → Import into SPICE for faster analysis.

📸 Screenshot:

<img width="877" height="438" alt="Screenshot 2025-09-22 182820" src="https://github.com/user-attachments/assets/a988b8e9-66a3-456e-b602-cfed0ba2dc8a?raw=true" />


5️⃣ Build Visualizations

- Drag-and-drop fields into charts.

Example: COuuntry, tittle ,listin.

Add filters (Year, Category).

Format and rename visuals for clarity.
📸 Screenshot:
<img width="842" height="790" alt="Screenshot 2025-09-22 231649" src="https://github.com/user-attachments/assets/8f444c3f-6532-486d-b8b1-c543ef23f85c?raw=true" />
