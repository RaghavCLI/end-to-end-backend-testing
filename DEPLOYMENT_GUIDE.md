# AWS EC2 Deployment Guide - OCR Application

## Overview
- **EC2 Instance 1**: Backend (PaddleOCR API with Docker)
- **EC2 Instance 2**: Frontend (React Application)

---

## PHASE 1: Launch EC2 Instances

### EC2 Instance 1 - Backend (OCR API)

**Specifications:**
- **AMI**: Ubuntu 22.04 LTS
- **Instance Type**: t3.medium (minimum - OCR needs CPU/RAM)
- **Storage**: 20 GB gp3
- **Security Group**: 
  - SSH (22) - Your IP only
  - HTTP (5000) - 0.0.0.0/0 or Frontend security group

**Security Group Rules:**
```
Type        Protocol  Port    Source
SSH         TCP       22      Your-IP/32
Custom TCP  TCP       5000    0.0.0.0/0
```

### EC2 Instance 2 - Frontend (React)

**Specifications:**
- **AMI**: Ubuntu 22.04 LTS
- **Instance Type**: t2.micro or t2.small
- **Storage**: 10 GB gp3
- **Security Group**:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0

**Security Group Rules:**
```
Type        Protocol  Port    Source
SSH         TCP       22      Your-IP/32
HTTP        TCP       80      0.0.0.0/0
HTTPS       TCP       443     0.0.0.0/0
```

---

## PHASE 2: Backend Deployment (EC2 Instance 1)

### Step 1: Connect to Backend EC2
```bash
ssh -i your-key.pem ubuntu@<BACKEND-EC2-PUBLIC-IP>
```

### Step 2: Run Backend Setup Script
Copy and run the `backend-setup.sh` script (provided separately)

**What it does:**
- Updates system packages
- Installs Docker and Docker Compose
- Creates application directory
- Sets up Docker to run without sudo

### Step 3: Upload Backend Files
From your local machine:
```bash
scp -i your-key.pem -r backend/ ubuntu@<BACKEND-EC2-PUBLIC-IP>:~/app/
```

Or use Git:
```bash
# On EC2
cd ~/app
git clone <your-repo-url>
cd <repo-name>/backend
```

### Step 4: Build and Run Docker
```bash
cd ~/app/backend
docker-compose up -d --build
```

### Step 5: Verify Backend
```bash
# Check container status
docker ps

# Check logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:5000/api/health
```

---

## PHASE 3: Frontend Deployment (EC2 Instance 2)

### Step 1: Connect to Frontend EC2
```bash
ssh -i your-key.pem ubuntu@<FRONTEND-EC2-PUBLIC-IP>
```

### Step 2: Run Frontend Setup Script
Copy and run the `frontend-setup.sh` script (provided separately)

**What it does:**
- Updates system packages
- Installs Node.js 20.x
- Installs Nginx
- Creates application directory

### Step 3: Upload Frontend Files
From your local machine:
```bash
scp -i your-key.pem -r frontend/ ubuntu@<FRONTEND-EC2-PUBLIC-IP>:~/app/
```

Or use Git:
```bash
# On EC2
cd ~/app
git clone <your-repo-url>
cd <repo-name>/frontend
```

### Step 4: Configure Environment
```bash
cd ~/app/frontend
nano .env
```

Update with backend URL:
```
VITE_API_BASE_URL=http://<BACKEND-EC2-PUBLIC-IP>:5000
```

### Step 5: Build React App
```bash
npm install
npm run build
```

### Step 6: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/ocr-app
```

Copy the nginx config (provided separately)

```bash
sudo ln -s /etc/nginx/sites-available/ocr-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Verify Frontend
Visit in browser:
```
http://<FRONTEND-EC2-PUBLIC-IP>
```

---

## PHASE 4: Testing

### Test Backend Directly
```bash
curl http://<BACKEND-EC2-PUBLIC-IP>:5000/api/health
```

### Test Frontend to Backend Communication
1. Open browser: `http://<FRONTEND-EC2-PUBLIC-IP>`
2. Upload an image
3. Click "Process Image"
4. Verify results display

---

## PHASE 5: Production Hardening

### Backend EC2
1. Restrict security group to only allow Frontend EC2 IP on port 5000
2. Set up CloudWatch logs
3. Enable auto-restart for Docker container
4. Set up SSL/TLS if exposing directly

### Frontend EC2
1. Set up domain name (optional)
2. Configure SSL with Let's Encrypt
3. Enable gzip compression in Nginx
4. Set up CloudWatch monitoring

---

## Troubleshooting

### Backend Issues
```bash
# Check Docker logs
docker-compose logs -f

# Check container status
docker ps -a

# Restart container
docker-compose restart

# Rebuild container
docker-compose down
docker-compose up -d --build
```

### Frontend Issues
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

### Connection Issues
```bash
# From Frontend EC2, test backend connection
curl http://<BACKEND-EC2-PRIVATE-IP>:5000/api/health

# Check security groups allow traffic
# Verify CORS settings in backend
```

---

## Cost Optimization

- **Development**: Use t2.micro for both, stop when not in use
- **Production**: Use t3.medium for backend, t2.small for frontend
- **Savings**: Use Reserved Instances or Savings Plans
- **Monitoring**: Set up billing alerts

---

## Next Steps

After deployment:
1. Set up automated backups (AMI snapshots)
2. Configure auto-scaling (optional)
3. Set up CI/CD pipeline
4. Enable HTTPS with SSL certificates
5. Set up monitoring and alerting
