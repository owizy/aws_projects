# ⚙️ Automating Software Delivery: Building a CI/CD Pipeline on AWS

## The Problem

Modern software teams need to ship code quickly and reliably. But when deployment is a manual process  someone SSHing into a server, copying files, restarting services  it becomes a bottleneck. One missed step or wrong command can break production. The process is slow, inconsistent, and doesn't scale.

This project solves that by building a fully automated CI/CD pipeline on AWS. Once set up, every time a developer pushes code to GitHub, the system automatically compiles, tests, packages, and deploys the application to a live web server  with zero manual intervention.

---

## The Solution

A complete CI/CD pipeline connecting GitHub → CodeBuild → CodeDeploy → EC2, orchestrated by AWS CodePipeline. The pipeline is triggered automatically on every code push, uses a private artifact repository for secure dependency management, and supports automatic rollbacks if a deployment fails.

The result: a Java web application that goes from code commit to live URL in minutes, every time, without a human in the loop.

---

## Architecture

> <img width="1474" height="476" alt="cicdpipeline" src="https://github.com/user-attachments/assets/db8d52ca-59ab-4106-8ad8-099c55a8d5d8?raw=true" />



---

## Services & Tools

| Service / Tool | Purpose |
|---|---|
| **Amazon EC2** | Hosts both the development environment and the production web server |
| **VS Code + Remote SSH** | IDE connected directly to EC2 for writing and editing code |
| **Apache Maven** | Builds and packages the Java web application |
| **Amazon Corretto 8 (Java)** | Runtime required by Maven to compile the app |
| **GitHub** | Stores source code and triggers the pipeline via webhooks on every push |
| **AWS CodeArtifact** | Private Maven package repository — caches dependencies from Maven Central securely |
| **AWS CodeBuild** | Compiles the app, runs tests, and produces a deployable WAR file |
| **Amazon S3** | Stores build artifacts between the Build and Deploy stages |
| **AWS CodeDeploy** | Automates deployment of the WAR file to the EC2 production server |
| **Apache Tomcat** | Java application server running on the production EC2 instance |
| **AWS CodePipeline** | Orchestrates and connects all stages of the pipeline end-to-end |
| **AWS CloudFormation** | Provisions the production EC2 instance and its networking as Infrastructure as Code |
| **AWS IAM** | Controls permissions between every service in the pipeline |
| **Amazon CloudWatch** | Logs and monitors build activity for debugging and visibility |

---

## Prerequisites

Before you begin, make sure you have the following:

- An **AWS account** with an IAM Admin user (do not use the root account)
- **VS Code** installed on your local computer
- A **GitHub account**
- Your AWS region set to one that supports all required services. Recommended regions: `us-east-1`, `us-east-2`, `us-west-2`, `eu-west-1`, `eu-west-2`, `eu-central-1`, `ap-southeast-1`, `ap-southeast-2`, `ap-northeast-1`

---

## Step 1  Launch a Development EC2 Instance

The development EC2 instance is where you will write, edit, and test your web app code before it enters the pipeline. Think of it as your cloud-based workstation.

**1.1** Log in to the AWS Management Console as your IAM Admin user and navigate to **EC2**.

**1.2** Switch your region to the one closest to you from the recommended list above.

**1.3** In the EC2 console, click **Instances** in the left navigation panel, then click **Launch instances**.

**1.4** Configure the instance with the following settings:

| Setting | Value |
|---|---|
| Name | `devops-yourname` |
| AMI | Amazon Linux 2023 |
| Instance type | `t2.micro` |
| Key pair | Create new → name it `keypair` → RSA → `.pem` format |
| SSH traffic from | My IP |

**1.5** When you create the key pair, a `.pem` file downloads to your computer automatically. Create a folder called `DevOps` on your Desktop and move the `.pem` file there. You will need this file every time you connect to the instance.

> <img width="1076" height="328" alt="Screenshot 2026-02-23 063220" src="https://github.com/user-attachments/assets/13b62d77-7f82-433b-8145-6951aba48dc5?raw=true" />


**1.6** Click **Launch instance** and wait for the instance status to show **Running**.

