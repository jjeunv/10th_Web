import type { FilterType } from "../types/task";

const FILTERS: FilterType[] = ["all", "active", "completed"];

interface TaskFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const TaskFilter = ({
  currentFilter,
  onFilterChange,
}: TaskFilterProps) => {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
            currentFilter === f
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {f === "all" ? "전체" : f === "active" ? "진행 중" : "완료"}
        </button>
      ))}
    </div>
  );
};
