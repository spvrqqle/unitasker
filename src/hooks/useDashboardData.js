import { useState, useEffect, useCallback } from 'react';
import { getAllTasks } from '../services/task.service';
import { getAllNotes } from '../services/note.service';
import { getAllRecords } from '../services/database';

const STORE_NAME = 'events';

export const useDashboardData = () => {
  const [stats, setStats] = useState({
    openTasks: 0,
    dueToday: 0,
    notesCount: 0,
    eventsCount: 0,
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch all data from IndexedDB
      const [allTasks, allNotes, allEvents] = await Promise.all([
        getAllTasks(),
        getAllNotes(),
        getAllRecords(STORE_NAME).catch(() => []), // Events store might not exist yet
      ]);

      // Calculate stats
      const openTasks = allTasks.filter(t => t.status !== 'Completed').length;
      const dueToday = allTasks.filter(t => {
        if (!t.dueDate || t.status === 'Completed') return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      }).length;

      // Today's tasks (due today or overdue)
      const todayTasksList = allTasks.filter(t => {
        if (!t.dueDate || t.status === 'Completed') return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() <= today.getTime() || 
               (dueDate.getTime() >= today.getTime() && dueDate.getTime() < tomorrow.getTime());
      }).slice(0, 8);

      // Upcoming tasks (next 5 by soonest due date)
      const upcomingTasksList = allTasks
        .filter(t => {
          if (!t.dueDate || t.status === 'Completed') return false;
          const dueDate = new Date(t.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() > today.getTime();
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      // Recent notes (last 5 by updated_at)
      const recentNotesList = [...allNotes]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);

      // Upcoming events (next 3 by date)
      const upcomingEventsList = allEvents
        .filter(event => {
          if (!event.date) return false;
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() >= today.getTime();
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

      setStats({
        openTasks,
        dueToday,
        notesCount: allNotes.length,
        eventsCount: allEvents.length,
      });
      setTodayTasks(todayTasksList);
      setUpcomingTasks(upcomingTasksList);
      setRecentNotes(recentNotesList);
      setUpcomingEvents(upcomingEventsList);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    todayTasks,
    upcomingTasks,
    recentNotes,
    upcomingEvents,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};