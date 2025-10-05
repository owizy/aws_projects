
# 📓 VPC Monitoring with Flow Logs 

What this repo contains: an end-to-end lab to create two VPCs, launch EC2s, configure VPC Flow Logs (send to CloudWatch), generate traffic (peering + ping), and analyze traffic in CloudWatch Logs Insights. 

<img width="862" height="916" alt="vpc_monitoring" src="https://github.com/user-attachments/assets/b9df6901-d7cf-42d0-9b0f-9c556deb3f39?raw=true" />

----
###  Goals

By following this README you will:

- Create NextWork-1 (CIDR 10.1.0.0/16) and NextWork-2 (CIDR 10.2.0.0/16) using VPC and more wizard.

- Launch an EC2 in each VPC (public subnet, public IP enabled).

- Create a CloudWatch Log Group (NextWorkVPCFlowLogsGroup).

- Configure VPC Flow Logs for NextWork-1 (Flow Log name: NextWorkVPCFlowLog) to send all traffic to CloudWatch.

- Create an IAM policy and role that allows Flow Logs to write to CloudWatch, and attach it to Flow Logs.

-  Create a VPC Peering connection between both VPCs, add route table entries, and test connectivity with ping.

- Use CloudWatch Logs Insights to query VPC Flow Logs (sample query provided).

 ---
 
###  Prerequisites

AWS account with permissions for: VPC, EC2, CloudWatch Logs, IAM, Elastic IPs, VPC Peering.

Use the same AWS Region for all steps — CloudWatch log groups are region-specific. Check the region in the AWS Console (top-right).

---
###  Resources & naming convention

Use the following names so the README steps match the lab exactly:

- VPCs: My-1 → CIDR 10.1.0.0/16

- VPCs: My-2 → CIDR 10.2.0.0/16

- Log group: VPCFlowLogsGroup

- Flow Log: MyVPCFlowLog

- IAM policy: VPCFlowLogsPolicy

- IAM role: VPCFlowLogs

- EC2 instances: Instance -  VPC 1 and Instance -  VPC 2

- Security groups: My-1-SG and My-2-SG

---
#  Step-by-step guide

Follow these numbered steps exactly.

 ### Step 1 — Create two VPCs with VPC and more

AWS Console → VPC → Create VPC → VPC and more.

VPC 1 settings:

- Name: My-1

- IPv4 CIDR: 10.1.0.0/16

 - AZs: 1, Public subnets: 1, Private subnets: 0

- NAT Gateways: None, VPC endpoints: None

- Leave DNS options checked.

- Click Create VPC → View VPC → open Resource map to confirm.

Repeat for VPC 2:

- Name: My-2

- IPv4 CIDR: 10.2.0.0/16

Same other settings.

Why different CIDRs? Peered VPCs must have non-overlapping CIDRs.

📸 Screenshot: 
    <img width="1629" height="853" alt="Screenshot 2025-10-04 151352" src="https://github.com/user-attachments/assets/61981d3f-325d-4155-866f-7beed9b445e8?raw=true" />
    <img width="1650" height="851" alt="Screenshot 2025-10-04 151413" src="https://github.com/user-attachments/assets/947784cc-1e02-4e82-b53b-c0b24f9f6484?raw=true" />


### Step 2 — Launch EC2 instances (one per VPC)

We need traffic to monitor, so create two EC2s.
For Instance -  VPC 1

EC2 → Launch instances

- Name: Instance -  VPC 1

- AMI: Amazon Linux 2023, Type: t2.micro

- Key pair: Proceed without a key pair (lab uses EC2 Instance Connect)

- Network settings → Edit:

- VPC: My-1

- Subnet: the public subnet auto-created by wizard

- Auto-assign public IPv4: Enable

- Create or attach security group: Create My-1-SG

- Add inbound rule: All ICMP - IPv4 from 0.0.0.0/0 (lab uses ICMP from anywhere to simplify testing).

- Add inbound rule: SSH (22) from your IP (or Anywhere for quick testing).

- Launch instance.

For Instance -  VPC 2

- Repeat above with VPC: NextWork-2, instance name Instance - NextWork VPC 2, security group NextWork-2-SG.

- Enable Auto-assign public IPv4 in network settings as well.

- Note: allowing All ICMP from 0.0.0.0/0 is for lab convenience only. In production, restrict sources.

📸 Screenshot:  

 <img width="1518" height="864" alt="Screenshot 2025-10-04 154308" src="https://github.com/user-attachments/assets/cdbaac4a-a3b9-4e00-a342-d6afc99e8a6a?raw=true" />
<img width="1485" height="794" alt="Screenshot 2025-10-04 153035" src="https://github.com/user-attachments/assets/500808b0-fc8b-43d8-b444-d29b5d48cef8?raw=true" />

---
### Step 3 — Create CloudWatch Log Group

- Console → CloudWatch → Logs → Log groups → Create log group.

- Name it: VPCFlowLogsGroup.

- Leave retention as default (Never expire) or adjust per requirements.

 - Click Create.

# Step 4 — Create IAM policy & role for Flow Logs

VPC Flow Logs must have permission to create log groups/streams and put log events. Create an IAM policy and a role with a trust policy that allows vpc-flow-logs.amazonaws.com to assume the role.

- Create IAM Policy (JSON)

- Console → IAM → Policies → Create policy → JSON → paste:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}

