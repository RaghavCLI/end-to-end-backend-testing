import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
} from '@mui/icons-material';

// Import components
import ImageUploader from './components/ImageUploader';
import ImagePreview from './components/ImagePreview';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsDisplay from './components/ResultsDisplay';
import ErrorMessage from './components/ErrorMessage';

// Import API service
import { uploadImage, healthCheck, API_BASE_URL } from './services/ocrApi';

import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
      lighter: '#e8f5e9',
    },
    error: {
      main: '#d32f2f',
      lighter: '#ffebee',
    },
    info: {
      main: '#0288d1',
      lighter: '#e1f5fe',
      dark: '#01579b',
    },
  },
});

function App() {
  // State management
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrResults, setOcrResults] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Check if backend is running
  const checkBackendHealth = async () => {
    const result = await healthCheck();
    setBackendStatus(result.success);
  };

  // Handle image selection
  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setError(null);
    setOcrResults(null);
  };

  // Handle clear/remove image
  const handleClearImage = () => {
    setSelectedImage(null);
    setError(null);
    setOcrResults(null);
    setUploadProgress(0);
  };

  // Handle OCR processing
  const handleProcessImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setOcrResults(null);
    setUploadProgress(0);

    try {
      // Upload and process image
      const result = await uploadImage(selectedImage, (progress) => {
        setUploadProgress(progress);
      });

      if (result.success) {
        setOcrResults(result);
        setError(null);
      } else {
        setError(result.error || 'Failed to process image');
        setOcrResults(null);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      setOcrResults(null);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    if (selectedImage) {
      handleProcessImage();
    }
  };

  // Handle reset (process new image)
  const handleReset = () => {
    setSelectedImage(null);
    setOcrResults(null);
    setError(null);
    setUploadProgress(0);
    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            🔍 OCR Image Processing
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
            Upload an image to extract text using PaddleOCR
          </Typography>

          {/* Backend Status */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip
              icon={backendStatus ? <CheckCircleIcon /> : undefined}
              label={
                backendStatus
                  ? `Backend Connected: ${API_BASE_URL}`
                  : `Backend Offline: ${API_BASE_URL}`
              }
              color={backendStatus ? 'success' : 'error'}
              variant="outlined"
              size="small"
              onClick={checkBackendHealth}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Main Content */}
        <Box sx={{ mb: 4 }}>
          {!ocrResults ? (
            // Upload and Preview Section
            <Stack spacing={4}>
              {/* Image Uploader */}
              {!selectedImage && (
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom align="center">
                    <PhotoCameraIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Step 1: Select Image
                  </Typography>
                  <ImageUploader
                    onImageSelect={handleImageSelect}
                    selectedFile={selectedImage}
                    onClear={handleClearImage}
                  />
                </Paper>
              )}

              {/* Image Preview */}
              {selectedImage && !loading && (
                <Paper elevation={0} sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom align="center">
                    <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                    Step 2: Preview & Process
                  </Typography>
                  <ImagePreview file={selectedImage} onRemove={handleClearImage} />
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SendIcon />}
                      onClick={handleProcessImage}
                      disabled={!backendStatus}
                      sx={{ minWidth: 200 }}
                    >
                      Process Image
                    </Button>
                  </Box>
                  {!backendStatus && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Backend is not connected. Please start the backend server.
                    </Alert>
                  )}
                </Paper>
              )}

              {/* Loading State */}
              {loading && (
                <LoadingSpinner
                  message="Processing Image with OCR..."
                  subMessage="Extracting text from your image"
                  progress={uploadProgress > 0 ? uploadProgress : null}
                />
              )}

              {/* Error Message */}
              {error && !loading && (
                <ErrorMessage
                  error={error}
                  onRetry={handleRetry}
                  onClose={() => setError(null)}
                />
              )}
            </Stack>
          ) : (
            // Results Section
            <ResultsDisplay results={ocrResults} onReset={handleReset} />
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ py: 4, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Powered by PaddleOCR • Built with React + Material-UI
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
