# Paddle OCR Backend API

Flask-based REST API for image text extraction using PaddleOCR.

## Features
- Text detection and recognition from images
- Bounding box coordinates and dimensions
- Support for multiple image formats (PNG, JPG, JPEG, BMP, TIFF, WEBP)
- Dockerized for easy deployment

## Local Development

### Prerequisites
- Python 3.9+
- Docker (for containerized deployment)

### Setup Without Docker

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python docker_ocr.py
```

The API will be available at `http://localhost:5000`

### Setup With Docker

#### Build the Docker image:
```bash
docker build -t paddle-ocr-api .
```

#### Run the container:
```bash
docker run -d -p 5000:5000 --name paddle-ocr paddle-ocr-api
```

#### Using Docker Compose:
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns service status and OCR initialization state.

### Process Image
```
POST /api/ocr/process
Content-Type: multipart/form-data
Body: image file (field name: "image")
```
Processes uploaded image and returns OCR results with dimensions.

**Response:**
```json
{
  "success": true,
  "image_dimensions": {"width": 1920, "height": 1080},
  "total_text_regions": 5,
  "full_text": "extracted text...",
  "ocr_results": [
    {
      "id": 1,
      "text": "detected text",
      "confidence": 0.9876,
      "bounding_box": {
        "coordinates": [[x1,y1], [x2,y2], [x3,y3], [x4,y4]],
        "x_min": 100,
        "y_min": 200,
        "x_max": 300,
        "y_max": 250
      },
      "dimensions": {
        "width": 200,
        "height": 50
      }
    }
  ]
}
```

### Service Info
```
GET /api/ocr/info
```
Returns API capabilities and configuration.

## Testing

### Using curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Process image
curl -X POST -F "image=@/path/to/image.jpg" http://localhost:5000/api/ocr/process
```

### Using Python:
```python
import requests

# Upload and process image
with open('image.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/ocr/process',
        files={'image': f}
    )
    print(response.json())
```

## Docker Commands

### View logs:
```bash
docker logs paddle-ocr
docker logs -f paddle-ocr  # Follow logs
```

### Stop container:
```bash
docker stop paddle-ocr
```

### Remove container:
```bash
docker rm paddle-ocr
```

### Remove image:
```bash
docker rmi paddle-ocr-api
```

### Rebuild and restart:
```bash
docker stop paddle-ocr
docker rm paddle-ocr
docker build -t paddle-ocr-api .
docker run -d -p 5000:5000 --name paddle-ocr paddle-ocr-api
```

## Configuration

Environment variables:
- `PORT` - Server port (default: 5000)
- `DEBUG` - Debug mode (default: False)

## Troubleshooting

### Container won't start:
```bash
docker logs paddle-ocr
```

### Check if container is running:
```bash
docker ps
```

### Access container shell:
```bash
docker exec -it paddle-ocr /bin/bash
```

### Check resource usage:
```bash
docker stats paddle-ocr
```

## Production Deployment

For production, consider:
1. Using a proper WSGI server (Gunicorn)
2. Setting up reverse proxy (Nginx)
3. Configuring resource limits
4. Setting up monitoring and logging
5. Using orchestration (Docker Swarm, Kubernetes)
