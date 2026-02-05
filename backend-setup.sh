#!/bin/bash

# Backend EC2 Setup Script for OCR API
# Run this on Ubuntu 22.04 EC2 instance

set -e  # Exit on any error

echo "=========================================="
echo "Backend EC2 Setup - PaddleOCR API"
echo "=========================================="

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
echo "Adding user to docker group..."
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose standalone (if needed)
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "Creating application directory..."
mkdir -p ~/app/backend

# Install useful utilities
echo "Installing utilities..."
sudo apt-get install -y git curl wget htop nano

# Configure firewall (optional - EC2 security groups handle this)
# sudo ufw allow 22/tcp
# sudo ufw allow 5000/tcp
# sudo ufw --force enable

echo "=========================================="
echo "Backend EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Log out and log back in for Docker permissions to take effect"
echo "2. Upload your backend files to ~/app/backend/"
echo "3. cd ~/app/backend"
echo "4. Run: docker-compose up -d --build"
echo ""
echo "To upload files from local machine:"
echo "scp -i your-key.pem -r backend/ ubuntu@<EC2-IP>:~/app/"
echo ""
echo "To test: curl http://localhost:5000/api/health"
echo "=========================================="

# Display versions
echo ""
echo "Installed versions:"
docker --version
docker-compose --version
echo ""
echo "Please log out and log back in to use Docker without sudo"
