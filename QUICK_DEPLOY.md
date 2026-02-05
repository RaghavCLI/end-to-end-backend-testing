# Quick EC2 Deployment Commands

## BACKEND EC2 (Instance 1)

### 1. Connect
```bash
ssh -i your-key.pem ubuntu@<BACKEND-EC2-IP>
```

### 2. Setup
```bash
# Upload and run setup script
chmod +x backend-setup.sh
./backend-setup.sh

# Log out and back in
exit
ssh -i your-key.pem ubuntu@<BACKEND-EC2-IP>
```

### 3. Deploy Backend
```bash
# Upload files (from local machine)
scp -i your-key.pem -r C:\Users\r7nrc\OneDrive\Desktop\full_backend_testing\backend ubuntu@<BACKEND-EC2-IP>:~/app/

# On EC2
cd ~/app/backend
docker-compose up -d --build

# Verify
docker ps
curl http://localhost:5000/api/health
```

---

## FRONTEND EC2 (Instance 2)

### 1. Connect
```bash
ssh -i your-key.pem ubuntu@<FRONTEND-EC2-IP>
```

### 2. Setup
```bash
# Upload and run setup script
chmod +x frontend-setup.sh
./frontend-setup.sh
```

### 3. Deploy Frontend
```bash
# Upload files (from local machine)
scp -i your-key.pem -r C:\Users\r7nrc\OneDrive\Desktop\full_backend_testing\frontend ubuntu@<FRONTEND-EC2-IP>:~/app/

# On EC2
cd ~/app/frontend

# Update environment variable
nano .env
# Change to: VITE_API_BASE_URL=http://<BACKEND-EC2-PUBLIC-IP>:5000

# Build
npm install
npm run build
```

### 4. Configure Nginx
```bash
# Upload nginx config (from local machine)
scp -i your-key.pem nginx-config.conf ubuntu@<FRONTEND-EC2-IP>:~/

# On EC2
sudo cp ~/nginx-config.conf /etc/nginx/sites-available/ocr-app
sudo ln -s /etc/nginx/sites-available/ocr-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Verify
```bash
# Check Nginx
sudo systemctl status nginx

# Test locally
curl http://localhost

# From browser
# http://<FRONTEND-EC2-PUBLIC-IP>
```

---

## Quick Tests

### Test Backend
```bash
# From anywhere
curl http://<BACKEND-EC2-PUBLIC-IP>:5000/api/health
curl http://<BACKEND-EC2-PUBLIC-IP>:5000/api/ocr/info
```

### Test Frontend
```
Open browser: http://<FRONTEND-EC2-PUBLIC-IP>
Upload image and test full workflow
```

---

## Common Issues

### Backend not accessible
```bash
# Check Docker container
docker ps
docker logs paddle-ocr-backend

# Check EC2 security group allows port 5000
```

### Frontend CORS errors
```bash
# Update backend CORS to allow frontend IP
# Or use '*' for development

# Restart backend
cd ~/app/backend
docker-compose restart
```

### Nginx not serving files
```bash
# Check build directory
ls -la ~/app/frontend/dist/

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Update Deployment

### Update Backend
```bash
cd ~/app/backend
# Pull latest changes or upload new files
docker-compose down
docker-compose up -d --build
```

### Update Frontend
```bash
cd ~/app/frontend
# Pull latest changes or upload new files
npm run build
sudo systemctl restart nginx
```
