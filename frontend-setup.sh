#!/bin/bash

# Frontend EC2 Setup Script for React Application
# Run this on Ubuntu 22.04 EC2 instance

set -e  # Exit on any error

echo "=========================================="
echo "Frontend EC2 Setup - React Application"
echo "=========================================="

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20.x
echo "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build essentials
sudo apt-get install -y build-essential

# Install Nginx
echo "Installing Nginx..."
sudo apt-get install -y nginx

# Install useful utilities
echo "Installing utilities..."
sudo apt-get install -y git curl wget htop nano

# Create application directory
echo "Creating application directory..."
mkdir -p ~/app/frontend

# Enable Nginx to start on boot
sudo systemctl enable nginx
sudo systemctl start nginx

# Configure firewall (optional - EC2 security groups handle this)
# sudo ufw allow 22/tcp
# sudo ufw allow 80/tcp
# sudo ufw allow 443/tcp
# sudo ufw --force enable

echo "=========================================="
echo "Frontend EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Upload your frontend files to ~/app/frontend/"
echo "2. cd ~/app/frontend"
echo "3. Create/update .env file with backend URL"
echo "4. Run: npm install"
echo "5. Run: npm run build"
echo "6. Configure Nginx (use provided nginx config)"
echo "7. Copy nginx config to /etc/nginx/sites-available/"
echo "8. Create symlink and restart Nginx"
echo ""
echo "To upload files from local machine:"
echo "scp -i your-key.pem -r frontend/ ubuntu@<EC2-IP>:~/app/"
echo ""
echo "=========================================="

# Display versions
echo ""
echo "Installed versions:"
node --version
npm --version
nginx -v
echo ""
