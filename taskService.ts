import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types';

const COLLECTION_NAME = 'tasks';

export const taskService = {
  subscribeTasks: (userId: string, callback: (tasks: Task[]) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: (data.createdAt as Timestamp)?.toDate(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate(),
          reminderAt: (data.reminderAt as Timestamp)?.toDate() || null,
          dueDate: (data.dueDate as Timestamp)?.toDate() || null,
        } as Task;
      });
      callback(tasks);
    });
  },

  addTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reminderAt: task.reminderAt ? Timestamp.fromDate(task.reminderAt) : null,
      dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
    });
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const firestoreUpdates: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    if (updates.reminderAt) firestoreUpdates.reminderAt = Timestamp.fromDate(updates.reminderAt);
    if (updates.reminderAt === null) firestoreUpdates.reminderAt = null;
    if (updates.dueDate) firestoreUpdates.dueDate = Timestamp.fromDate(updates.dueDate);
    if (updates.dueDate === null) firestoreUpdates.dueDate = null;

    return await updateDoc(docRef, firestoreUpdates);
  },

  deleteTask: async (id: string) => {
    return await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
