import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

// Allowed file types
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'];
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

const ImageUploader = ({ onImageSelect, selectedFile, onClear }) => {
  const [error, setError] = useState(null);

  // Validate file type
  const isValidFileType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    return ALLOWED_EXTENSIONS.includes(extension);
  };

  // Validate file size
  const isValidFileSize = (file) => {
    return file.size <= MAX_FILE_SIZE;
  };

  // Handle file drop/selection
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError(null);

      // Handle rejected files
      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors) {
          const errorCode = rejection.errors[0].code;
          if (errorCode === 'file-too-large') {
            setError(`File is too large. Maximum size is 16MB.`);
          } else if (errorCode === 'file-invalid-type') {
            setError(
              `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
            );
          } else {
            setError('File validation failed. Please try another file.');
          }
        }
        return;
      }

      // Handle accepted files
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Additional validation
        if (!isValidFileType(file)) {
          setError(
            `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
          );
          return;
        }

        if (!isValidFileSize(file)) {
          setError('File is too large. Maximum size is 16MB.');
          return;
        }

        // File is valid, pass to parent
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
  });

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    setError(null);
    onClear();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Dropzone Area */}
      <Paper
        {...getRootProps()}
        elevation={isDragActive ? 8 : 2}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive
            ? 'primary.main'
            : isDragReject
            ? 'error.main'
            : selectedFile
            ? 'success.main'
            : 'grey.400',
          backgroundColor: isDragActive
            ? 'action.hover'
            : isDragReject
            ? 'error.lighter'
            : selectedFile
            ? 'success.lighter'
            : 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: selectedFile ? 'success.main' : 'primary.main',
            backgroundColor: 'action.hover',
          },
          position: 'relative',
        }}
      >
        <input {...getInputProps()} />

        {/* Content based on state */}
        {selectedFile ? (
          // File selected state
          <Box>
            <CheckCircleIcon
              sx={{ fontSize: 60, color: 'success.main', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom color="success.main">
              File Selected
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mt: 2,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                icon={<ImageIcon />}
                label={selectedFile.name}
                color="success"
                variant="outlined"
              />
              <Chip
                label={formatFileSize(selectedFile.size)}
                size="small"
                variant="outlined"
              />
              <IconButton
                onClick={handleClear}
                color="error"
                size="small"
                sx={{ ml: 1 }}
              >
                <ClearIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Click or drag to replace file
            </Typography>
          </Box>
        ) : isDragActive ? (
          // Dragging state
          <Box>
            <CloudUploadIcon
              sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h6" color="primary">
              Drop the image here
            </Typography>
          </Box>
        ) : (
          // Default state
          <Box>
            <CloudUploadIcon sx={{ fontSize: 60, color: 'action.active', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop Image Here
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              or
            </Typography>
            <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
              Browse Files
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
              Supported formats: PNG, JPG, JPEG, BMP, TIFF, WEBP (Max: 16MB)
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ImageUploader;