```
- Click Next → Name: NextWorkVPCFlowLogsPolicy → Create policy.

- Create IAM Role with custom trust policy

- Console → IAM → Roles → Create role → Trusted entity type: Custom trust policy.

- Replace the default trust policy with:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "vpc-flow-logs.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

- Click Next, attach the policy NextWorkVPCFlowLogsPolicy.

- Name the role: VPCFlowLogsRole → Create role.

This role grants only Flow Logs permission to write logs to CloudWatch.


### Step 5 —  Create & accept VPC Peering + update route tables

 For cross-VPC tests, create a peering connection 

- VPC → Peering connections → Create peering connection.

- Name: VPC 1 <> VPC 2

- Requester: My-1

- Accepter: My-2 (My Account → This Region)

- Create → select the peering → Actions → Accept request.

After acceptance, Modify route tables:

- My-1 route table: add route Destination = 10.2.0.0/16 → Target = the peering connection (pcx-...).

- My-2 route table: add route Destination = 10.1.0.0/16 → Target = the peering connection.

Save changes.

Common error: entering your own CIDR as destination. Double-check: destination must be the other VPC’s CIDR.

---


### Step 6 — Create a VPC Flow Log for NextWork-1

- VPC Console → Your VPCs → select NextWork-1.

- Scroll to the Flow Logs tab → click Create flow log.

Configure:

- Name: VPCFlowLog

- Filter: All (captures ACCEPT and REJECT — great for troubleshooting).

- Maximum aggregation interval: 1 minute (more granular).

- Destination: Send to CloudWatch Logs

- Destination log group: NextWorkVPCFlowLogsGroup

- IAM role: refresh the dropdown and select NextWorkVPCFlowLogsRole

- Click Create flow log.

- After creating, the VPC's Flow Logs tab will show the flow log entry. Flow logs start appearing in CloudWatch quickly.

---
### Step 7 — Generate traffic & test connectivity

A — Connect to Instance 1 via EC2 Instance Connect

EC2 → Instances → select Instance - NextWork VPC 1 → Connect → EC2 Instance Connect → ec2-user → Connect.

If EC2 Instance Connect fails, ensure the instance has a public IP and the SG allows SSH (port 22) from your IP.

B — From Instance 1, test connectivity to Instance 2

Get Private IPv4 of Instance - NextWork VPC 2 from EC2 console (e.g., 10.2.x.x).

In Instance 1 terminal:

ping <PRIVATE_IPV4_OF_INSTANCE_2>          # (Ctrl+C to stop)


If ping to private IP fails but ping to public IP succeeds: you probably need to add peering routes or allow ICMP in SG/NACL.

C — Test public internet from Instance 1 (optional)
```
curl example.com
```
📸 Screenshot:  
<img width="1885" height="871" alt="Screenshot 2025-10-05 010344" src="https://github.com/user-attachments/assets/5c11706c-aafa-49dc-ad27-b52ef14614b1?raw=true" />
<img width="1919" height="877" alt="Screenshot 2025-10-01 165244" src="https://github.com/user-attachments/assets/3dd83fe3-d465-44f5-91ed-4d836a033747?raw=true" />


---
### Step 8 — Troubleshoot ICMP/peering issues (if ping private IP fails)

- Route tables: verify both route tables include the peering route to the other VPC CIDR pointing to the peering connection.

- NACLs: check NACLs on the target subnet (VPC-2). If NACL is restrictive, add:

- Inbound rule #100: All ICMP - IPv4 → Source: 10.1.0.0/16

- Outbound rule #100: All ICMP - IPv4 → Destination: 10.1.0.0/16

- Security groups (Instance 2): add inbound rule:

- All ICMP - IPv4 → Source: 10.1.0.0/16 (or NextWork-1 SG for tighter control).

- Re-run the ping from Instance 1.

### Step 9 — Inspect Flow Logs in CloudWatch

- CloudWatch → Log groups → open NextWorkVPCFlowLogsGroup.

- Click the most recent log stream (named eni-... corresponding to ENI of your instance) → inspect entries.

- Each entry shows srcIP, dstIP, srcPort, dstPort, protocol, packets, bytes, action (ACCEPT / REJECT).

- Logs Insights: CloudWatch → Logs Insights → Choose NextWorkVPCFlowLogsGroup.

- Sample built-in query used in the lab:

- Use the saved sample: Top 10 byte transfers by source and destination IP addresses (or run this query):
```
fields @timestamp, srcAddr, dstAddr, bytes
| stats sum(bytes) as totalBytes by srcAddr, dstAddr
| sort totalBytes desc
| limit 10

```
- Click Run query → review the table and chart. This shows heavy flows and helps identify unusual traffic.
📸 Screenshot:

<img width="1698" height="907" alt="Screenshot 2025-10-05 014625" src="https://github.com/user-attachments/assets/2d7f27c1-2332-4cc0-b818-01f340ab6884?raw=true" />

  ----
### Troubleshooting quick checklist

- No flow logs appear: Is the Flow Log associated with the correct VPC? Is the IAM role NextWorkVPCFlowLogsRole selected? Is CloudWatch log group spelled correctly? Region match?

- Ping to private IP fails: Are route table entries to the remote VPC present? Do NACLs or SGs block ICMP?

- EC2 Instance Connect fails: Does instance have public IP? Is SSH allowed in SG? Is EC2 Instance Connect supported by the AMI (Amazon Linux OK)?

- Route add error during peering: Destination cannot be the same as requester VPC CIDR — use the remote CIDR.
