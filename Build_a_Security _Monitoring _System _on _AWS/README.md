# 🔐 Building a Security Monitoring System on AWS

> **Track who's touching your secrets  and get notified the moment it happens.**

---

## The Problem

Sensitive credentials  API keys, database passwords, encryption tokens sit quietly inside your cloud infrastructure. Most teams assume they're safe just because they're stored in a managed service. But here's the uncomfortable truth: **anyone with the right (or wrong) permissions can access those secrets, and you'd never know.**

No alert. No audit trail you can act on in real time. No email saying *"hey, someone just read your production database password at 2am."*

That's a real security gap. And it's exactly the kind of blind spot that shows up in breach post-mortems.

---

## The Solution

This project walks you through building a **real-time security monitoring and alerting system** using native AWS services — no third-party tools, no complicated setup. By the end, your AWS environment will:

- **Detect** every time a secret is accessed in AWS Secrets Manager
- **Log** that access through CloudTrail and CloudWatch
- **Alert you instantly** via email using SNS

Think of it as building your own early-warning system for credential access.

---

## Architecture Overview


> **Screenshot: Architecture Diagram**
<img width="1478" height="554" alt="security monitoring system" src="https://github.com/user-attachments/assets/736f7d28-b0f6-46fe-b88f-34c60e636141?raw=true" />


---

## Services Used

| Service | Role in This Project |
|---|---|
| **AWS Secrets Manager** | Stores the secret we want to protect and monitor |
| **AWS CloudTrail** | Records every API call made against the secret |
| **Amazon S3** | Stores raw CloudTrail logs durably |
| **Amazon CloudWatch Logs** | Receives a live stream of CloudTrail logs |
| **CloudWatch Metric Filter** | Scans logs for `GetSecretValue` events |
| **CloudWatch Alarm** | Fires when the metric crosses a threshold |
| **Amazon SNS** | Delivers email notifications when the alarm fires |
| **AWS CLI / CloudShell** | Used to access secrets and test the pipeline |

---

## What I Built — Step by Step

### Stage 1: Store the Secret & Set Up Logging

---

#### Step 1  Create a Secret in AWS Secrets Manager

Before you can monitor a secret, you need one. I created a secret called `TopSecretInfo` using the **Other type of secret** option in Secrets Manager. The key-value format makes it easy for applications to programmatically retrieve exactly the credential they need.

Real-world use cases look like: `{"db_password": "hunter2"}` or `{"api_key": "sk-..."}`. For this project, I used a placeholder value to simulate a sensitive credential.

> **Screenshot: Secret stored in AWS Secrets Manager**
<img width="1919" height="1057" alt="Screenshot 2026-02-18 082750" src="https://github.com/user-attachments/assets/671d9ecd-48d9-4897-90dd-43ff50c3af46?raw=true" />


---

#### Step 2  Configure a CloudTrail Trail

CloudTrail is the activity recorder for your AWS account. Without it, you're flying blind — there's no record of who did what or when.

I created a trail called `secrets-manager-trail` configured to:

- Log **Management events** (which includes secret access — a deliberate AWS design choice that makes monitoring easier without incurring data event costs)
- Exclude noisy KMS and RDS events that would otherwise bury the signals we care about
- Store logs in a dedicated S3 bucket

One thing worth noting: retrieving a secret value (`GetSecretValue`) is classified as a **Write** operation in CloudTrail, even though you're just reading. AWS does this intentionally — it means secret access is captured even when teams configure CloudTrail to only log write events, which is a common cost-saving measure. Smart.

> **Screenshot: CloudTrail trail created**
<img width="1919" height="1057" alt="Screenshot 2026-02-18 082750" src="https://github.com/user-attachments/assets/c5cb84f8-934d-4837-9e25-4f0ea4269f63?raw=true" />

---

#### Step 3  Generate and Verify Secret Access Events

With CloudTrail running, I accessed the secret two ways:

1. Through the **AWS Console** — clicking "Retrieve secret value"
2. Through the **AWS CLI** in CloudShell:

```bash
aws secretsmanager get-secret-value --secret-id "TopSecretInfo" --region your-region-code
```

Then I filtered CloudTrail Event History by `secretsmanager.amazonaws.com` and confirmed the `GetSecretValue` event appeared — proof that CloudTrail was capturing the access.

> **Screenshot: CloudShell terminal showing secret retrieval**
<img width="1875" height="867" alt="Screenshot 2026-02-18 095118" src="https://github.com/user-attachments/assets/90cbb597-71f6-42c2-af97-b59fedb46923?raw=true" />