---

## Step 2  Connect to EC2 with VS Code

Connecting VS Code directly to your EC2 instance lets you use a proper IDE — file navigation, syntax highlighting, code editing — instead of working in the terminal alone.

**2.1** Open VS Code on your local computer and open a new terminal (`Terminal > New Terminal`).

**2.2** Navigate to your DevOps folder in the terminal:

```bash
# macOS / Linux
cd ~/Desktop/DevOps

# Windows (PowerShell)
cd %USERPROFILE%\Desktop\DevOps
```

**2.3** Restrict permissions on your key pair file. SSH will refuse to use a key file that has overly open permissions.

```bash
# macOS / Linux
chmod 400 keypair.pem

# Windows (PowerShell)
icacls "keypair.pem" /reset
icacls "keypair.pem" /grant:r "YourWindowsUsername:R"
icacls "keypair.pem" /inheritance:r
```


**2.4** Find your EC2 instance's Public IPv4 DNS. In the EC2 console, select your instance and look in the **Details** tab. It will look like `ec2-13-239-113-205.ap-southeast-2.compute.amazonaws.com`.

**2.5** Connect to the instance via SSH to verify the connection works:

```bash
ssh -i  keypair.pem ec2-user@YOUR-PUBLIC-IPV4-DNS
```

Type `yes` when prompted to confirm the host fingerprint. You will see the Amazon Linux welcome message when connected successfully.

> <img width="1369" height="391" alt="Screenshot 2026-02-22 072627" src="https://github.com/user-attachments/assets/e3ac2f57-9889-4480-b9c6-9846752d512c?raw=true" />


**2.6** Install the **Remote - SSH** extension in VS Code. Click the Extensions icon on the left sidebar, search for `Remote - SSH`, and install it.

> <img width="513" height="390" alt="Screenshot 2026-02-23 063900" src="https://github.com/user-attachments/assets/b2fb7710-3fe1-4418-9052-b0f97ac5ec01?raw=true" />


**2.7** Add your EC2 instance as an SSH host. Click the blue double-arrow icon in the bottom-left corner of VS Code → `Connect to Host...` → `Add New SSH Host...` and enter:

```bash
ssh -i ~/Desktop/DevOps/nextwork-keypair.pem ec2-user@YOUR-PUBLIC-IPV4-DNS
```

Select the config file at the top of the window (e.g. `~/.ssh/config`) and save.

> <img width="1288" height="349" alt="Screenshot 2026-02-23 064035" src="https://github.com/user-attachments/assets/5331cd24-4540-43ea-a86d-059959fc84ab?raw=true" />



**2.8** Connect VS Code to the instance. Click the double-arrow icon again → `Connect to Host...` → select your EC2 instance. A new VS Code window opens connected to your instance. The bottom-left corner will show your EC2 DNS address confirming the connection.

> <img width="532" height="548" alt="1" src="https://github.com/user-attachments/assets/6925660f-6dde-441e-a2f9-a084c0993728?raw=true" />


---

## Step 3  Install Tools and Generate the Web App

With VS Code connected to EC2, open a new terminal (`Terminal > New Terminal`). This terminal now runs commands directly on your EC2 instance.

**3.1** Install Apache Maven:

```bash
wget https://archive.apache.org/dist/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz
sudo tar -xzf apache-maven-3.5.2-bin.tar.gz -C /opt
echo "export PATH=/opt/apache-maven-3.5.2/bin:$PATH" >> ~/.bashrc
source ~/.bashrc
```

**3.2** Install Java (Amazon Corretto 8):

```bash
sudo dnf install -y java-1.8.0-amazon-corretto-devel
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-amazon-corretto.x86_64
export PATH=/usr/lib/jvm/java-1.8.0-amazon-corretto.x86_64/jre/bin/:$PATH
```

**3.3** Verify both installations:

```bash
mvn -v       # Should return Maven 3.5.2
java -version  # Should return openjdk version 1.8
```

> <img width="1369" height="100" alt="Screenshot 2026-02-22 075035" src="https://github.com/user-attachments/assets/e029c220-ebdf-4f99-aa92-424d51add84e?raw=true" />


