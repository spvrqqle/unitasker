import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import {
  UploadFile as UploadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const ImportDialog = ({ open, onClose, onImport }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedContent, setParsedContent] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setSelectedFile(null);
    setParsedContent(null);
    setError('');
    setImporting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSelectedFile(file);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed._meta || parsed._meta.app !== 'UniTasker') {
        setError('This doesn\'t look like a UniTasker backup file.');
        setParsedContent(null);
        return;
      }

      setParsedContent(parsed);
    } catch (err) {
      setError(`Failed to read file: ${err.message}`);
      setParsedContent(null);
    }
  };

  const handleImport = async () => {
    if (!parsedContent) return;
    setImporting(true);
    try {
      await onImport(parsedContent);
      reset();
    } catch (err) {
      setError(err.message);
      setImporting(false);
    }
  };

  const meta = parsedContent?._meta;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Data</DialogTitle>

      <DialogContent>
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            This will replace all your current data
          </Typography>
          <Typography variant="caption">
            Your tasks, notes, events, resources, and settings will be overwritten.
            Consider exporting first if you want to keep your current data.
          </Typography>
        </Alert>

        {/* File picker */}
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `2px dashed ${theme.palette.divider}`,
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: 'action.hover',
            },
          }}
        >
          <UploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {selectedFile ? selectedFile.name : 'Click to choose a backup file (.json)'}
          </Typography>
          {selectedFile && (
            <Typography variant="caption" color="text.secondary">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </Typography>
          )}
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileSelect}
        />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Preview */}
        {parsedContent && meta && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Backup contents:
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Exported</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(meta.exportedAt).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Version</Typography>
                <Typography variant="body2" color="text.secondary">
                  {meta.version}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Tasks</Typography>
                <Typography variant="body2" color="text.secondary">
                  {meta.stats?.tasks ?? '?'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Notes</Typography>
                <Typography variant="body2" color="text.secondary">
                  {meta.stats?.notes ?? '?'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Events</Typography>
                <Typography variant="body2" color="text.secondary">
                  {meta.stats?.events ?? '?'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Resources</Typography>
                <Typography variant="body2" color="text.secondary">
                  {meta.stats?.resources ?? '?'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Timer sessions</Typography>
                <Typography variant="body2" color="text.secondary">
                  {meta.stats?.timerSessions ?? '?'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          color="error"
          disabled={!parsedContent || importing}
        >
          {importing ? 'Importing…' : 'Replace & Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;