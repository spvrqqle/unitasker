import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Alert,
} from '@mui/material';
import { DeleteForever as DeleteForeverIcon } from '@mui/icons-material';

const ClearDataDialog = ({ open, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [clearing, setClearing] = useState(false);

  const CONFIRM_PHRASE = 'DELETE';
  const canConfirm = confirmText === CONFIRM_PHRASE;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setClearing(true);
    try {
      await onConfirm();
      setConfirmText('');
      setClearing(false);
      onClose();
    } catch (err) {
      console.error('Failed to clear data:', err);
      setClearing(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: 'error.main' }}>
        Clear All Data
      </DialogTitle>

      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            This cannot be undone
          </Typography>
          <Typography variant="caption">
            All tasks, notes, events, resources, and timer sessions will be permanently deleted.
            Your settings will also be reset to defaults.
          </Typography>
        </Alert>

        <Typography variant="body2" sx={{ mb: 1 }}>
          Type <strong>DELETE</strong> to confirm:
        </Typography>

        <TextField
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          fullWidth
          size="small"
          autoFocus
          placeholder="DELETE"
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!canConfirm || clearing}
          startIcon={<DeleteForeverIcon />}
        >
          {clearing ? 'Clearing…' : 'Clear Everything'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearDataDialog;