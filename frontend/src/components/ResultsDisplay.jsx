import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  TextFields as TextFieldsIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const ResultsDisplay = ({ results, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  if (!results || !results.success) {
    return null;
  }

  const { data } = results;
  const ocrResults = data?.ocr_results || [];
  const totalText = data?.total_text || '';
  const imageInfo = data?.image_info || {};
  const processingTime = data?.processing_time;

  // Copy all text to clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(totalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Download results as JSON
  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download text as TXT
  const handleDownloadText = () => {
    const dataBlob = new Blob([totalText], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-text-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Toggle expansion of text item
  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Format confidence as percentage
  const formatConfidence = (confidence) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', mt: 4 }}>
      {/* Success Alert */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Successfully extracted {ocrResults.length} text element(s) from the image!
        </Typography>
      </Alert>

      {/* Summary Card */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            OCR Results Summary
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip
              icon={<TextFieldsIcon />}
              label={`${ocrResults.length} Text Blocks`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${totalText.length} Characters`}
              color="primary"
              variant="outlined"
            />
            {imageInfo.width && imageInfo.height && (
              <Chip
                label={`${imageInfo.width} × ${imageInfo.height} px`}
                variant="outlined"
              />
            )}
            {processingTime && (
              <Chip
                label={`Processed in ${processingTime.toFixed(2)}s`}
                variant="outlined"
              />
            )}
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={copied ? <CheckCircleIcon /> : <CopyIcon />}
              onClick={handleCopyText}
              disabled={!totalText}
            >
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadText}
              disabled={!totalText}
            >
              Download TXT
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadJSON}
            >
              Download JSON
            </Button>
            <Button variant="outlined" color="secondary" onClick={onReset}>
              Process New Image
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Extracted Text Display */}
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Extracted Text
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: 'grey.50',
              maxHeight: 300,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}
          >
            {totalText || 'No text extracted'}
          </Paper>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Results ({ocrResults.length} items)
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell>#</TableCell>
                  <TableCell>Text</TableCell>
                  <TableCell align="center">Confidence</TableCell>
                  <TableCell align="center">Position</TableCell>
                  <TableCell align="center">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ocrResults.map((item, index) => (
                  <React.Fragment key={index}>
                    <TableRow hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap={!expandedItems.has(index)}>
                          {item.text}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={formatConfidence(item.confidence)}
                          color={getConfidenceColor(item.confidence)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<LocationIcon />}
                          label={`X:${item.position.x_min} Y:${item.position.y_min}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Show Details">
                          <IconButton
                            size="small"
                            onClick={() => toggleExpanded(index)}
                            sx={{
                              transform: expandedItems.has(index) ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s',
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                        <Collapse in={expandedItems.has(index)} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, pl: 4, backgroundColor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Full Text:
                            </Typography>
                            <Typography variant="body2" paragraph sx={{ fontFamily: 'monospace' }}>
                              {item.text}
                            </Typography>
                            <Typography variant="subtitle2" gutterBottom>
                              Bounding Box:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip label={`X: ${item.position.x_min} → ${item.position.x_max}`} size="small" />
                              <Chip label={`Y: ${item.position.y_min} → ${item.position.y_max}`} size="small" />
                              <Chip label={`Width: ${item.dimensions.width}px`} size="small" />
                              <Chip label={`Height: ${item.dimensions.height}px`} size="small" />
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResultsDisplay;
