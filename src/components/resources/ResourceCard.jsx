import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { getFileIcon, formatFileSize } from '../../services/resource.service';

const ResourceCard = ({ resource, onOpen, onDelete, isOpening }) => {
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const icon = getFileIcon(resource.type);

  return (
    <Card
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'all 0.15s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CardContent sx={{ 
        p: 2, 
        '&:last-child': { pb: 2 },
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}>
        {/* File icon + name */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              fontSize: '2rem',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Tooltip title={resource.name} arrow>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {resource.name}
              </Typography>
            </Tooltip>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              {formatFileSize(resource.size)}
            </Typography>
          </Box>
        </Box>

        {/* Meta */}
        <Box sx={{ mt: 1.5, flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', fontSize: '0.65rem' }}
          >
            Uploaded {formatDate(resource.uploadedAt)}
          </Typography>
          {resource.lastAccessed && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', fontSize: '0.65rem' }}
            >
              Opened {formatDate(resource.lastAccessed)}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 0.5,
          mt: 1,
          pt: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
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
      </CardContent>
    </Card>
  );
};

export default ResourceCard;