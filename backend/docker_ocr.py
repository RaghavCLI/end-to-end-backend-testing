from flask import Flask, request, jsonify
from flask_cors import CORS
from paddleocr import PaddleOCR
import cv2
import numpy as np
import os
import logging
from werkzeug.utils import secure_filename
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS - Allow all origins for development
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"])

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'}
UPLOAD_FOLDER = '/tmp/ocr_uploads'

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize PaddleOCR
# use_angle_cls=True enables text direction classification
# lang='en' for English, change to 'ch' for Chinese or other supported languages
try:
    ocr = PaddleOCR(
        use_angle_cls=True,
        lang='en',
        show_log=False,
        use_gpu=False  # Set to True if GPU is available
    )
    logger.info("PaddleOCR initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize PaddleOCR: {str(e)}")
    ocr = None


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def process_image_with_ocr(image_path):
    """
    Process image with PaddleOCR and extract text with dimensions
    
    Args:
        image_path: Path to the image file
        
    Returns:
        dict: Processing results with text and dimensions
    """
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Failed to read image file")
        
        # Get image dimensions
        img_height, img_width = img.shape[:2]
        
        # Run OCR
        result = ocr.ocr(image_path, cls=True)
        
        # Process results
        ocr_results = []
        total_text = ""
        
        if result and result[0]:
            for idx, line in enumerate(result[0]):
                # Each line contains: [box_coordinates, (text, confidence)]
                box = line[0]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
                text_info = line[1]  # (text, confidence)
                text = text_info[0]
                confidence = text_info[1]
                
                # Calculate bounding box dimensions
                x_coords = [point[0] for point in box]
                y_coords = [point[1] for point in box]
                
                x_min = min(x_coords)
                x_max = max(x_coords)
                y_min = min(y_coords)
                y_max = max(y_coords)
                
                width = x_max - x_min
                height = y_max - y_min
                
                ocr_results.append({
                    'id': idx + 1,
                    'text': text,
                    'confidence': round(confidence, 4),
                    'position': {
                        'x_min': round(x_min, 2),
                        'y_min': round(y_min, 2),
                        'x_max': round(x_max, 2),
                        'y_max': round(y_max, 2)
                    },
                    'bounding_box': {
                        'coordinates': box,
                        'x_min': round(x_min, 2),
                        'y_min': round(y_min, 2),
                        'x_max': round(x_max, 2),
                        'y_max': round(y_max, 2)
                    },
                    'dimensions': {
                        'width': round(width, 2),
                        'height': round(height, 2)
                    }
                })
                
                total_text += text + " "
        
        return {
            'success': True,
            'image_info': {
                'width': img_width,
                'height': img_height
            },
            'total_text_regions': len(ocr_results),
            'total_text': total_text.strip(),
            'ocr_results': ocr_results
        }
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}\n{traceback.format_exc()}")
        raise


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = {
        'status': 'healthy',
        'service': 'Paddle OCR API',
        'ocr_initialized': ocr is not None
    }
    
    return jsonify(status), 200


@app.route('/api/ocr/upload', methods=['POST', 'OPTIONS'])
@app.route('/api/ocr/process', methods=['POST', 'OPTIONS'])
def process_ocr():
    """
    Process uploaded image with OCR
    
    Expected: multipart/form-data with 'image' field
    Returns: JSON with OCR results including text and dimensions
    """
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    try:
        # Check if OCR is initialized
        if ocr is None:
            return jsonify({
                'success': False,
                'error': 'OCR service not initialized'
            }), 503
        
        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        file = request.files['image']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Secure the filename and save
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        logger.info(f"Processing image: {filename}")
        
        # Process image with OCR
        result = process_image_with_ocr(filepath)
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
        except Exception as e:
            logger.warning(f"Failed to delete temporary file: {str(e)}")
        
        logger.info(f"Successfully processed image: {filename}")
        return jsonify(result), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Error in OCR processing: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during OCR processing'
        }), 500


@app.route('/api/ocr/info', methods=['GET'])
def ocr_info():
    """Get OCR service information"""
    info = {
        'service': 'Paddle OCR API',
        'version': '1.0.0',
        'supported_formats': list(ALLOWED_EXTENSIONS),
        'max_file_size_mb': app.config['MAX_CONTENT_LENGTH'] / (1024 * 1024),
        'language': 'en',
        'features': [
            'Text detection',
            'Text recognition',
            'Bounding box coordinates',
            'Text dimensions',
            'Confidence scores'
        ]
    }
    return jsonify(info), 200


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 16MB'
    }), 413


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Run the Flask app
    # In production, use a proper WSGI server like Gunicorn
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Paddle OCR API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
