import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const ExportDialog = ({ open, onClose, stats, onExport }) => {
  const theme = useTheme();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Export Data</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Export everything as a single JSON file. You can use it to back up your data
          or move it to another browser or device.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            What's included:
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Tasks</Typography>
              <Typography variant="body2" color="text.secondary">{stats.tasks}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Notes</Typography>
              <Typography variant="body2" color="text.secondary">{stats.notes}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Events</Typography>
              <Typography variant="body2" color="text.secondary">{stats.events}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Resources</Typography>
              <Typography variant="body2" color="text.secondary">{stats.resources}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Timer sessions</Typography>
              <Typography variant="body2" color="text.secondary">{stats.timerSessions}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Settings</Typography>
              <Typography variant="body2" color="text.secondary">theme + timer config</Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={exporting}
        >
          {exporting ? 'Exporting…' : 'Download JSON'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;