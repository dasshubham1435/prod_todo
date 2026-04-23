import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Task, Priority } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TaskFormProps {
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialTask?: Task;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onClose, onSave, initialTask }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().slice(0, 16) : '');
  const [reminderAt, setReminderAt] = useState(initialTask?.reminderAt ? new Date(initialTask.reminderAt).toISOString().slice(0, 16) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      priority,
      completed: initialTask?.completed || false,
      dueDate: dueDate ? new Date(dueDate) : null,
      reminderAt: reminderAt ? new Date(reminderAt) : null,
    });
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 w-full max-w-md rounded-xl shadow-2xl p-6 relative border border-slate-700"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold mb-6 text-white tracking-tight">{initialTask ? 'Edit Task' : 'Create Task'}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Task Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:border-indigo-500 outline-none transition-colors text-slate-200 placeholder:text-slate-600"
              placeholder="e.g. Weekly sync with team"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Details (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:border-indigo-500 outline-none transition-colors text-slate-200 placeholder:text-slate-600 min-h-[80px]"
              placeholder="Add extra context..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:border-indigo-500 outline-none transition-colors text-slate-200"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Due Date</label>
              <input 
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:border-indigo-500 outline-none transition-colors text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Reminder</label>
            <input 
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:border-indigo-500 outline-none transition-colors text-slate-200"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 transition-all font-semibold text-xs shadow-lg shadow-indigo-600/20"
            >
              {initialTask ? 'Update Task' : 'Start Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
