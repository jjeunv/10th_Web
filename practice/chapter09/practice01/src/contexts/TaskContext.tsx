import { createContext, useContext } from "react";

interface TaskContextType {
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
}

export const TaskContext = createContext<TaskContextType | null>(null);

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("TaskContext를 찾을 수 없습니다");
  return context;
}
