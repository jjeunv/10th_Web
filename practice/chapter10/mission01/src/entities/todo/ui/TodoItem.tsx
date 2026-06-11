import { memo } from "react";
import type { Todo } from "../model/types";
import styles from "./TodoItem.module.css";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

// memo: props(todo, onToggle, onDelete)가 안 바뀌면 리렌더링 스킵
// → onToggle/onDelete가 useCallback으로 고정돼야 실제로 효과 있음
export const TodoItem = memo(({ todo, onToggle, onDelete }: TodoItemProps) => {
  console.log("렌더링: ", todo.text);
  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span
        className={`${styles.text} ${todo.completed ? styles.completed : ""}`}
      >
        {todo.text}
      </span>
      <button className={styles.deleteButton} onClick={() => onDelete(todo.id)}>
        삭제
      </button>
    </li>
  );
});
