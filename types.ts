export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  reminderAt?: Date | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
