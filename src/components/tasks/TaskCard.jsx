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
  NotificationsActive as ReminderIcon,
} from '@mui/icons-material';

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const theme = useTheme();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return <PriorityHighIcon fontSize="small" />;
      case 'Medium':
        return <PriorityHighIcon fontSize="small" />;
      case 'Low':
        return <LowPriorityIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'To Do': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = () => {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < new Date();
  };

  const isCompleted = task.status === 'Completed';
  const overdue = isOverdue();

  return (
    <Card
      sx={{
        mb: 1.5,
        opacity: isCompleted ? 0.75 : 1,
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: overdue ? `4px solid ${theme.palette.error.main}` : undefined,
        borderRadius: 2,
        '&:hover': {
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {/* Checkbox */}
          <Checkbox
            checked={isCompleted}
            onChange={() => onToggleComplete(task.id)}
            inputProps={{ 'aria-label': `Mark "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}` }}
            size="small"
            sx={{ mt: -0.5, ml: -0.5 }}
          />

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: isCompleted ? 'line-through' : 'none',
                color: isCompleted ? 'text.secondary' : 'text.primary',
                wordBreak: 'break-word',
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
                  fontSize: '0.8rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {task.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.25 }}>
              {/* Priority chip */}
              <Chip
                icon={getPriorityIcon(task.priority)}
                label={task.priority}
                size="small"
                color={getPriorityColor(task.priority)}
                variant="outlined"
                sx={{ height: 22, '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
              />

              {/* Status chip */}
              <Chip
                label={task.status}
                size="small"
                color={getStatusColor(task.status)}
                sx={{ height: 22, '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
              />

              {/* Due date chip */}
              <Chip
                label={formatDate(task.dueDate)}
                size="small"
                variant="outlined"
                color={overdue ? 'error' : 'default'}
                sx={{
                  height: 22,
                  '& .MuiChip-label': { fontSize: '0.7rem', px: 1 },
                  ...(overdue && {
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                  }),
                }}
              />

              {/* Reminder chip */}
              {task.reminder && (
                <Chip
                  icon={<ReminderIcon sx={{ fontSize: 14 }} />}
                  label="Reminder"
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ height: 22, '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
                />
              )}
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexShrink: 0 }}>
            <Tooltip title="Edit task" arrow>
              <IconButton
                size="small"
                onClick={() => onEdit(task)}
                aria-label={`Edit task ${task.title}`}
                sx={{ '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete task" arrow>
              <IconButton
                size="small"
                onClick={() => onDelete(task.id)}
                aria-label={`Delete task ${task.title}`}
                color="error"
                sx={{ '&:focus-visible': { outline: `2px solid ${theme.palette.error.main}`, outlineOffset: 2 } }}
              >
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