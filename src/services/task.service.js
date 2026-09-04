import { 
  getDB, 
  addRecord, 
  getRecord, 
  getAllRecords, 
  updateRecord, 
  deleteRecord 
} from './database';

const STORE_NAME = 'tasks';

// Generate a unique ID
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Create a new task
export async function createTask(taskData) {
  const task = {
    id: generateId(),
    title: taskData.title,
    description: taskData.description || '',
    dueDate: taskData.dueDate || null,
    priority: taskData.priority || 'Medium',
    status: taskData.status || 'To Do',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminder: taskData.reminder || null,
  };
  
  await addRecord(STORE_NAME, task);
  return task;
}

// Get all tasks
export async function getAllTasks() {
  return getAllRecords(STORE_NAME);
}

// Get a single task by ID
export async function getTask(id) {
  return getRecord(STORE_NAME, id);
}

// Update a task
export async function updateTask(id, updates) {
  const task = await getTask(id);
  if (!task) throw new Error(`Task with id ${id} not found`);
  
  const updatedTask = {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await updateRecord(STORE_NAME, updatedTask);
  return updatedTask;
}

// Delete a task
export async function deleteTask(id) {
  await deleteRecord(STORE_NAME, id);
}

// Get tasks by status
export async function getTasksByStatus(status) {
  const db = await getDB();
  const index = db.transaction(STORE_NAME).store.index('by-status');
  return index.getAll(status);
}

// Get tasks by priority
export async function getTasksByPriority(priority) {
  const db = await getDB();
  const index = db.transaction(STORE_NAME).store.index('by-priority');
  return index.getAll(priority);
}

// Get tasks due before a certain date
export async function getTasksDueBefore(date) {
  const allTasks = await getAllTasks();
  return allTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) <= new Date(date)
  );
}

// Get tasks due today
export async function getTasksDueToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const allTasks = await getAllTasks();
  return allTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < tomorrow;
  });
}