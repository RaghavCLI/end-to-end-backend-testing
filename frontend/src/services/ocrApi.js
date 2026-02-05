import axios from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for OCR processing
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

/**
 * Health check endpoint to verify backend is running
 * @returns {Promise<Object>} Health status response
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/api/health');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Backend is not responding',
    };
  }
};

/**
 * Upload image file to OCR backend for processing
 * @param {File} file - The image file to process
 * @param {Function} onUploadProgress - Optional callback for upload progress
 * @returns {Promise<Object>} OCR processing results
 */
export const uploadImage = async (file, onUploadProgress = null) => {
  try {
    // Validate file exists
    if (!file) {
      throw new Error('No file provided');
    }

    // Create FormData and append the file
    const formData = new FormData();
    formData.append('image', file);

    // Make POST request with optional progress tracking
    const response = await apiClient.post('/api/ocr/upload', formData, {
      onUploadProgress: onUploadProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        : undefined,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Image upload failed:', error);

    // Handle different error scenarios
    let errorMessage = 'Failed to process image';
    let errorDetails = null;

    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.error || errorMessage;
      errorDetails = error.response.data?.details || null;
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response from server. Please check if backend is running.';
    } else {
      // Error in request setup
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      details: errorDetails,
      statusCode: error.response?.status,
    };
  }
};

/**
 * Test API connection
 * @returns {Promise<boolean>} True if connection successful
 */
export const testConnection = async () => {
  try {
    const result = await healthCheck();
    return result.success;
  } catch (error) {
    return false;
  }
};

// Export API base URL for reference
export { API_BASE_URL };

export default {
  healthCheck,
  uploadImage,
  testConnection,
  API_BASE_URL,
};
