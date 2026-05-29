import type { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
}

export const TaskList = ({ tasks }: TaskListProps) => {
  if (tasks.length === 0)
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        할 일이 없습니다.
      </p>
    );

  return (
    <ul className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
};
