import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Label as LabelIcon,
} from '@mui/icons-material';

const NoteCard = ({ note, onEdit, onDelete }) => {
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Truncate content for preview
  const getPreview = (content, maxLength = 150) => {
    if (!content) return 'No content';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
        cursor: 'pointer',
      }}
      onClick={() => onEdit(note)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              flex: 1,
              mr: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {note.title || 'Untitled'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexShrink: 0 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(note); }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
          }}
        >
          {getPreview(note.content)}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {note.tags && note.tags.length > 0 ? (
              note.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  icon={<LabelIcon sx={{ fontSize: 14 }} />}
                  sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.disabled">
                No tags
              </Typography>
            )}
            {note.tags && note.tags.length > 3 && (
              <Chip
                label={`+${note.tags.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{ height: 24, '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
              />
            )}
          </Stack>
          
          <Typography variant="caption" color="text.disabled">
            {formatDate(note.updatedAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NoteCard;