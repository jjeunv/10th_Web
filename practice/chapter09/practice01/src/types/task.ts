export type FilterType = "all" | "active" | "completed";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}


