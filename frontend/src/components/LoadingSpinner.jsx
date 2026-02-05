import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
  Paper,
  Stack,
} from '@mui/material';
import { HourglassEmpty as HourglassIcon } from '@mui/icons-material';

const LoadingSpinner = ({ 
  message = 'Processing image...', 
  subMessage = 'This may take a few seconds',
  progress = null,
  fullScreen = false 
}) => {
  const content = (
    <Paper
      elevation={fullScreen ? 0 : 3}
      sx={{
        p: 4,
        textAlign: 'center',
        backgroundColor: fullScreen ? 'transparent' : 'background.paper',
        borderRadius: 2,
      }}
    >
      <Stack spacing={3} alignItems="center">
        {/* Animated Icon or Progress */}
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            size={80}
            thickness={4}
            variant={progress !== null ? 'determinate' : 'indeterminate'}
            value={progress || 0}
            sx={{
              color: 'primary.main',
            }}
          />
          {progress !== null && (
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" component="div" color="text.secondary">
                {`${Math.round(progress)}%`}
              </Typography>
            </Box>
          )}
          {progress === null && (
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HourglassIcon sx={{ fontSize: 30, color: 'primary.main' }} />
            </Box>
          )}
        </Box>

        {/* Message */}
        <Box>
          <Typography variant="h6" color="primary" gutterBottom>
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subMessage}
          </Typography>
        </Box>

        {/* Linear Progress Bar */}
        {progress !== null && (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Processing Steps Indicator */}
        {progress === null && (
          <Box sx={{ width: '100%', maxWidth: 300 }}>
            <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        )}
      </Stack>
    </Paper>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        my: 4,
      }}
    >
      {content}
    </Box>
  );
};

export default LoadingSpinner;
