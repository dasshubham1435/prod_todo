import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  LogOut, 
  Moon, 
  Sun, 
  Search, 
  Filter, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  Trash
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signIn, signOut } from './lib/firebase';
import { taskService } from './services/taskService';
import { Task, Priority } from './types';
import { TaskForm } from './components/TaskForm';
import { CalendarView } from './components/CalendarView';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = taskService.subscribeTasks(user.uid, (newTasks) => {
        setTasks(newTasks);
      });
      return () => unsubscribe();
    } else {
      setTasks([]);
    }
  }, [user]);

  useEffect(() => {
    let result = tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    if (activeTab === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (activeTab === 'completed') {
      result = result.filter(t => t.completed);
    }

    setFilteredTasks(result);
  }, [tasks, searchQuery, filterPriority, activeTab]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    if (editingTask?.id) {
      await taskService.updateTask(editingTask.id, taskData);
    } else {
      await taskService.addTask({ ...taskData, userId: user.uid });
    }
    setEditingTask(undefined);
  };

  const handleToggleComplete = async (task: Task) => {
    if (task.id) {
      await taskService.updateTask(task.id, { completed: !task.completed });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await taskService.deleteTask(id);
    }
  };

  const priorityConfig = {
    low: {
      border: 'border-slate-500',
      bg: 'bg-slate-500/10',
      label: 'bg-slate-700 text-slate-400',
      text: 'text-slate-400'
    },
    medium: {
      border: 'border-indigo-500',
      bg: 'bg-indigo-500/10',
      label: 'bg-indigo-500/20 text-indigo-400',
      text: 'text-indigo-400'
    },
    high: {
      border: 'border-rose-500',
      bg: 'bg-rose-500/20',
      label: 'bg-rose-500/20 text-rose-400',
      text: 'text-rose-400'
    },
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center mx-auto mb-6 font-bold text-xl">
            P
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white tracking-tight">PriorityTask</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">High-density task management with cloud sync, calendar views, and dark mode.</p>
          <button 
            onClick={signIn}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-900 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">P</div>
            <h1 className="text-lg font-semibold tracking-tight">PriorityTask</h1>
          </div>
          
          <nav className="space-y-1">
            {(['all', 'pending', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center justify-between p-2 rounded-md transition-all group ${
                  activeTab === tab ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs">{tab === 'all' ? '📥' : tab === 'pending' ? '📅' : '✅'}</span>
                  <span className="text-sm font-medium capitalize">{tab}</span>
                </div>
                <span className="text-[10px] font-mono opacity-60">
                  {tab === 'all' ? tasks.length : tab === 'pending' ? tasks.filter(t=>!t.completed).length : tasks.filter(t=>t.completed).length}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-10">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-2 mb-3">Priorities</h3>
            <div className="space-y-1">
              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(filterPriority === p ? 'all' : p)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-all ${
                    filterPriority === p ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${p === 'high' ? 'bg-rose-500' : p === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <span className="capitalize">{p} Priority</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-700/50 space-y-4">
          <div className="flex items-center gap-3 opacity-60">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-[10px] font-mono uppercase tracking-tighter">Sync: Active</span>
          </div>
          <div className="flex items-center justify-between bg-slate-900 p-1 rounded-full border border-slate-700/50">
            <button 
              onClick={() => { if(!isDarkMode) toggleDarkMode(); }}
              className={`flex-1 py-1 text-[9px] font-bold uppercase rounded-full transition-all ${isDarkMode ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Dark
            </button>
            <button 
              onClick={() => { if(isDarkMode) toggleDarkMode(); }}
              className={`flex-1 py-1 text-[9px] font-bold uppercase rounded-full transition-all ${!isDarkMode ? 'bg-slate-700 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Light
            </button>
          </div>
          <div className="flex items-center justify-between pt-2">
            <img src={user.photoURL || ''} className="w-7 h-7 rounded-full border border-slate-700" alt="" />
            <button onClick={signOut} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-700/50 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search tasks, descriptions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </header>

        {/* Task List Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
            <section className="xl:col-span-8 flex flex-col">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Today's Schedule</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')} • <span className="text-indigo-400 font-medium">{filteredTasks.filter(t=>!t.completed).length} Tasks Left</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-md border border-slate-700/50">
                    <Filter className="w-3 h-3 text-slate-500 ml-1" />
                    <select 
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as any)}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer pr-4"
                    >
                      <option value="all">Priority: All</option>
                      <option value="high">High Only</option>
                      <option value="medium">Medium Only</option>
                      <option value="low">Low Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Task Feed */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => {
                      const cfg = priorityConfig[task.priority];
                      return (
                        <motion.div
                          layout
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className={`group bg-slate-800/40 border-l-4 ${cfg.border} p-4 rounded-r-lg flex items-center gap-4 transition-all hover:bg-slate-800/60 ${task.completed ? 'opacity-40 grayscale-[0.5]' : ''}`}
                        >
                          <button 
                            onClick={() => handleToggleComplete(task)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                : `border-slate-600 hover:${cfg.border} text-transparent`
                            }`}
                          >
                            <span className="text-[10px] font-bold">✓</span>
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                {task.title}
                              </h4>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${cfg.label}`}>
                                {task.priority}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                              {task.dueDate && (
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> {format(task.dueDate, 'h:mm a')}
                                </span>
                              )}
                              {task.reminderAt && (
                                <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                                  <span className="text-xs">🔔</span> Reminder Set
                                </span>
                              )}
                              {task.description && (
                                <span className="flex items-center gap-1.5 italic truncate max-w-[200px]">
                                  <span className="opacity-30">•</span> {task.description}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingTask(task); setIsFormOpen(true); }}
                              className="p-1.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => task.id && handleDeleteTask(task.id)}
                              className="p-1.5 hover:bg-rose-900/20 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center bg-slate-800/20 rounded-xl border border-dashed border-slate-700/50">
                      <p className="text-slate-500 text-xs font-mono uppercase tracking-widest italic">No tasks active in this view</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Sidebar Widgets */}
            <aside className="xl:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                <CalendarView tasks={tasks} />
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-xl space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Productivity Snapshot</h3>
                
                <div>
                  <div className="flex justify-between text-[11px] mb-2 font-mono">
                    <span className="text-slate-500">Completion</span>
                    <span className="text-indigo-400 font-bold">
                      {tasks.length > 0 ? Math.round((tasks.filter(t=>t.completed).length / tasks.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${tasks.length > 0 ? (tasks.filter(t=>t.completed).length / tasks.length) * 100 : 0}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/30">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Active</p>
                    <p className="text-2xl font-mono font-bold mt-1 tracking-tighter text-white">
                      {tasks.filter(t=>!t.completed).length}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/30">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Streak</p>
                    <p className="text-2xl font-mono font-bold mt-1 tracking-tighter text-white">
                      {tasks.filter(t=>t.completed).length}<span className="text-[10px] ml-1 font-normal opacity-40 uppercase">Done</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/30">
                  <h4 className="text-[9px] text-slate-500 uppercase font-bold mb-3 tracking-widest">Focus Advice</h4>
                  <div className="text-[11px] text-slate-400 italic leading-relaxed font-medium">
                    "The secret of getting ahead is getting started."
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <TaskForm 
            onClose={() => { setIsFormOpen(false); setEditingTask(undefined); }}
            onSave={handleSaveTask}
            initialTask={editingTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
