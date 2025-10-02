# 🌉 VPC Peering 

This  is a step-by-step version of the previous guide. It walks you exactly through creating two VPCs (using VPC and more), creating and accepting a VPC peering connection, updating route tables, launching EC2 instances, testing connectivity, troubleshooting, and cleaning up. Use this as a lab script to follow in the AWS Console.
 
  <img width="669" height="731" alt="vpc_peering" src="https://github.com/user-attachments/assets/c0d8a9f0-0df3-4df0-a9e1-bff507a87e2b?raw=true" />


## Project summary :

Create My-1 (10.1.0.0/16) and My-2 (10.2.0.0/16), peer them, launch an EC2 in each, assign an Elastic IP to Instance 1, SSH to Instance 1, then ping Instance 2 private IP and fix any SG/NACL issues.


---


### Step 1 — Create VPC 1 (My-1) with VPC and more

Console → VPC → Create VPC → VPC and more.

Configure:

Name tag: My-1

IPv4 CIDR: 10.1.0.0/16

IPv6: No

Tenancy: Default

Number of AZs: 1

Public subnets: 1

Private subnets: 0

NAT Gateways: None

VPC Endpoints: None

DNS options: Leave checked

Click Create VPC → then View VPC → open Resource map to confirm resources exist.

📸 Screenshot:

<img width="1640" height="851" alt="Screenshot 2025-10-02 110259" src="https://github.com/user-attachments/assets/5456f96d-79cf-4bf0-80a0-d8e1a84b875b?raw=true" />


----


### Step 2 — Create VPC 2 (MY-2) with VPC and more

Console → VPC → Create VPC → VPC and more.

Configure:

Name tag: My-2

IPv4 CIDR: 10.2.0.0/16 (must be unique)

Other options same as VPC 1 (1 public subnet, no NAT, etc.).

Click Create VPC → View VPC.

📸 Screenshot:

<img width="1628" height="834" alt="Screenshot 2025-10-02 110739" src="https://github.com/user-attachments/assets/8ba86af8-37fd-494d-81bb-f5d49eb25fa2?raw=true" />


----


### Step 3 — Create the VPC Peering Connection

Console → VPC → Peering connections → Create peering connection.

Set fields:

Peering connection name: VPC 1 <> VPC 2

Requester VPC: My-1

Select another VPC to peer with: My Account, Region: This Region

Accepter VPC: My-2

Click Create peering connection.

Select the created peering connection → Actions → Accept request → Confirm acceptance.

Optionally click Modify my route tables now to jump to next step.

📸 Screenshot:

<img width="1655" height="860" alt="Screenshot 2025-10-02 114810" src="https://github.com/user-attachments/assets/22be9c14-1be5-40cd-aadb-a1654b30a3e3?raw=true" />


---


### Step 4 — Update Route Tables (IMPORTANT)

Purpose: Tell traffic destined for the other VPC to go through the peering connection.

In My-1:

Console → VPC → Route Tables → select My-1-rtb-public.

Click Routes → Edit routes → Add route:

Destination: 10.2.0.0/16

Target: Peering Connection → choose VPC 1 <> VPC 2

Save changes.

In NextWork-2:

Select NextWork-2-rtb-public.

Edit routes → Add route:

Destination: 10.1.0.0/16

Target: Peering Connection → VPC 1 <> VPC 2

Save changes.

Common mistake: Don’t enter your own VPC CIDR (e.g. 10.1.0.0/16 in VPC1) — the destination must be the other VPC's CIDR.

📸 Screenshot:

<img width="1544" height="430" alt="Screenshot 2025-10-02 120642" src="https://github.com/user-attachments/assets/97a0ae49-3617-4b9a-b604-69a3f5995eae?raw=true" />


---


### Step 5 — Launch EC2 instance in VPC 1

Console → EC2 → Launch instances.

Configure instance:

Name: Instance - My-VPC 1

AMI: Amazon Linux 2023

Instance type: t2.micro

Key pair: Proceed without a key pair (we will use EC2 Instance Connect)

Network settings: Click Edit:

VPC: My-1

Subnet: My-1 public subnet

Auto-assign public IP: Disable (we will assign Elastic IP)

Security group: choose default SG for My-1

Launch instance.

----

