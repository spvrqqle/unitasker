import React from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { getFileIcon, formatFileSize } from '../../services/resource.service';

const ResourceTableRow = ({ resource, onOpen, onDelete, isOpening }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const icon = getFileIcon(resource.type);

  return (
    <TableRow
      hover
      sx={{
        '&:last-child td': { border: 0 },
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{icon}</Box>
          <Tooltip title={resource.name} arrow>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '0.85rem',
                maxWidth: 280,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {resource.name}
            </Typography>
          </Tooltip>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {resource.type || 'Unknown'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
          {formatFileSize(resource.size)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {formatDate(resource.uploadedAt)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {formatDate(resource.lastAccessed)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Open file" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => onOpen(resource)}
                disabled={isOpening}
                sx={{ color: 'primary.main' }}
              >
                {isOpening ? (
                  <CircularProgress size={16} />
                ) : (
                  <OpenIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Remove reference" arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(resource)}
              sx={{ color: 'text.secondary' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default ResourceTableRow;