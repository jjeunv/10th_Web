import { memo, useState } from "react";

interface TaskInputProps {
  onAdd: (text: string) => void;
}

export const TaskInput = memo(({ onAdd }: TaskInputProps) => {
  const [task, setTask] = useState("");

  const handleClick = () => {
    if (!task.trim()) return;
    onAdd(task.trim());
    setTask("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={task}
        placeholder="할 일을 입력하세요"
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleClick();
        }}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        추가
      </button>
    </div>
  );
});
