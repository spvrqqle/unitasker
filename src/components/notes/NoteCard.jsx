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
      year: 'numeric',
    });
  };

  const getPreview = (content, maxLength = 150) => {
    if (!content) return 'No content';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card
      onClick={() => onEdit(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(note);
        }
      }}
      aria-label={`Edit note ${note.title || 'Untitled'}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows[3],
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              flex: 1,
              mr: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {note.title || 'Untitled'}
          </Typography>

          <Box sx={{ display: 'flex', flexShrink: 0 }}>
            <Tooltip title="Edit note" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                aria-label={`Edit note ${note.title || 'Untitled'}`}
                sx={{ '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete note" arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                aria-label={`Delete note ${note.title || 'Untitled'}`}
                color="error"
                sx={{ '&:focus-visible': { outline: `2px solid ${theme.palette.error.main}`, outlineOffset: 2 } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography
          variant="body2"
          component="div"
          color="text.secondary"
          sx={{
            mt: 1,
            fontSize: '0.8rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            flex: 1,
          }}
        >
          {getPreview(note.content)}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 1 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
            {note.tags && note.tags.length > 0 ? (
              note.tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  icon={<LabelIcon sx={{ fontSize: 12 }} />}
                  sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.65rem', px: 0.75 } }}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                No tags
              </Typography>
            )}
            {note.tags && note.tags.length > 2 && (
              <Chip
                label={`+${note.tags.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.65rem', px: 0.75 } }}
              />
            )}
          </Stack>

          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
            {formatDate(note.updatedAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NoteCard;