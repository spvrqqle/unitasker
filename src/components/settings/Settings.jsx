import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Stack,
  Grid,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon,
  UploadFile as UploadIcon,
  DeleteForever as DeleteIcon,
  Palette as PaletteIcon,
  Info as InfoIcon,
  BarChart as StatsIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useTheme as useThemeContext } from '../../context/ThemeContext';
import ExportDialog from './ExportDialog';
import ImportDialog from './ImportDialog';
import ClearDataDialog from './ClearDataDialog';
import NotificationSettingsSection from './NotificationSettingsSection';
import {
  exportAllData,
  downloadJSON,
  generateExportFilename,
  importAllData,
  clearAllData,
  getDataStatistics,
  formatBytes,
  APP_VERSION,
} from '../../services/data.service';

const Settings = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  const [stats, setStats] = useState({
    tasks: 0,
    notes: 0,
    events: 0,
    resources: 0,
    timerSessions: 0,
    estimatedBytes: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const refreshStats = async () => {
    setLoadingStats(true);
    try {
      const s = await getDataStatistics();
      setStats(s);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      downloadJSON(json, generateExportFilename());
      setExportOpen(false);
      showSnackbar('Backup downloaded successfully', 'success');
    } catch (err) {
      showSnackbar(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleImport = async (parsed) => {
    try {
      await importAllData(parsed);
      setImportOpen(false);
      await refreshStats();
      showSnackbar('Data imported successfully — reloading…', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showSnackbar(`Import failed: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      showSnackbar('All data cleared — reloading…', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showSnackbar(`Failed to clear data: ${err.message}`, 'error');
      throw err;
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Appearance */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <PaletteIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Appearance
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Theme
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Currently using <strong>{isDarkMode ? 'Dark' : 'Light'}</strong> mode
            </Typography>
          </Box>
          <Button variant="outlined" onClick={toggleTheme}>
            Switch to {isDarkMode ? 'Light' : 'Dark'}
          </Button>
        </Box>
      </Paper>

      {/* Notifications */}
      <NotificationSettingsSection />

      {/* Data Management */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <StorageIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Data Management
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => setExportOpen(true)}
            >
              Export Data
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Download a JSON backup
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => setImportOpen(true)}
            >
              Import Data
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Restore from a backup file
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setClearOpen(true)}
            >
              Clear All Data
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Permanently delete everything
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <StatsIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Storage Statistics
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {loadingStats ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="caption" color="text.secondary">Tasks</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.tasks}</Typography>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="caption" color="text.secondary">Notes</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.notes}</Typography>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="caption" color="text.secondary">Events</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.events}</Typography>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="caption" color="text.secondary">Resources</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.resources}</Typography>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Typography variant="caption" color="text.secondary">Timer sessions</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.timerSessions}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Estimated storage used
                </Typography>
                <Chip
                  label={formatBytes(stats.estimatedBytes)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* About */}
      <Paper
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <InfoIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            About UniTasker
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar src="/favicon.svg" alt="UniTasker" sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              UniTasker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Offline-First Productivity PWA
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip label={`v${APP_VERSION}`} size="small" />
              <Chip label="Offline-first" size="small" variant="outlined" color="success" />
            </Box>
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          UniTasker is a fully offline-first productivity platform that combines task management,
          note-taking, calendar events, resource bookmarks, and a Pomodoro timer in one app.
          All your data is stored locally in your browser using IndexedDB — nothing is ever sent to a server.
        </Typography>

        <Alert severity="info" icon={false} sx={{ mt: 2, bgcolor: 'action.hover' }}>
          <Typography variant="caption">
            <strong>Data privacy:</strong> everything stays on your device. Use Export to
            back up your data, and Import to move it to another browser or computer.
          </Typography>
        </Alert>
      </Paper>

      {/* Dialogs */}
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        stats={stats}
        onExport={handleExport}
      />

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      <ClearDataDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClearData}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;