> **Screenshot: GetSecretValue event in CloudTrail Event History**
<img width="1888" height="999" alt="Screenshot 2026-02-18 095856" src="https://github.com/user-attachments/assets/66cb969c-650c-41de-8488-ff59020e3b2c?raw=true" />


---

### Stage 2: Build the Monitoring & Alert System

---

#### Step 4  Stream Logs to CloudWatch and Create a Metric Filter

CloudTrail Event History is great for investigation after the fact. But it can't alert you in real time. That's where CloudWatch comes in.

I enabled CloudWatch Logs on the trail, which creates a live stream of events into a new log group: `nextwork-secretsmanager-loggroup`. This is the foundation for everything that comes next.

From there, I created a **Metric Filter** that watches the log stream for any occurrence of `"GetSecretValue"`. Every match increments a custom metric called `Secret is accessed` inside a namespace called `SecurityMetrics`.

The filter uses:
- **Metric value: 1** — each match adds one to the counter
- **Default value: 0** — periods with no access show as zero, not blank

> **Screenshot: CloudWatch Logs showing live log stream**
<img width="1900" height="968" alt="Screenshot 2026-02-18 101013" src="https://github.com/user-attachments/assets/1574386d-1c0f-4ba3-ae76-78b1e70e0c64?raw=true" />


> **Screenshot: Metric Filter created**
<img width="1919" height="1039" alt="Screenshot 2026-02-18 101909" src="https://github.com/user-attachments/assets/37844faf-6422-439a-933d-4ab19742f2c5?raw=true" />


---

#### Step 5  Create a CloudWatch Alarm and Wire Up SNS

With the metric in place, I created a CloudWatch Alarm that fires when `Secret is accessed >= 1` over a 1-minute window using **Sum** as the statistic.

> ⚠️ Important gotcha: Using **Average** instead of **Sum** here is a common mistake. Average calculates an access rate per second over the period, which often stays below 1.0 even when accesses happen. Sum counts actual occurrences — which is what you actually want for a security alert.

The alarm is connected to an SNS topic called `SecurityAlarms` that sends an email notification to a confirmed subscriber. AWS requires explicit email confirmation before it starts delivering alerts (a good thing — opt-in by design).

> **Screenshot: SNS Subscription confirmed**
<img width="1351" height="625" alt="Screenshot 2026-02-18 103355" src="https://github.com/user-attachments/assets/e52f6455-d97f-487c-8d15-8f66e6731a75?raw=true" />


---

#### Step 6  Test and Troubleshoot the Full Pipeline

Testing revealed the alarm wasn't firing at first — which turned out to be the `Average` vs `Sum` statistic issue described above. I caught this by manually triggering the alarm via CLI to isolate where the pipeline was breaking:

```bash
aws cloudwatch set-alarm-state \
    --alarm-name "Secret is accessed" \
    --state-value ALARM \
    --state-reason "Manually triggered for testing"
```

After fixing the statistic and accessing the secret again, the alarm transitioned to **IN ALARM** state and the email arrived within a few minutes.

> **Screenshot: CloudWatch Alarm in ALARM state**
<img width="1914" height="1013" alt="Screenshot 2026-02-18 115549" src="https://github.com/user-attachments/assets/c46e48a0-b743-441c-ba75-4cace77a24bf?raw=true" />


> **Screenshot: Email notification received from AWS SNS**
<img width="1353" height="878" alt="Screenshot 2026-02-18 115620" src="https://github.com/user-attachments/assets/b4880988-010d-457c-ad34-7c8208360b81?raw=true" />

---

## Key Takeaways

**Why not just use CloudTrail alone?**
CloudTrail records events and stores them in S3, but it can't alert you. You'd have to manually check logs. CloudWatch adds the real-time analysis and alarm layer on top — that's what turns passive logging into active monitoring.

**Why does this architecture have so many pieces?**
Each service does one thing well. CloudTrail captures. S3 stores. CloudWatch analyzes. SNS notifies. The modularity means you can swap out or extend individual components — for example, replacing email alerts with a Lambda function that auto-revokes access when an anomaly is detected.

**What would this look like in production?**
You'd likely lower the alarm period further, layer in anomaly detection for metrics that fluctuate normally, restrict IAM access to Secrets Manager using resource policies, and enable secret rotation to limit blast radius if credentials are compromised.

---

## Cleanup

To avoid ongoing charges, delete the following resources after completing the project:

- [ ] CloudTrail trail (`secrets-manager-trail`)
- [ ] S3 bucket (CloudTrail logs)
- [ ] CloudWatch alarm (`Secret is accessed`)
- [ ] CloudWatch log group (`nextwork-secretsmanager-loggroup`)
- [ ] Secrets Manager secret (`TopSecretInfo`)
- [ ] SNS topic (`SecurityAlarms`) and subscription

---