**3.4** Generate the Java web app using Maven:

```bash
mvn archetype:generate \
   -DgroupId=com.nextwork.app \
   -DartifactId=nextwork-web-project \
   -DarchetypeArtifactId=maven-archetype-webapp \
   -DinteractiveMode=false
```

Wait for a `BUILD SUCCESS` message. Maven creates a `nextwork-web-project` folder with the complete web app structure.

> <img width="1367" height="718" alt="Screenshot 2026-02-22 072839" src="https://github.com/user-attachments/assets/c9572c8e-da0a-40be-87a0-a7ede4efe2f6?raw=true" />

**3.5** Open the project folder in VS Code. In the Explorer panel, click **Open Folder** and navigate to `/home/ec2-user/nextwork-web-project`. Click OK.


**3.6** Edit `src/main/webapp/index.jsp` to customise the web app:

```html
<html>
<body>
  <h2>Hello [Your Name]!</h2>
  <p>This is my  web application working!</p>
</body>
</html>
```

Save the file with `Ctrl+S` / `Cmd+S`.

> <img width="1384" height="571" alt="Screenshot 2026-02-22 074433" src="https://github.com/user-attachments/assets/4319b71d-e493-449f-8ea1-015bf0de0efb?raw=true" />


---

## Step 4  Push Code to GitHub

**4.1** Install Git on the EC2 instance:

```bash
sudo dnf update -y
sudo dnf install git -y
git --version  # Verify installation
```


**4.2** Create a new GitHub repository. Log in to GitHub, click `+` → `New repository`, and configure:

| Setting | Value |
|---|---|
| Repository name | `java-web-project` |
| Description | Java web app for AWS CI/CD pipeline |
| Visibility | Public |

Do not initialise the repository with any files. Click **Create repository**.

> <img width="939" height="730" alt="Screenshot 2026-02-22 075239" src="https://github.com/user-attachments/assets/a95bd824-9118-494d-8abb-b102130318e3?raw=true" />


**4.3** Configure your Git identity on the EC2 instance:

```bash
git config --global user.name "Your Name"
git config --global user.email your@email.com
```

**4.4** Initialise a local Git repository inside your project folder:

```bash
cd ~/nextwork-web-project
git init
git remote add origin https://github.com/yourusername/nextwork-web-project.git
```


**4.5** Stage, commit, and push your code:

```bash
git add .
git commit -m "Initial web app commit"
git push -u origin master
```

When prompted for a password, use a **GitHub Personal Access Token** — not your GitHub password. GitHub no longer accepts passwords over HTTPS.

**4.6** Generate a Personal Access Token. In GitHub, go to `Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (classic)`. Set the expiry to 7 days and tick the `repo` scope. Copy the token immediately — you will not be able to see it again.

Paste the token when Git prompts for your password and press Enter.

**4.7** Verify the push was successful by refreshing your GitHub repository in the browser. You should see your web app files listed.


---

## Step 5  Set Up AWS CodeArtifact

CodeArtifact is a private Maven repository. Instead of downloading packages directly from the public internet on every build, Maven pulls them through CodeArtifact — which caches them and gives your team consistent, auditable package versions.

**5.1** Navigate to **CodeArtifact → Repositories → Create repository** and configure:

| Setting | Value |
|---|---|
| Repository name | `devops-cicd` |
| Public upstream repositories | `maven-central-store` |
| Domain | Create new → name it `nextwork` |

Click through and **Create repository**.

