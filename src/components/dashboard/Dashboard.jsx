import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Skeleton,
  Alert,
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
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useDashboardData } from '../../hooks/useDashboardData';
import { createTimerSession, completeTimerSession, interruptTimerSession } from '../../services/timer.service';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const {
    stats,
    todayTasks,
    upcomingTasks,
    recentNotes,
    upcomingEvents,
    loading,
    error,
    refetch,
  } = useDashboardData();

  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerSessionId, setTimerSessionId] = useState(null);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      logTimerSession();
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startTimer = async () => {
    try {
      const session = await createTimerSession(25 * 60);
      setTimerSessionId(session.id);
      setTimerRunning(true);
    } catch (err) {
      console.error('Failed to start timer session:', err);
    }
  };

  const logTimerSession = async () => {
    try {
      if (!timerSessionId) return;
      await completeTimerSession(timerSessionId);
    } catch (err) {
      console.error('Failed to complete timer session:', err);
    }
  };

  const pauseTimer = async () => {
    try {
      if (timerSessionId) {
        await interruptTimerSession(timerSessionId);
      }
      setTimerRunning(false);
    } catch (err) {
      console.error('Failed to pause timer:', err);
    }
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(25 * 60);
    setTimerSessionId(null);
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

  const handleNavigateToTasks = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 1 }));
  };

  const handleNavigateToNotes = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 2 }));
  };

  const handleNavigateToResources = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 4 }));
  };

  const handleNavigateToTimer = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 5 }));
  };

  const handleNavigateToCalendar = () => {
    window.dispatchEvent(new CustomEvent('navigationChange', { detail: 3 }));
  };

  // Stat Card Component
  const StatCard = ({ icon, title, value, onClick }) => (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        flex: 1,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ 
        p: 2,
        '&:last-child': { pb: 2 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box>
          {loading ? (
            <Skeleton variant="text" width={40} height={40} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.1, fontSize: '2rem' }}>
              {value}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
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

  // Task List Renderer
  const renderTaskList = (tasks, emptyMessage, maxItems = 6) => {
    if (loading) {
      return (
        <Box sx={{ py: 1 }}>
          <Skeleton variant="text" height={28} />
          <Skeleton variant="text" height={28} />
          <Skeleton variant="text" height={28} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
          Failed to load data
        </Alert>
      );
    }

    if (tasks.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, fontSize: '0.8rem' }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <List dense sx={{ 
        py: 0, 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '3px' },
        '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
      }}>
        {tasks.slice(0, maxItems).map((task, index) => (
          <React.Fragment key={task.id}>
            {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.8rem',
                      textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontWeight: 500,
                    }}
                  >
                    {task.title}
                    {task.priority && task.priority !== 'Medium' && (
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                        sx={{ height: 16, '& .MuiChip-label': { fontSize: '0.5rem', px: 0.5, fontWeight: 600 } }}
                      />
                    )}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                    {formatDate(task.dueDate)}
                  </Typography>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  // Note List Renderer
  const renderNoteList = (notes, emptyMessage, maxItems = 4) => {
    if (loading) {
      return (
        <Box sx={{ py: 1 }}>
          <Skeleton variant="text" height={28} />
          <Skeleton variant="text" height={28} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
          Failed to load data
        </Alert>
      );
    }

    if (notes.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, fontSize: '0.8rem' }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <List dense sx={{ 
        py: 0, 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '3px' },
        '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
      }}>
        {notes.slice(0, maxItems).map((note, index) => (
          <React.Fragment key={note.id}>
            {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }} noWrap>
                    {note.title || 'Untitled note'}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                    {note.content ? note.content.substring(0, 35) : 'Empty note'}
                    {note.content && note.content.length > 35 ? '...' : ''}
                  </Typography>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  // Event List Renderer
  const renderEventList = (events, emptyMessage, maxItems = 3) => {
    if (loading) {
      return (
        <Box sx={{ py: 1 }}>
          <Skeleton variant="text" height={28} />
          <Skeleton variant="text" height={28} />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem' }}>
          Failed to load data
        </Alert>
      );
    }

    if (events.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, fontSize: '0.8rem' }}>
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <List dense sx={{ 
        py: 0, 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '3px' },
        '&::-webkit-scrollbar-thumb': { background: theme.palette.divider, borderRadius: '2px' },
      }}>
        {events.slice(0, maxItems).map((event, index) => (
          <React.Fragment key={event.id}>
            {index > 0 && <Divider sx={{ opacity: 0.5 }} />}
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {event.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                    {formatEventDate(event.date)}
                  </Typography>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  // Determine column layout based on screen size
  const isTwoColumn = !isMobile && !isTablet;

  return (
    <Box sx={{ 
      height: 'calc(100vh - 140px)', 
      display: 'flex', 
      flexDirection: 'column',
      gap: 1.5,
      overflow: 'hidden',
    }}>
      {/* Row 1: Stats Cards - 4 equal columns */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1.5,
        flexShrink: 0,
      }}>
        <StatCard
          icon={<TaskIcon sx={{ fontSize: 20 }} />}
          title="Open tasks"
          value={stats.openTasks}
          onClick={handleNavigateToTasks}
        />
        <StatCard
          icon={<WarningIcon sx={{ fontSize: 20 }} />}
          title="Due today"
          value={stats.dueToday}
          onClick={handleNavigateToTasks}
        />
        <StatCard
          icon={<NoteIcon sx={{ fontSize: 20 }} />}
          title="Notes"
          value={stats.notesCount}
          onClick={handleNavigateToNotes}
        />
        <StatCard
          icon={<EventIcon sx={{ fontSize: 20 }} />}
          title="Events"
          value={stats.eventsCount}
          onClick={handleNavigateToCalendar}
        />
      </Box>

      {/* Row 2: Quick Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1.5,
        flexShrink: 0,
        alignItems: 'center',
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 20 }} />}
          onClick={handleNavigateToTasks}
          sx={{ 
            flex: 1.2, 
            py: 0.75, 
            fontSize: '0.8rem', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
          size="small"
        >
          New task
        </Button>
        <Button
          variant="outlined"
          startIcon={<NoteIcon sx={{ fontSize: 18 }} />}
          onClick={handleNavigateToNotes}
          sx={{ 
            flex: 1, 
            py: 0.75, 
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
          size="small"
        >
          Notes
        </Button>
        <Button
          variant="outlined"
          startIcon={<FolderIcon sx={{ fontSize: 18 }} />}
          onClick={handleNavigateToResources}
          sx={{ 
            flex: 1, 
            py: 0.75, 
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
          size="small"
        >
          Resources
        </Button>
        <Button
          variant="outlined"
          startIcon={<TimerIcon sx={{ fontSize: 18 }} />}
          onClick={timerRunning ? pauseTimer : startTimer}
          sx={{ 
            flex: 1, 
            py: 0.75, 
            fontSize: '0.75rem', 
            fontWeight: timerRunning ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
          size="small"
        >
          {timerRunning ? formatTime(timeLeft) : 'Start 25:00'}
        </Button>
      </Box>

      {/* Row 3: Main Content Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: isTwoColumn ? '1fr 0.8fr' : '1fr',
        gap: 1.5,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Left/Main Column */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          minHeight: 0,
          overflow: 'hidden',
        }}>
          {/* Row: Today's Tasks + Upcoming Deadlines side by side */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 1.5,
            flex: 1,
            minHeight: 0,
          }}>
            {/* Today's Tasks */}
            <Paper sx={{ 
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              minHeight: 0,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, mb: 0.5 }}>
                Today's Tasks
              </Typography>
              <Box sx={{ 
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {renderTaskList(todayTasks, 'Nothing due today. Enjoy the calm.', 5)}
              </Box>
              {todayTasks.length > 0 && (
                <Button size="small" onClick={handleNavigateToTasks} sx={{ fontSize: '0.65rem', flexShrink: 0, mt: 0.5, alignSelf: 'flex-start' }}>
                  View all →
                </Button>
              )}
            </Paper>

            {/* Upcoming Deadlines */}
            <Paper sx={{ 
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              minHeight: 0,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, mb: 0.5 }}>
                Upcoming Deadlines
              </Typography>
              <Box sx={{ 
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {renderTaskList(upcomingTasks, 'No upcoming deadlines.', 5)}
              </Box>
              {upcomingTasks.length > 0 && (
                <Button size="small" onClick={handleNavigateToTasks} sx={{ fontSize: '0.65rem', flexShrink: 0, mt: 0.5, alignSelf: 'flex-start' }}>
                  View all →
                </Button>
              )}
            </Paper>
          </Box>

          {/* Row: Recent Notes + Next Events side by side */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 1.5,
            flex: 1,
            minHeight: 0,
          }}>
            {/* Recent Notes */}
            <Paper sx={{ 
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              minHeight: 0,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, mb: 0.5 }}>
                Recent Notes
              </Typography>
              <Box sx={{ 
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {renderNoteList(recentNotes, 'No notes yet.', 4)}
              </Box>
              {recentNotes.length > 0 && (
                <Button size="small" onClick={handleNavigateToNotes} sx={{ fontSize: '0.65rem', flexShrink: 0, mt: 0.5, alignSelf: 'flex-start' }}>
                  View all →
                </Button>
              )}
            </Paper>

            {/* Next Events */}
            <Paper sx={{ 
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              minHeight: 0,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, mb: 0.5 }}>
                Next Events
              </Typography>
              <Box sx={{ 
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {renderEventList(upcomingEvents, 'Calendar is clear.', 3)}
              </Box>
              {upcomingEvents.length > 0 && (
                <Button size="small" onClick={handleNavigateToCalendar} sx={{ fontSize: '0.65rem', flexShrink: 0, mt: 0.5, alignSelf: 'flex-start' }}>
                  View all →
                </Button>
              )}
            </Paper>
          </Box>
        </Box>

        {/* Right Column: Focus Timer (only on desktop/tablet) */}
        {isTwoColumn && (
          <Paper sx={{ 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            minHeight: 0,
            gap: 1,
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', alignSelf: 'flex-start' }}>
              Focus Timer
            </Typography>
            <Typography variant="h2" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '3.5rem', lineHeight: 1 }}>
              {formatTime(timeLeft)}
            </Typography>
            <Button
              variant="contained"
              size="medium"
              startIcon={timerRunning ? <ScheduleIcon /> : <PlayArrowIcon />}
              onClick={timerRunning ? pauseTimer : startTimer}
              sx={{ mt: 0.5, px: 3, fontSize: '0.8rem' }}
            >
              {timerRunning ? 'Pause' : 'Start focus'}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={handleNavigateToTimer}
              sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
            >
              Open full timer →
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;