import { useTaskContext } from "../contexts/TaskContext";
import type { Task } from "../types/task";

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const { toggleTask, deleteTask } = useTaskContext();

  return (
    <li className="flex items-center gap-3 py-2 px-1 group">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task.id)}
        className="w-4 h-4 accent-blue-500 cursor-pointer"
      />
      <span
        className={`flex-1 text-sm ${
          task.completed ? "line-through text-gray-400" : "text-gray-700"
        }`}
      >
        {task.text}
      </span>
      <button
        onClick={() => deleteTask(task.id)}
        className="text-gray-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        삭제
      </button>
    </li>
  );
};