**5.2** Create an IAM policy to allow EC2 to access CodeArtifact. Navigate to **IAM → Policies → Create policy**, select the **JSON** tab, and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "codeartifact:GetAuthorizationToken",
        "codeartifact:GetRepositoryEndpoint",
        "codeartifact:ReadFromRepository"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "sts:GetServiceBearerToken",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "sts:AWSServiceName": "codeartifact.amazonaws.com"
        }
      }
    }
  ]
}
```

Name the policy `codeartifact-consumer-policy` and click **Create policy**.

> <img width="1527" height="823" alt="Screenshot 2026-02-22 130522" src="https://github.com/user-attachments/assets/82f6fd5c-65a4-474b-b0bc-98bbb5c56cc6?raw=true" />



**5.3** Create an IAM role for EC2. Navigate to **IAM → Roles → Create role**:

- Trusted entity type: **AWS service**
- Use case: **EC2**
- Attach policy: `codeartifact-consumer-policy`
- Role name: `EC2-instance-cicd`

Click **Create role**.

**5.4** Attach the IAM role to your development EC2 instance. Go to **EC2 → Instances**, select your instance, click `Actions → Security → Modify IAM role`, select `EC2-instance-nextwork-cicd`, and click **Update IAM role**.


**5.5** Export a CodeArtifact authentication token in your VS Code terminal. Get the export command from **CodeArtifact → Repositories → nextwork-devops-cicd → View connection instructions** (select macOS/Linux and mvn). Run the Step 3 command from the instructions:

```bash
export CODEARTIFACT_AUTH_TOKEN=`aws codeartifact get-authorization-token \
  --domain nextwork \
  --domain-owner YOUR-ACCOUNT-ID \
  --region YOUR-REGION \
  --query authorizationToken \
  --output text`
```

 > <img width="1378" height="971" alt="Screenshot 2026-02-22 132234" src="https://github.com/user-attachments/assets/8ed7093e-5595-46f1-90ca-64941986d09e?raw=true" />


**5.6** Create `settings.xml` at the root of your project. In VS Code, create a new file called `settings.xml` and paste the XML from Steps 4, 5, and 6 of the CodeArtifact connection instructions panel. The file connects Maven to your CodeArtifact repository and tells it how to authenticate.


**5.7** Test the connection by compiling your project:

```bash
cd ~/nextwork-web-project
mvn -s settings.xml compile
```

Watch the terminal output  you will see lines like `Downloading from -devops-cicd:` as Maven fetches packages through CodeArtifact. A `BUILD SUCCESS` message confirms everything is working.


**5.8** Verify packages are cached in CodeArtifact. In the AWS console, navigate to your CodeArtifact repository and refresh the **Packages** tab. You will see Maven packages listed there.


---

## Step 6  Create a CodeBuild Project

CodeBuild is the service that compiles and packages your code automatically. It reads instructions from a `buildspec.yml` file in your repository.

**6.1** Create an S3 bucket to store build artifacts. In the S3 console, click **Create bucket**, name it `cicd-yourname`, leave all other settings as default, and click **Create bucket**.

**6.2** Navigate to **CodeBuild → Build projects → Create build project** and configure:

| Section | Setting | Value |
|---|---|---|
| Project configuration | Project name | `devops-cicd` |
| Source | Source provider | GitHub |
| Source | Repository | `java-web-project` |
| Primary source webhook | Rebuild on push | Untick this |
| Environment | Provisioning model | On-demand |
| Environment | Environment image | Managed image |
| Environment | Compute type | EC2 |
| Environment | Operating system | Amazon Linux |
| Environment | Runtime | Standard |
| Environment | Image | `aws/codebuild/amazonlinux-x86_64-standard:corretto8` |
| Environment | Service role | New service role |
| Buildspec | Format | Use a buildspec file |
| Buildspec | Name | `buildspec.yml` |
| Artifacts | Type | Amazon S3 |
| Artifacts | Bucket name | `devops-cicd-yourname` |
| Artifacts | Name | `devops-cicd-artifact` |
| Artifacts | Packaging | Zip |
| Logs | CloudWatch logs | Enabled |
| Logs | Group name | `/aws/codebuild/devops-cicd` |

Click **Create build project**.

**6.3** Attach CodeArtifact permissions to the CodeBuild service role. Navigate to **IAM → Roles**, search for `codebuild-devops-cicd-service-role`, click it, then `Add permissions → Attach policies`. Search for and attach `codeartifact-nextwork-consumer-policy`.


**6.4** Create `buildspec.yml` at the root of your project in VS Code. This file tells CodeBuild exactly what commands to run:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      java: corretto8
  pre_build:
    commands:
      - echo Logging in to AWS CodeArtifact...
      - CODEARTIFACT_AUTH_TOKEN=`aws codeartifact get-authorization-token \
          --domain nextwork \
          --domain-owner YOUR-AWS-ACCOUNT-ID \
          --region YOUR-REGION \
          --query authorizationToken \
          --output text`
      - export CODEARTIFACT_AUTH_TOKEN
  build:
    commands:
      - echo Build started on `date`
      - mvn clean install -s settings.xml
  post_build:
    commands:
      - echo Build completed on `date`
      - mvn package -s settings.xml
artifacts:
  files:
    - target/nextwork-web-project.war
    - appspec.yml
    - scripts/**/*
  discard-paths: no
```

