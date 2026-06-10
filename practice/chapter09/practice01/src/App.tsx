import { useMemo } from "react";
import { useTaskManager } from "./hooks/useTaskManager";
import { TaskInput } from "./components/TaskInput";
import { TaskList } from "./components/TaskList";
import { TaskFilter } from "./components/TaskFilter";
import { TaskContext } from "./contexts/TaskContext";

function App() {
  const { tasks, filter, setFilter, addTask, toggleTask, deleteTask } =
    useTaskManager();

  const contextValue = useMemo(
    () => ({ toggleTask, deleteTask }),
    [toggleTask, deleteTask],
  );

  return (
    <TaskContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
          <TaskInput onAdd={addTask} />
          <TaskFilter currentFilter={filter} onFilterChange={setFilter} />
          <TaskList tasks={tasks} />
        </div>
      </div>
    </TaskContext.Provider>
  );
}

export default App;
