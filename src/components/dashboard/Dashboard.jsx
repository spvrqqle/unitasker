import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  Skeleton,
  Alert,
  Tooltip,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Task as TaskIcon,
  Note as NoteIcon,
  Event as EventIcon,
  Folder as FolderIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useTimer } from '../../context/TimerContext';
import { MODE_META } from '../../hooks/usePomodoro';
import { usePomodoroSettings } from '../../hooks/usePomodoroSettings';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    stats,
    todayTasks,
    upcomingTasks,
    recentNotes,
    upcomingEvents,
    loading,
    error,
  } = useDashboardData();

  const {
    mode,
    timeLeft,
    isRunning,
    start,
    pause,
  } = useTimer();

  const { settings } = usePomodoroSettings();
  const activeMeta = MODE_META[mode];

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate.getTime() === today.getTime()) return 'Today';
    if (dueDate.getTime() < today.getTime()) return 'Overdue';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const navigate = (tab) => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: tab }));
  };

  const handleNavigateToTasks = () => navigate(1);
  const handleNavigateToNotes = () => navigate(2);
  const handleNavigateToCalendar = () => navigate(3);
  const handleNavigateToResources = () => navigate(4);
  const handleNavigateToTimer = () => navigate(5);

  const handleTimerToggle = () => {
    if (isRunning) {
      pause();
      showSnackbar('Focus timer paused', 'info');
    } else {
      start();
      showSnackbar('Focus timer started', 'success');
    }
  };

  // ---------- Card shell ----------
  const SectionCard = ({ title, children, onViewAll, footerLabel }) => (
    <Paper
      sx={{
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        minHeight: 0,
        height: '100%',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          fontSize: '0.85rem',
          flexShrink: 0,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
      {onViewAll && (
        <Button
          size="small"
          onClick={onViewAll}
          sx={{
            fontSize: '0.7rem',
            flexShrink: 0,
            mt: 0.5,
            alignSelf: 'flex-start',
            p: 0.5,
            minWidth: 0,
            textTransform: 'none',
            '&:hover': { bgcolor: 'action.hover' },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
              borderRadius: 1,
            },
          }}
        >
          {footerLabel || 'View all →'}
        </Button>
      )}
    </Paper>
  );

  // ---------- Compact empty state ----------
  const EmptyState = ({ icon, primary, hint }) => (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        py: 1,
        px: 1,
        textAlign: 'center',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {icon && (
        <Box sx={{ color: 'text.disabled', '& svg': { fontSize: 22 } }}>
          {icon}
        </Box>
      )}
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.75rem',
          color: 'text.secondary',
          fontWeight: 500,
          lineHeight: 1.2,
        }}
      >
        {primary}
      </Typography>
      {hint && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            color: 'text.disabled',
            lineHeight: 1.2,
          }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );

  const LoadingSkeleton = ({ rows = 3 }) => (
    <Box sx={{ py: 0.5 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="text" height={20} sx={{ fontSize: '0.75rem' }} />
      ))}
    </Box>
  );

  // ---------- Stat card ----------
  const StatCard = ({ icon, title, value, onClick }) => (
    <Card
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={onClick ? `Go to ${title}` : undefined}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        flex: 1,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': onClick ? {
          boxShadow: theme.shadows[3],
        } : {},
        '&:focus-visible': onClick ? {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        } : {},
      }}
    >
      <CardContent sx={{
        p: 1.5,
        '&:last-child': { pb: 1.5 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box>
          {loading ? (
            <Skeleton variant="text" width={40} height={36} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1, fontSize: '1.75rem' }}>
              {value}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 0.75,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );

  // ---------- List renderers ----------

  const renderTaskList = (tasks, emptyContent, maxItems = 5) => {
    if (loading) return <LoadingSkeleton rows={3} />;
    if (error) return <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>Failed to load</Alert>;
    if (!tasks || tasks.length === 0) return emptyContent;
    return (
      <List
        dense
        disablePadding
        sx={{
          py: 0,
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '2px',
          },
        }}
      >
        {tasks.slice(0, maxItems).map((task, index) => (
          <React.Fragment key={task.id}>
            {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
            <ListItemButton
              onClick={handleNavigateToTasks}
              aria-label={`Open task ${task.title}`}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                transition: 'background-color 0.15s ease',
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: -2,
                },
              }}
            >
              <ListItemText
                disableTypography
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {task.title}
                    </Box>
                    {task.priority && task.priority !== 'Medium' && (
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                        sx={{ height: 16, '& .MuiChip-label': { fontSize: '0.5rem', px: 0.5, fontWeight: 600 } }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box component="span" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                    {formatDate(task.dueDate)}
                  </Box>
                }
              />
            </ListItemButton>
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderNoteList = (notes, emptyContent, maxItems = 4) => {
    if (loading) return <LoadingSkeleton rows={3} />;
    if (error) return <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>Failed to load</Alert>;
    if (!notes || notes.length === 0) return emptyContent;
    return (
      <List
        dense
        disablePadding
        sx={{
          py: 0,
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '2px',
          },
        }}
      >
        {notes.slice(0, maxItems).map((note, index) => (
          <React.Fragment key={note.id}>
            {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
            <ListItemButton
              onClick={handleNavigateToNotes}
              aria-label={`Open note ${note.title || 'Untitled'}`}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: -2,
                },
              }}
            >
              <ListItemText
                disableTypography
                primary={
                  <Box
                    component="div"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {note.title || 'Untitled note'}
                  </Box>
                }
                secondary={
                  <Box
                    component="div"
                    sx={{
                      fontSize: '0.6rem',
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {note.content ? note.content.substring(0, 35) : 'Empty note'}
                    {note.content && note.content.length > 35 ? '...' : ''}
                  </Box>
                }
              />
            </ListItemButton>
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderEventList = (events, emptyContent, maxItems = 3) => {
    if (loading) return <LoadingSkeleton rows={2} />;
    if (error) return <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>Failed to load</Alert>;
    if (!events || events.length === 0) return emptyContent;
    return (
      <List
        dense
        disablePadding
        sx={{
          py: 0,
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '2px',
          },
        }}
      >
        {events.slice(0, maxItems).map((event, index) => (
          <React.Fragment key={event.id}>
            {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
            <ListItemButton
              onClick={handleNavigateToCalendar}
              aria-label={`Open event ${event.title}`}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: -2,
                },
              }}
            >
              <ListItemText
                disableTypography
                primary={
                  <Box
                    component="div"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {event.title}
                  </Box>
                }
                secondary={
                  <Box
                    component="div"
                    sx={{ fontSize: '0.6rem', color: 'text.secondary' }}
                  >
                    {formatEventDate(event.date)}
                  </Box>
                }
              />
            </ListItemButton>
          </React.Fragment>
        ))}
      </List>
    );
  };

  const isTwoColumn = !isMobile;

  return (
    <Box sx={{
      height: 'calc(100vh - 140px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      overflow: 'hidden',
      pt: 0.5,
    }}>
      {/* Row 1: Stat cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 1.5,
        flexShrink: 0,
        py: 0.5,
      }}>
        <StatCard
          icon={<TaskIcon sx={{ fontSize: 18 }} />}
          title="Open tasks"
          value={stats.openTasks}
          onClick={handleNavigateToTasks}
        />
        <StatCard
          icon={<WarningIcon sx={{ fontSize: 18 }} />}
          title="Due today"
          value={stats.dueToday}
          onClick={handleNavigateToTasks}
        />
        <StatCard
          icon={<NoteIcon sx={{ fontSize: 18 }} />}
          title="Notes"
          value={stats.notesCount}
          onClick={handleNavigateToNotes}
        />
        <StatCard
          icon={<EventIcon sx={{ fontSize: 18 }} />}
          title="Events"
          value={stats.eventsCount}
          onClick={handleNavigateToCalendar}
        />
      </Box>

      {/* Row 2: Quick actions */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 1,
        flexShrink: 0,
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={handleNavigateToTasks}
          size="small"
          aria-label="Create new task"
          sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600, minWidth: 0, whiteSpace: 'nowrap' }}
        >
          New task
        </Button>
        <Button
          variant="outlined"
          startIcon={<NoteIcon sx={{ fontSize: 16 }} />}
          onClick={handleNavigateToNotes}
          size="small"
          aria-label="Go to Notes"
          sx={{ py: 0.75, fontSize: '0.75rem', minWidth: 0, whiteSpace: 'nowrap' }}
        >
          Notes
        </Button>
        <Button
          variant="outlined"
          startIcon={<FolderIcon sx={{ fontSize: 16 }} />}
          onClick={handleNavigateToResources}
          size="small"
          aria-label="Go to Resources"
          sx={{ py: 0.75, fontSize: '0.75rem', minWidth: 0, whiteSpace: 'nowrap' }}
        >
          Resources
        </Button>
        <Tooltip title={isRunning ? 'Pause focus timer' : 'Start focus timer'} arrow>
          <Button
            variant="outlined"
            startIcon={isRunning ? <PauseIcon sx={{ fontSize: 16 }} /> : <TimerIcon sx={{ fontSize: 16 }} />}
            onClick={handleTimerToggle}
            size="small"
            aria-label={isRunning ? 'Pause focus timer' : 'Start focus timer'}
            sx={{
              py: 0.75,
              fontSize: '0.75rem',
              fontWeight: isRunning ? 600 : 400,
              minWidth: 0,
              whiteSpace: 'nowrap',
              ...(isRunning && {
                borderColor: activeMeta.color,
                color: activeMeta.color,
                '&:hover': {
                  borderColor: activeMeta.color,
                  bgcolor: `${activeMeta.color}10`,
                },
              }),
            }}
          >
            {isRunning ? formatTime(timeLeft) : `Start ${settings.focusMinutes}:00`}
          </Button>
        </Tooltip>
      </Box>

      {/* Row 3: Main content */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: isTwoColumn ? '1fr 0.8fr' : '1fr',
        gap: 1.5,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minHeight: 0,
          overflow: 'hidden',
        }}>
          {/* Today + Upcoming */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 1.5,
            flex: 1,
            minHeight: 0,
          }}>
            <SectionCard
              title="Today's Tasks"
              onViewAll={todayTasks.length > 0 ? handleNavigateToTasks : undefined}
              footerLabel="View tasks →"
            >
              {renderTaskList(
                todayTasks,
                <EmptyState
                  icon={<CheckCircleIcon />}
                  primary="Nothing due today"
                  hint="Enjoy the calm."
                />
              )}
            </SectionCard>

            <SectionCard
              title="Upcoming Deadlines"
              onViewAll={upcomingTasks.length > 0 ? handleNavigateToTasks : undefined}
              footerLabel="View tasks →"
            >
              {renderTaskList(
                upcomingTasks,
                <EmptyState
                  icon={<ScheduleIcon />}
                  primary="No upcoming deadlines"
                  hint="You're ahead of schedule."
                />
              )}
            </SectionCard>
          </Box>

          {/* Recent Notes + Next Events */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 1.5,
            flex: 1,
            minHeight: 0,
          }}>
            <SectionCard
              title="Recent Notes"
              onViewAll={recentNotes.length > 0 ? handleNavigateToNotes : undefined}
              footerLabel="View notes →"
            >
              {renderNoteList(
                recentNotes,
                <EmptyState
                  icon={<NoteIcon />}
                  primary="No notes yet"
                  hint="Start writing to capture ideas."
                />
              )}
            </SectionCard>

            <SectionCard
              title="Next Events"
              onViewAll={upcomingEvents.length > 0 ? handleNavigateToCalendar : undefined}
              footerLabel="View calendar →"
            >
              {renderEventList(
                upcomingEvents,
                <EmptyState
                  icon={<EventIcon />}
                  primary="Calendar is clear"
                  hint="No upcoming events."
                />
              )}
            </SectionCard>
          </Box>
        </Box>

        {/* Focus Timer widget */}
        {isTwoColumn && (
          <Paper sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            minHeight: 0,
            gap: 1.5,
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', alignSelf: 'flex-start' }}>
              Focus Timer
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontWeight: 700,
                fontSize: '3.5rem',
                lineHeight: 1,
                color: isRunning ? activeMeta.color : 'text.primary',
                transition: 'color 0.3s ease',
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: activeMeta.color,
                mt: -0.5,
              }}
            >
              {activeMeta.label}
            </Typography>
            <Button
              variant="contained"
              size="medium"
              startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={handleTimerToggle}
              aria-label={isRunning ? 'Pause focus timer' : 'Start focus timer'}
              sx={{
                mt: 1,
                px: 3,
                fontSize: '0.8rem',
                bgcolor: activeMeta.color,
                '&:hover': {
                  bgcolor: activeMeta.color,
                  filter: 'brightness(0.9)',
                },
              }}
            >
              {isRunning ? 'Pause' : 'Start focus'}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={handleNavigateToTimer}
              aria-label="Open full timer page"
              sx={{
                fontSize: '0.7rem',
                color: 'text.secondary',
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                  borderRadius: 1,
                },
              }}
            >
              Open full timer →
            </Button>
          </Paper>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
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

export default Dashboard;