Replace `YOUR-AWS-ACCOUNT-ID` with your actual account ID (found in the top-right corner of the AWS console) and `YOUR-REGION` with your region code (e.g. `us-east-1`).


**6.5** Commit and push `buildspec.yml` to GitHub:

```bash
git add .
git commit -m "Add buildspec.yml"
git push
```


**6.6** Run a test build. In CodeBuild, open your project and click **Start build**. Monitor the **Build logs** tab. A successful build ends with `BUILD SUCCESS`.

**6.7** Verify the build artifact was saved to S3. Navigate to your S3 bucket and refresh — you should see `devops-cicd-artifact.zip` listed.


---

## Step 7  Write Deployment Scripts

CodeDeploy needs shell scripts to know how to install, start, and stop the application on the server. Create a folder called `scripts` at the root of your project and add three files inside it.

**7.1** Create `scripts/install_dependencies.sh`. This script runs before the application files are copied to the server. It installs Tomcat and Apache, then configures Apache to forward incoming traffic to Tomcat.

```bash
#!/bin/bash
sudo yum install tomcat -y
sudo yum -y install httpd
sudo cat << EOF > /etc/httpd/conf.d/tomcat_manager.conf
<VirtualHost *:80>
  ServerAdmin root@localhost
  ServerName app.nextwork.com
  DefaultType text/html
  ProxyRequests off
  ProxyPreserveHost On
  ProxyPass / http://localhost:8080/nextwork-web-project/
  ProxyPassReverse / http://localhost:8080/nextwork-web-project/
</VirtualHost>
EOF
```


**7.2** Create `scripts/start_server.sh`. This script runs after the application files are in place. It starts both Tomcat and Apache, and enables them to restart automatically if the server reboots.

```bash
#!/bin/bash
sudo systemctl start tomcat.service
sudo systemctl enable tomcat.service
sudo systemctl start httpd.service
sudo systemctl enable httpd.service
```


**7.3** Create `scripts/stop_server.sh`. This script runs before a new deployment begins. It checks whether each service is running before stopping it — preventing errors if services are already down.

```bash
#!/bin/bash
isExistApp="$(pgrep httpd)"
if [[ -n $isExistApp ]]; then
  sudo systemctl stop httpd.service
fi
isExistApp="$(pgrep tomcat)"
if [[ -n $isExistApp ]]; then
  sudo systemctl stop tomcat.service
fi
```


---

## Step 8  Create appspec.yml

`appspec.yml` is the instruction file that CodeDeploy reads to understand what files to copy where and which scripts to run at each stage of the deployment. Create this file at the **root** of your project — not inside the `scripts` folder.

```yaml
version: 0.0
os: linux
files:
  - source: /target/nextwork-web-project.war
    destination: /usr/share/tomcat/webapps/
hooks:
  BeforeInstall:
    - location: scripts/install_dependencies.sh
      timeout: 300
      runas: root
  ApplicationStart:
    - location: scripts/start_server.sh
      timeout: 300
      runas: root
  ApplicationStop:
    - location: scripts/stop_server.sh
      timeout: 300
      runas: root
```

The `files` section tells CodeDeploy to copy the WAR file into Tomcat's webapps folder. The `hooks` section defines which script runs at each lifecycle event — stopping the old server, installing dependencies, then starting the new server.


Commit and push everything to GitHub:

