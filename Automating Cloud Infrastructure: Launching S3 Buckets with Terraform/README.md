# 🏗️ Automating Cloud Infrastructure: Launching S3 Buckets with Terraform

## The Problem

Creating cloud resources manually through the AWS console is slow, error-prone, and impossible to repeat reliably. If you need to recreate the same infrastructure in a new region, a new account, or after an incident, you have to click through every screen again from memory  hoping you don't miss a setting. For teams, this becomes even worse: everyone configures things slightly differently, and there's no record of what was built or why.

This project solves that by using **Terraform** to define cloud infrastructure as code. Instead of clicking through the AWS console, you write a configuration file that describes exactly what you want, and Terraform builds it automatically  every time, consistently, in seconds.

---

## The Solution

A Terraform configuration that provisions an AWS S3 bucket with public access blocked, then uploads a file into it  all from the terminal. The infrastructure is defined in a single `main.tf` file that can be version-controlled, shared with teammates, and rerun to recreate the exact same environment on demand.

The result: reproducible, auditable cloud infrastructure that anyone on the team can deploy with a single command.

---

## Architecture
> <img width="1459" height="283" alt="s3_with_terraform" src="https://github.com/user-attachments/assets/2aa10c4b-aa7a-4dba-889b-dec7af6e778a?raw=true" />

---

## Services & Tools

| Service / Tool | Purpose |
|---|---|
| **Terraform** | Infrastructure as Code tool reads `main.tf` and provisions AWS resources automatically |
| **Amazon S3** | Object storage service  stores files (objects) in containers called buckets |
| **AWS CLI** | Command-line interface  lets Terraform authenticate with AWS from your local machine |
| **AWS IAM** | Identity and access management  used to create access keys for programmatic CLI access |

---

## Prerequisites

Before you begin, make sure you have:

- An **AWS account** with an IAM Admin user (do not use the root account)
- **VS Code** or any text editor installed on your local computer
- A terminal (PowerShell on Windows, Terminal on macOS/Linux)

---

## Step 1  Install Terraform

Terraform is the tool that reads your configuration files and builds your cloud infrastructure. Before anything else, it needs to be installed on your local machine.

**1.1** Open your browser and go to the official Terraform download page:

```
https://developer.hashicorp.com/terraform/downloads
```

**1.2** Select the correct download for your operating system. If you are unsure which version to pick on Windows, search for **System Information** in the Start menu and check whether your System Type says **x64-based** or **ARM-based PC**.

> <img width="1820" height="976" alt="Screenshot 2026-02-23 135333" src="https://github.com/user-attachments/assets/5390fa16-3bab-4f55-97c2-035b8cea51bb?raw=true" />

**1.3** Download and unzip the package. Move the unzipped folder to `C:\terraform` on Windows, or `/usr/local/bin` on macOS/Linux.

**1.4** Add Terraform to your system PATH so you can run it from any terminal window.

On **Windows**:

- Search for **Edit the system environment variables** in the Start menu
- Click **Environment Variables**
- Under **System Variables**, find and select **Path**, then click **Edit**
- Click **New** and enter `C:\terraform`
- Click **OK** on all dialogs and open a new terminal window


On **macOS/Linux**, add this line to your `~/.bashrc` or `~/.zshrc` file:

```bash
export PATH=$PATH:/usr/local/bin
```

Then run `source ~/.bashrc` or `source ~/.zshrc` to reload.

**1.5** Open a new terminal window and verify the installation:

```bash
terraform version
```

You should see the installed Terraform version printed in the terminal.

> <img width="1464" height="341" alt="Screenshot 2026-02-23 155031" src="https://github.com/user-attachments/assets/9e746d68-aff0-446e-b358-2152cf6c1246?raw=true" />

---

## Step 2  Set Up Your Terraform Project

Every Terraform project lives in its own folder. The folder holds your configuration files, and Terraform tracks the state of your infrastructure alongside them.

**2.1** Open your terminal and create a new project directory on your Desktop:

```powershell
# Windows (PowerShell)
New-Item -Path "$env:USERPROFILE\Desktop\nextwork_terraform" -ItemType Directory

# macOS / Linux
mkdir ~/Desktop/nextwork_terraform
```

**2.2** Navigate into the new folder:

```powershell
# Windows
Set-Location "$env:USERPROFILE\Desktop\nextwork_terraform"

# macOS / Linux
cd ~/Desktop/nextwork_terraform
```

**2.3** Confirm you are in the right place:

```powershell
# Windows
Get-Location

# macOS / Linux
pwd
```
> <img width="1915" height="368" alt="Screenshot 2026-02-23 155233" src="https://github.com/user-attachments/assets/f1558d61-60a0-46ec-a33d-ca98710ceb68?raw=true" />


**2.4** Create the main Terraform configuration file:

