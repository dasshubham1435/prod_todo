import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Task } from '../types';
import { format, isSameDay } from 'date-fns';

interface CalendarViewProps {
  tasks: Task[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date));
      if (dayTasks.length > 0) {
        return (
          <div className="flex gap-0.5 mt-1">
            {dayTasks.slice(0, 3).map((t, i) => (
              <div 
                key={t.id || i}
                className={`h-1 w-1 rounded-full ${
                  t.priority === 'high' ? 'bg-rose-500' : 
                  t.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            ))}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Scheduler</h3>
        <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">{format(new Date(), 'MMMM')}</span>
      </div>
      <Calendar 
        className="calendar-custom"
        tileContent={tileContent}
      />
    </div>
  );
};
