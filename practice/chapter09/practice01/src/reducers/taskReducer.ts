import type { Task } from "../types/task";

export interface TaskState {
  tasks: Task[];
  nextId: number;
}

export type TaskAction =
  | { type: "ADD_TASK"; payload: string }
  | { type: "TOGGLE_TASK"; payload: number }
  | { type: "DELETE_TASK"; payload: number };

export const initialState: TaskState = {
  tasks: [],
  nextId: 1,
};

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  console.log("reducer called:", action.type);
  switch (action.type) {
    case "ADD_TASK": {
      return {
        tasks: [
          ...state.tasks,
          { id: state.nextId, text: action.payload, completed: false },
        ],
        nextId: state.nextId + 1,
      };
    }
    case "TOGGLE_TASK": {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t,
        ),
      };
    }
    case "DELETE_TASK": {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
    }
    default: {
      return state;
    }
  }
}