```powershell
# Windows
New-Item -Path "main.tf" -ItemType File

# macOS / Linux
touch main.tf
```

**2.5** Open the `nextwork_terraform` folder on your Desktop and confirm `main.tf` is there.

---

## Step 3  Write Your Terraform Configuration

`main.tf` is where you describe the infrastructure you want Terraform to build. You write in a language called HCL (HashiCorp Configuration Language), which is organised into self-contained blocks — one block per resource or setting.

**3.1** Open `main.tf` in VS Code or any text editor.

**3.2** Copy and paste the following code:

```hcl
provider "aws" {
  region = "your-region-code"  # e.g. us-east-1
}

resource "aws_s3_bucket" "my_bucket" {
  bucket = "nextwork-unique-bucket-yourname-12345"  # Must be globally unique
}

resource "aws_s3_bucket_public_access_block" "my_bucket_public_access_block" {
  bucket = aws_s3_bucket.my_bucket.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}
```

Replace `your-region-code` with your AWS region (e.g. `us-east-1`) and make the bucket name globally unique by including your name and a random number. S3 bucket names must be unique across every AWS account in the world — if you pick one that's already taken, the deployment will fail.

**3.3** Here is what each block does:

The **provider block** tells Terraform which cloud platform to connect to and which region to use. Without this, Terraform does not know where to create your resources.

The **aws_s3_bucket block** defines the S3 bucket itself. The name `my_bucket` on the left side is Terraform's internal reference name — you use it to refer to this bucket in other parts of your configuration. The `bucket` value on the right is the actual name that appears in AWS.

The **aws_s3_bucket_public_access_block block** attaches a security configuration to your bucket that blocks all public access. Notice it references `aws_s3_bucket.my_bucket.id` — this is how Terraform links the two resources together. It reads the ID of the bucket you defined above and applies the block to it.

**3.4** Save the file with `Ctrl+S` / `Cmd+S`.

> <img width="1388" height="650" alt="Screenshot 2026-02-23 142733" src="https://github.com/user-attachments/assets/63fb047b-89c3-429c-9250-ac096365f087?raw=true" />


---

## Step 4  Initialize Terraform

Before Terraform can do anything, it needs to download the plugins it requires to communicate with AWS. This is what `terraform init` does.

**4.1** In your terminal (make sure you are still inside `nextwork_terraform`), run:

```bash
terraform init
```

Terraform will download the AWS provider plugin and set up a lock file to record the exact version it installed. This ensures everyone who runs this project uses the same provider version.

**4.2** You should see a success message: `Terraform has been successfully initialized!`


After initialisation, two new items appear in your project folder:

- `.terraform/`  a hidden folder containing the downloaded AWS provider plugin
- `.terraform.lock.hcl`  a lock file recording the exact provider version

---

## Step 5  Set Up AWS Credentials

When you run Terraform, it needs permission to create resources in your AWS account. It gets this permission through the AWS CLI using access keys  a set of credentials that acts like a username and password for programmatic access.

**5.1** Install the AWS CLI.

On **Windows**, open PowerShell and run:

```powershell
Invoke-WebRequest -Uri "https://awscli.amazonaws.com/AWSCLIV2.msi" -OutFile "AWSCLIV2.msi"
Start-Process msiexec.exe -ArgumentList "/i AWSCLIV2.msi" -Wait
```

On **macOS**, download the installer from:

```
https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html
```


**5.2** Verify the installation:

```bash
aws --version
```

You should see the AWS CLI version printed in the terminal.

<img width="1906" height="171" alt="Screenshot 2026-02-23 155548" src="https://github.com/user-attachments/assets/6107280e-9d4a-41a2-8076-fb81d747fc5a?raw=true" />

**5.3** Create an IAM Access Key. Log in to the **AWS Management Console** as your IAM Admin user and navigate to **IAM → Users → your user → Security credentials tab → Access keys → Create access key**.

**5.4** On the use case selection page, choose **Command Line Interface (CLI)**.

**5.5** Tick the acknowledgement checkbox and click **Next**. Add a description:

```
Created to get programmatic access to AWS. Using this key for the NextWork Terraform project.
```

Click **Create access key**.

**5.6** On the confirmation page, click **Download .csv file** immediately. You cannot see the Secret Access Key again after leaving this page.

**5.7** Configure the AWS CLI with your new credentials. In your terminal, run:

```bash
aws configure
```

The terminal will prompt you for four values:

```
AWS Access Key ID:     [paste your Access Key ID]
AWS Secret Access Key: [paste your Secret Access Key]
Default region name:   [your region, e.g. us-east-1]
Default output format: [leave blank and press Enter]
```

> <img width="1910" height="314" alt="Screenshot 2026-02-23 155714" src="https://github.com/user-attachments/assets/c5c5b228-bdcf-4b60-a1e7-3adb71755fa1?raw=true" />

