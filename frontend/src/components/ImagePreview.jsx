import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  Image as ImageIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ImagePreview = ({ file, onRemove, showDetails = true }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setImageInfo(null);
      return;
    }

    let isSubscribed = true;
    let objectUrl = null;

    try {
      // Create preview URL
      objectUrl = URL.createObjectURL(file);
      
      if (isSubscribed) {
        setPreviewUrl(objectUrl);
      }

      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        if (isSubscribed) {
          setImageInfo({
            width: img.width,
            height: img.height,
            aspectRatio: (img.width / img.height).toFixed(2),
          });
        }
      };
      img.onerror = () => {
        console.warn('Failed to load image dimensions');
      };
      img.src = objectUrl;
    } catch (error) {
      console.error('Error creating preview:', error);
    }

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Format file type
  const getFileType = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  if (!file || !previewUrl) {
    return null;
  }

  return (
    <Card
      elevation={3}
      sx={{
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Remove Button */}
      <Tooltip title="Remove Image">
        <IconButton
          onClick={onRemove}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'error.main',
            color: 'white',
            zIndex: 2,
            '&:hover': {
              backgroundColor: 'error.dark',
            },
          }}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      {/* Image Display */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          backgroundColor: 'grey.100',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
          maxHeight: 600,
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={previewUrl}
          alt={file.name}
          sx={{
            maxWidth: '100%',
            maxHeight: 600,
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Image Details */}
      {showDetails && (
        <CardContent>
          <Stack spacing={2}>
            {/* File Name */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                File Name
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {file.name}
              </Typography>
            </Box>

            {/* File Info Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<ImageIcon />}
                label={getFileType(file.name)}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<InfoIcon />}
                label={formatFileSize(file.size)}
                size="small"
                variant="outlined"
              />
              {imageInfo && (
                <>
                  <Chip
                    label={`${imageInfo.width} × ${imageInfo.height} px`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Ratio: ${imageInfo.aspectRatio}`}
                    size="small"
                    variant="outlined"
                  />
                </>
              )}
            </Stack>

            {/* Additional Info */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Preview is ready. Click "Process Image" to extract text.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};

export default ImagePreview;
