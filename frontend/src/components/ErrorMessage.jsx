import React from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Paper,
  Typography,
  Stack,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  WifiOff as WifiOffIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onClose, 
  showRetry = true,
  severity = 'error' 
}) => {
  if (!error) {
    return null;
  }

  // Determine error type and icon
  const getErrorIcon = () => {
    const errorLower = error.toLowerCase();
    if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('response')) {
      return <WifiOffIcon />;
    }
    if (errorLower.includes('file') || errorLower.includes('size') || errorLower.includes('type')) {
      return <StorageIcon />;
    }
    if (errorLower.includes('timeout')) {
      return <WarningIcon />;
    }
    return <ErrorIcon />;
  };

  // Get error title based on error message
  const getErrorTitle = () => {
    const errorLower = error.toLowerCase();
    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return 'Network Error';
    }
    if (errorLower.includes('timeout')) {
      return 'Request Timeout';
    }
    if (errorLower.includes('file')) {
      return 'File Error';
    }
    if (errorLower.includes('server') || errorLower.includes('backend')) {
      return 'Server Error';
    }
    return 'Error';
  };

  // Get helpful suggestions based on error type
  const getErrorSuggestions = () => {
    const errorLower = error.toLowerCase();
    const suggestions = [];

    if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('response')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Verify the backend server is running');
      suggestions.push('Check the API URL in environment variables');
    } else if (errorLower.includes('timeout')) {
      suggestions.push('The image may be too large');
      suggestions.push('Try with a smaller image');
      suggestions.push('Check if the backend server is responding');
    } else if (errorLower.includes('file') && errorLower.includes('size')) {
      suggestions.push('Maximum file size is 16MB');
      suggestions.push('Try compressing the image');
    } else if (errorLower.includes('file') && errorLower.includes('type')) {
      suggestions.push('Supported formats: PNG, JPG, JPEG, BMP, TIFF, WEBP');
      suggestions.push('Make sure the file extension is correct');
    } else if (errorLower.includes('backend') || errorLower.includes('server')) {
      suggestions.push('Make sure Docker container is running');
      suggestions.push('Check backend logs for more details');
    }

    return suggestions;
  };

  const errorTitle = getErrorTitle();
  const suggestions = getErrorSuggestions();

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', my: 2 }}>
      <Alert
        severity={severity}
        icon={getErrorIcon()}
        action={
          onClose && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )
        }
        sx={{ mb: suggestions.length > 0 ? 2 : 0 }}
      >
        <AlertTitle>{errorTitle}</AlertTitle>
        <Typography variant="body2" paragraph={suggestions.length > 0} sx={{ mb: suggestions.length > 0 ? 1 : 0 }}>
          {error}
        </Typography>

        {/* Retry Button */}
        {showRetry && onRetry && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            sx={{ mt: 1 }}
          >
            Retry
          </Button>
        )}
      </Alert>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, backgroundColor: 'info.lighter' }}>
          <Typography variant="subtitle2" color="info.dark" gutterBottom>
            Suggestions:
          </Typography>
          <Stack spacing={0.5}>
            {suggestions.map((suggestion, index) => (
              <Typography
                key={index}
                variant="body2"
                color="info.dark"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: 'info.main',
                    flexShrink: 0,
                  }}
                />
                {suggestion}
              </Typography>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default ErrorMessage;