---

## Step 6  Preview the Infrastructure Plan

Before making any changes to AWS, Terraform lets you preview exactly what it is about to create, update, or destroy. This is the safety check step.

**6.1** In your terminal, run:

```bash
terraform plan
```

Terraform reads your `main.tf`, compares it to the current state of your AWS account (nothing yet), and produces a plan showing everything it will create.

**6.2** Read the output. Near the bottom, look for a line like:

```
Plan: 2 to add, 0 to change, 0 to destroy.
```

This confirms Terraform will create two resources — the S3 bucket and its public access block and nothing else.

---

## Step 7  Launch the S3 Bucket

With the plan reviewed and confirmed, you can now apply the configuration and create the real resources in AWS.

**7.1** Run:

```bash
terraform apply
```

Terraform will display the plan one more time and ask for confirmation.

**7.2** Type `yes` and press Enter.

Terraform creates both resources and prints a success message when done.

**7.3** Verify the bucket in the AWS console. Navigate to **S3** in the AWS Management Console and look for your bucket in the list.
> <img width="1891" height="879" alt="Screenshot 2026-02-23 145754" src="https://github.com/user-attachments/assets/8757d9ff-3528-44f1-a7ee-d1bef00d477e?raw=true" />

**7.4** Click into the bucket and open the **Permissions** tab. Confirm that **Block all public access** shows as **On**.

---

## Step 8  Upload a File to S3 with Terraform

The bucket is live. Now extend the Terraform configuration to upload a file into it  without touching the AWS console.

**8.1** Download or choose an image file from your computer. Rename it to `image.png` and move it into your `nextwork_terraform` folder alongside `main.tf`.


**8.2** Open `main.tf` and add the following block at the bottom of the file:

```hcl
resource "aws_s3_object" "image" {
  bucket = aws_s3_bucket.my_bucket.id  # References the bucket created above
  key    = "image.png"                  # The name the file will have inside the bucket
  source = "image.png"                  # The file to upload from your local machine
}
```

The `bucket` value references `aws_s3_bucket.my_bucket.id` — the same bucket you defined earlier. This is how Terraform links resources together without you having to hardcode names. Change one bucket name and all the resources connected to it update automatically.

**8.3** Save `main.tf`.

> <img width="1396" height="610" alt="Screenshot 2026-02-23 150055" src="https://github.com/user-attachments/assets/56178444-aa5f-4183-b1c4-00c7df3381c9?raw=true" />

**8.4** Preview the change:

```bash
terraform plan
```

The plan should now show one additional resource to add  the S3 object.

**8.5** Apply the change:

```bash
terraform apply
```
Type `yes` and press Enter to confirm.

**8.6** Verify the upload in the AWS console. Navigate to your S3 bucket and click the **Objects** tab. You should see `image.png` listed.

**8.7** Select the checkbox next to `image.png`, click **Download**, and open the downloaded file to confirm it matches what you uploaded.

---

## Step 9  Destroy the Infrastructure

When you are done, Terraform can remove everything it created with a single command  no need to hunt through the console to delete each resource manually.

**9.1** In your terminal (inside the `nextwork_terraform` directory), run:

```bash
terraform destroy
```

Terraform shows a plan of everything it will delete and asks for confirmation.

**9.2** Type `yes` and press Enter.


Terraform deletes the S3 object, then the bucket, and prints a success message.


**9.3** Verify in the AWS console that the bucket no longer exists.
> <img width="1859" height="822" alt="Screenshot 2026-02-23 160125" src="https://github.com/user-attachments/assets/b37210a5-f7b3-4712-bd5a-1de0640b6562?raw=true" />


**9.4** Delete your IAM Access Key. In the IAM console, go to **Users → your user → Security credentials → Access keys**, click **Actions → Delete** next to your key, deactivate it, enter the key ID to confirm, and click **Delete**.

**9.5** Delete the `.csv` credentials file from your computer's Downloads folder.

---

## Key Takeaways

**Infrastructure as Code means no more "it works on my machine."** The same `main.tf` file produces identical infrastructure every time it is run, in any account, in any region. There is no clicking, no guessing, no inconsistency.

**Terraform blocks make dependencies explicit.** When the `aws_s3_bucket_public_access_block` references `aws_s3_bucket.my_bucket.id`, Terraform knows it must create the bucket first. You do not manage the order of operations  Terraform figures that out from the relationships in your code.

**Plan before you apply.** `terraform plan` shows you exactly what will change before anything touches your real infrastructure. It is the single most important habit to build when working with IaC  always review the plan, especially in production environments.

**Destroy is as powerful as apply.** `terraform destroy` tears down everything Terraform created, cleanly and completely. This makes it safe to experiment  spin up infrastructure to learn, then destroy it when done, with no leftover resources silently accumulating charges.

---
