import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Checkbox,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
} from '@mui/icons-material';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const theme = useTheme();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return <PriorityHighIcon fontSize="small" />;
      case 'Medium':
        return <PriorityHighIcon fontSize="small" color="warning" />;
      case 'Low':
        return <LowPriorityIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'To Do':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = () => {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <Card
      sx={{
        mb: 2,
        opacity: task.status === 'Completed' ? 0.7 : 1,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
        borderLeft: isOverdue() ? `4px solid ${theme.palette.error.main}` : 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {/* Checkbox */}
          <Checkbox
            checked={task.status === 'Completed'}
            onChange={() => onToggleComplete(task.id)}
            sx={{ mt: -1 }}
          />

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                color: task.status === 'Completed' ? 'text.secondary' : 'text.primary',
              }}
            >
              {task.title}
            </Typography>

            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {task.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {/* Priority Chip */}
              <Chip
                icon={getPriorityIcon(task.priority)}
                label={task.priority}
                size="small"
                color={getPriorityColor(task.priority)}
                variant="outlined"
              />

              {/* Status Chip */}
              <Chip
                label={task.status}
                size="small"
                color={getStatusColor(task.status)}
              />

              {/* Due Date Chip */}
              <Chip
                label={formatDate(task.dueDate)}
                size="small"
                variant="outlined"
                color={isOverdue() ? 'error' : 'default'}
                sx={{ 
                  borderColor: isOverdue() ? theme.palette.error.main : undefined,
                  color: isOverdue() ? theme.palette.error.main : undefined,
                }}
              />

              {/* Reminder Chip */}
              {task.reminder && (
                <Chip
                  label="🔔 Reminder"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexShrink: 0 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(task)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(task.id)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard;