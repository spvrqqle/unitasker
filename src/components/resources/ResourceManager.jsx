import React, { useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import ResourceCard from './ResourceCard';
import ResourceTableRow from './ResourceTableRow';
import { useResources } from '../../hooks/useResources';

const ResourceManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef(null);

  const {
    resources,
    loading,
    error,
    openingId,
    fileSystemSupported,
    addResourceWithPicker,
    addResourceWithFile,
    openResource,
    removeResource,
    refreshResources,
    setError,
  } = useResources();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, resource: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [uploading, setUploading] = useState(false);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredResources = useMemo(() => {
    let result = [...resources];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(search) ||
        (r.type && r.type.toLowerCase().includes(search))
      );
    }

    result.sort((a, b) => {
      let cmpA = a[sortBy];
      let cmpB = b[sortBy];

      if (sortBy === 'uploadedAt' || sortBy === 'lastAccessed') {
        cmpA = cmpA ? new Date(cmpA).getTime() : 0;
        cmpB = cmpB ? new Date(cmpB).getTime() : 0;
      } else if (sortBy === 'size') {
        cmpA = cmpA || 0;
        cmpB = cmpB || 0;
      } else {
        cmpA = String(cmpA || '').toLowerCase();
        cmpB = String(cmpB || '').toLowerCase();
      }

      if (cmpA < cmpB) return sortDirection === 'asc' ? -1 : 1;
      if (cmpA > cmpB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [resources, searchTerm, sortBy, sortDirection]);

  const handleAddResource = async () => {
    if (fileSystemSupported) {
      try {
        setUploading(true);
        const result = await addResourceWithPicker();
        if (result) {
          showSnackbar(`"${result.name}" added successfully`, 'success');
        }
      } catch (err) {
        showSnackbar(err.message || 'Failed to add resource', 'error');
      } finally {
        setUploading(false);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await addResourceWithFile(file);
      showSnackbar(`"${result.name}" added successfully`, 'success');
    } catch (err) {
      showSnackbar(err.message || 'Failed to add resource', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOpen = async (resource) => {
    try {
      await openResource(resource);
      showSnackbar(`Opening "${resource.name}"...`, 'info');
    } catch (err) {
      showSnackbar(err.message || 'Failed to open file', 'error');
    }
  };

  const handleDeleteClick = (resource) => {
    setDeleteDialog({ open: true, resource });
  };

  const handleDeleteConfirm = async () => {
    const resource = deleteDialog.resource;
    if (!resource) return;

    try {
      await removeResource(resource.id);
      showSnackbar(`"${resource.name}" removed`, 'success');
    } catch (err) {
      showSnackbar(err.message || 'Failed to remove resource', 'error');
    } finally {
      setDeleteDialog({ open: false, resource: null });
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 140px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Resources
            <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 400, fontSize: '0.9rem' }}>
              ({filteredResources.length})
            </Typography>
          </Typography>
          <IconButton size="small" onClick={refreshResources} title="Refresh">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, val) => val && setViewMode(val)}
            size="small"
          >
            <ToggleButton value="grid" sx={{ px: 1, py: 0.5 }}>
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="table" sx={{ px: 1, py: 0.5 }}>
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            onClick={handleAddResource}
            disabled={uploading}
            size="small"
          >
            Add File
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileInputChange}
          />
        </Box>
      </Box>

      {/* Info banner */}
      {!fileSystemSupported && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ flexShrink: 0, py: 0.5 }}
        >
          Your browser doesn't support the File System Access API. Files added will only store metadata — you'll need to re-select the file to open it.
        </Alert>
      )}

      {/* Search */}
      <TextField
        placeholder="Search resources by name or type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        fullWidth
        sx={{ flexShrink: 0 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Error */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ flexShrink: 0 }}>
          {error}
        </Alert>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredResources.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No matching resources' : 'No resources yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm 
                ? 'Try a different search term.'
                : 'Add file references to quickly access your files without uploading them.'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddResource}
                disabled={uploading}
              >
                Add Your First File
              </Button>
            )}
          </Paper>
        ) : viewMode === 'grid' ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
            width: '100%',
          }}>
            {filteredResources.map((resource) => (
              <Box key={resource.id} sx={{ width: '100%', minWidth: 0 }}>
                <ResourceCard
                  resource={resource}
                  onOpen={handleOpen}
                  onDelete={handleDeleteClick}
                  isOpening={openingId === resource.id}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortDirection : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'type'}
                      direction={sortBy === 'type' ? sortDirection : 'asc'}
                      onClick={() => handleSort('type')}
                    >
                      Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'size'}
                      direction={sortBy === 'size' ? sortDirection : 'asc'}
                      onClick={() => handleSort('size')}
                    >
                      Size
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'uploadedAt'}
                      direction={sortBy === 'uploadedAt' ? sortDirection : 'asc'}
                      onClick={() => handleSort('uploadedAt')}
                    >
                      Added
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'lastAccessed'}
                      direction={sortBy === 'lastAccessed' ? sortDirection : 'asc'}
                      onClick={() => handleSort('lastAccessed')}
                    >
                      Last Opened
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResources.map((resource) => (
                  <ResourceTableRow
                    key={resource.id}
                    resource={resource}
                    onOpen={handleOpen}
                    onDelete={handleDeleteClick}
                    isOpening={openingId === resource.id}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, resource: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove Resource?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove the reference to <strong>{deleteDialog.resource?.name}</strong>? 
            The actual file on your disk will not be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, resource: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default ResourceManager;