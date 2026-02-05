# Full Backend Testing - OCR Application

React + Material-UI frontend with PaddleOCR Flask backend for text extraction from images.

## 🚀 Quick Start

### Local Development

**Backend:**
```bash
cd backend
docker-compose up -d --build
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📦 Project Structure

```
full_backend_testing/
├── backend/              # Flask API with PaddleOCR
│   ├── docker_ocr.py     # Main Flask application
│   ├── Dockerfile        # Docker configuration
│   ├── docker-compose.yml
│   └── requirements.txt
├── frontend/             # React + Material-UI
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── App.jsx
│   └── package.json
├── backend-setup.sh      # Backend EC2 setup script
├── frontend-setup.sh     # Frontend EC2 setup script
├── nginx-config.conf     # Nginx configuration
├── DEPLOYMENT_GUIDE.md   # Full deployment guide
└── QUICK_DEPLOY.md       # Quick reference
```

## 🌐 Deployment

### Backend EC2
1. Launch Ubuntu 22.04 EC2 (t3.medium)
2. Run `backend-setup.sh`
3. Clone repo and build Docker

### Frontend EC2
1. Launch Ubuntu 22.04 EC2 (t2.small)
2. Run `frontend-setup.sh`
3. Clone repo, build, and configure Nginx

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🛠️ Technologies

**Backend:**
- Python 3.9
- Flask
- PaddleOCR
- Docker

**Frontend:**
- React 18
- Material-UI
- Vite
- Axios

## 📝 Environment Variables

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:5000
```

**Backend:**
```
PORT=5000
DEBUG=False
```

## 🧪 API Endpoints

- `GET /api/health` - Health check
- `POST /api/ocr/upload` - Upload and process image
- `GET /api/ocr/info` - Service information

## 📄 License

MIT
