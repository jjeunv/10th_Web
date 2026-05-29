import { useReducer, useState } from "react";
import { initialState, taskReducer } from "../reducers/taskReducer";
import type { FilterType } from "../types/task";

export const useTaskManager = () => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [filter, setFilter] = useState<FilterType>("all");

  const addTask = (text: string) => {
    dispatch({ type: "ADD_TASK", payload: text });
  };

  const toggleTask = (id: number) => {
    dispatch({ type: "TOGGLE_TASK", payload: id });
  };

  const deleteTask = (id: number) => {
    dispatch({ type: "DELETE_TASK", payload: id });
  };

  const filteredTasks = state.tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "active") return !task.completed;
    return task.completed;
  });

  return {
    tasks: filteredTasks,
    filter,
    setFilter,
    addTask,
    toggleTask,
    deleteTask,
  };
};