```bash
git add .
git commit -m "Add CodeDeploy scripts and appspec.yml"
git push
```


---

## Step 9  Provision the Production Environment with CloudFormation

Instead of manually creating the production EC2 instance and its networking, use CloudFormation to provision everything as Infrastructure as Code. This guarantees the environment is identical every time.

**9.1** Download the CloudFormation template (`nextworkwebapp.yaml`) from the project repository.

**9.2** Find your public IP address by visiting [https://checkip.amazonaws.com](https://checkip.amazonaws.com). Copy the IP address.

**9.3** Navigate to **CloudFormation → Create stack → With new resources (standard)** and configure:

| Setting | Value |
|---|---|
| Template | Upload `nextworkwebapp.yaml` |
| Stack name | `NextWorkCodeDeployEC2Stack` |
| MyIP parameter | Your IP address + `/32` (e.g. `203.0.113.5/32`) |
| Stack failure options | Roll back all stack resources |
| On failure | Delete all newly created resources |
| Capabilities | Acknowledge IAM resource creation |

Click **Submit**.


**9.4** Monitor stack creation in the **Events** tab. Resources are created one by one — VPC, subnet, internet gateway, route table, security group, and finally the EC2 instance.


**9.5** Wait for the stack status to reach `CREATE_COMPLETE`.


---

## Step 10  Set Up AWS CodeDeploy

**10.1** Create an IAM role for CodeDeploy. Navigate to **IAM → Roles → Create role**:

- Trusted entity type: **AWS service**
- Use case: **CodeDeploy**
- The `AWSCodeDeployRole` policy is pre-selected — keep it
- Role name: `NextWorkCodeDeployRole`

Click **Create role**.


**10.2** Create a CodeDeploy application. Navigate to **CodeDeploy → Applications → Create application**:

| Setting | Value |
|---|---|
| Application name | `devops-cicd` |
| Compute platform | EC2/On-premises |

Click **Create application**.

**10.3** Create a deployment group. Inside your CodeDeploy application, click **Create deployment group**:

| Setting | Value |
|---|---|
| Deployment group name | `nextwork-devops-cicd-deploymentgroup` |
| Service role | `NextWorkCodeDeployRole` |
| Deployment type | In-place |
| Environment configuration | Amazon EC2 instances |
| Tag key | `role` |
| Tag value | `webserver` |
| Agent configuration | Now and schedule updates → 14 days |
| Deployment configuration | `CodeDeployDefault.AllAtOnce` |
| Load balancing | Disabled |

After entering the tag key and value, confirm that **1 unique matched instance** is found — this is the EC2 instance created by CloudFormation.


Click **Create deployment group**.


---

## Step 11  Connect CodeBuild to GitHub

To allow CodeBuild to pull code directly from GitHub, you need to set up an AWS CodeConnections connection.

**11.1** In the CodeBuild console, open your `devops-cicd` project, click **Edit → Source**, and under Credential click **Manage account credentials**.

**11.2** On the Manage default source credential page, ensure **GitHub App** is selected and click **Create a new GitHub connection**. Name the connection `devops-cicd` and click **Connect to GitHub**.


**11.3** Authorise the AWS Connector for GitHub when redirected to GitHub. Select your GitHub account and click **Connect**.


**11.4** After being redirected back to AWS, select your GitHub username under **GitHub Apps** and click **Connect**.

**11.5** Click **Save**. A green banner confirms your account is connected successfully.


---

## Step 12  Build the CI/CD Pipeline with CodePipeline

CodePipeline is the glue that connects everything. It watches your GitHub repository, triggers CodeBuild when it detects a change, and passes the build artifact to CodeDeploy for deployment  all automatically.

**12.1** Navigate to **CodePipeline → Create pipeline → Build custom pipeline**.


**12.2** Configure pipeline settings:

| Setting | Value |
|---|---|
| Pipeline name | `devops-cicd` |
| Execution mode | Superseded |
| Service role | New service role |

Click **Next**.

**12.3** Configure the Source stage:

| Setting | Value |
|---|---|
| Source provider | GitHub (via GitHub App) |
| Connection | Your existing GitHub connection |
| Repository name | `java-web-roject` |
| Default branch | `master` |
| Output artifact format | CodePipeline default |
| Detect changes (webhooks) | Enabled |

Enabling webhooks means CodePipeline automatically triggers whenever you push to `master`.


**12.4** Configure the Build stage:

| Setting | Value |
|---|---|
| Build provider | AWS CodeBuild |
| Project name | `devops-cicd` |
| Input artifact | SourceArtifact |


**12.5** Skip the Test stage for this project.

**12.6** Configure the Deploy stage:

| Setting | Value |
|---|---|
| Deploy provider | AWS CodeDeploy |
| Application name | `devops-cicd` |
| Deployment group | `devops-cicd-deploymentgroup` |
| Input artifact | BuildArtifact |
| Automatic rollback on failure | Enabled |


**12.7** Review all settings and click **Create pipeline**. CodePipeline immediately starts its first execution. Watch the three stages turn green one by one — Source → Build → Deploy.


---

## Step 13  Verify the Live Web App

**13.1** Find the production server's public address. In CodePipeline, click on the Deploy stage → click the CodeDeploy link → scroll to **Deployment lifecycle events** → click the **Instance ID**. On the EC2 instance page, copy the **Public IPv4 DNS**.


**13.2** Open the address in a browser using `http://` (not `https://`):

```
http://ec2-xx-xxx-xxx-xxx.compute.amazonaws.com
```

You should see your web app displaying `Hello [Your Name]!` — served live from the EC2 production server.

> <img width="487" height="131" alt="image" src="https://github.com/user-attachments/assets/c2b49fcf-21e7-4a30-afe1-4f8f383a2d99?raw=true" />


---

## Step 14  Test the Full Pipeline

With everything running, test that a code change flows all the way through automatically.

**14.1** Edit `src/main/webapp/index.jsp` in VS Code and add a new line:

```html
<p>If you see this line, your latest changes were automatically deployed by CodePipeline!</p>
```

> <img width="510" height="285" alt="image" src="https://github.com/user-attachments/assets/81e5ec46-c091-4cfd-857e-a2ab8f8677d1?raw=true" />


**14.2** Push the change to GitHub:

```bash
git add .
git commit -m "Test automated pipeline deployment"
git push origin master
```


**14.3** Watch CodePipeline respond. Within seconds of the push, a new pipeline execution starts automatically.


**14.4** Click into the Source stage to verify it picked up the correct commit.


**14.5** Wait for all three stages to complete, then refresh your browser at the production URL. The new line appears — deployed automatically, no manual steps involved.


---

## Rollback a Deployment

If a deployment causes problems, CodePipeline can roll back the Deploy stage to the previous working version without touching the Source or Build stages.

**To trigger a manual rollback:** In CodePipeline, locate the Deploy stage, click the three-dot menu (`...`) in the top-right corner of the stage box, and select **Start rollback**. Choose the previous successful execution ID from the dropdown and click **Start rollback**.


The Deploy stage re-runs with the previous build artifact. Once complete, the stage shows **Succeeded** with the previous deployment's commit message  confirming the rollback worked.


Refresh your browser to confirm the app has reverted to the previous version.


---

## Cleanup

To avoid ongoing AWS charges, delete these resources when you are done:

1. **CodePipeline**  delete the `devops-cicd` pipeline
2. **CodeDeploy**  delete the `devops-cicd` application
3. **CodeBuild** delete the `devops-cicd` project and the CodeConnections connection
4. **CodeArtifact**  delete the `devops-cicd` repository, then delete the `nextwork` domain
5. **CloudFormation**  delete the `CodeDeployEC2Stack` stack (this also deletes the production EC2 instance and VPC)
6. **S3**  empty and delete the `devops-cicd-yourname` bucket
7. **EC2**  terminate the development instance (`devops-yourname`)
8. **IAM**   delete the roles `EC2-instance-cicd`, `CodeDeployRole`, and the CodeBuild service role; delete the `codeartifact-nextwork-consumer-policy`

---