### Step 6 — Launch EC2 instance in VPC 2

Repeat Step 5 but:

Name: Instance - MY-VPC 2

VPC: My-2

Subnet: My-2 public subnet

Auto-assign public IP: Disable

Security group: default SG for NextWork-2

Launch instance.

📸 Screenshot:

<img width="1546" height="887" alt="Screenshot 2025-10-02 122526" src="https://github.com/user-attachments/assets/7c822723-6e08-464c-b26c-51674c847b9e?raw=true" />

----

### Step 7 — Allocate and Associate Elastic IP to Instance 1

Console → EC2 → Network & Security → Elastic IPs → Allocate Elastic IP address → Allocate.

Select the new Elastic IP → Actions → Associate Elastic IP address.

Associate it with Instance - NextWork VPC 1 (choose the instance).

Confirm the instance now shows a Public IPv4 address.

📸 Screenshot:

<img width="1867" height="814" alt="Screenshot 2025-10-02 124924" src="https://github.com/user-attachments/assets/a8a8ee48-4fb0-4c1c-8746-5fdcfc4df8aa?raw=true" />

----

### Step 8 — Connect to Instance 1 with EC2 Instance Connect

EC2 → Instances → select Instance - NextWork VPC 1 → Connect → EC2 Instance Connect.

Username: ec2-user → Connect.

If you see “No public IPv4 address assigned” → verify Elastic IP is associated.

If connection fails (security group):

Console → EC2 → Security Groups → filter by VPC ID to find My-1 default SG.

Edit Inbound rules → Add rule:

Type: SSH (22)

Source: Anywhere-IPv4 (0.0.0.0/0) — demo only; replace with your IP in production.

Save and retry EC2 Instance Connect.

📸 Screenshot:

<img width="1872" height="769" alt="Screenshot 2025-10-02 124342" src="https://github.com/user-attachments/assets/1540a3c7-235f-48fd-8262-7c9dba6a061e?raw=true" />


----

### Step 9 — Test VPC Peering (ping from Instance 1 → Instance 2)

Get the Private IPv4 of Instance - NextWork VPC 2 from the EC2 console (e.g. 10.2.x.x).

In the Instance 1 terminal run:
```
ping <PRIVATE_IPV4_OF_INSTANCE_2>
```
Screenshot:

<img width="1845" height="388" alt="n" src="https://github.com/user-attachments/assets/86897562-f562-423c-badb-e2ce3538c3ea?raw=true" />


Expected:

If peering, routing, NACLs, and SGs allow ICMP → multiple reply lines (success).

If you see only one line or no replies → ICMP is blocked by NACL or Security Group.

-----

### Step 10 — Troubleshoot ping failures (ICMP blocked)

If ping fails, check the following in this order:

A — Route tables

Confirm both route tables have the peering route entries (Step 4). If not, add them.

B — Network ACLs for VPC 2 subnet

VPC → Network ACLs → select NACL associated with NextWork-2 public subnet.

Ensure inbound allows ICMP from 10.1.0.0/16 and outbound allows ICMP to 10.1.0.0/16. Example rules:

Inbound: Rule #100 → Type: All ICMP - IPv4 → Source: 10.1.0.0/16

Outbound: Rule #100 → Type: All ICMP - IPv4 → Destination: 10.1.0.0/16

Save.

C — Security Group for Instance 2

EC2 → Security Groups → find default SG for NextWork-2.

Edit Inbound rules → Add rule:

Type: All ICMP - IPv4

Source: 10.1.0.0/16 (or use Instance 1's SG for tighter control)

Save.

After changes, re-run:

```
ping <PRIVATE_IPV4_OF_INSTANCE_2>

```
You should now see replies.

📸 Screenshot:
   
   <img width="1902" height="880" alt="Screenshot 2025-10-02 142147" src="https://github.com/user-attachments/assets/5086a26e-11fa-4583-b78f-e8babe8306b2?raw=true" />


 ----


### Step 11 — Validate internet access from Instance 1

On Instance 1 terminal:

```
curl example.com

```

📸 Screenshot:

<img width="1919" height="877" alt="Screenshot 2025-10-01 165244" src="https://github.com/user-attachments/assets/f88cad39-2364-407c-a705-00f4cb777e93?raw=true" />

----

