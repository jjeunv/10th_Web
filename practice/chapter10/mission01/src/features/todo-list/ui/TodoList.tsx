import { TodoItem } from "../../../entities/todo/ui/TodoItem";
import { useTodos } from "../model/useTodos";
import styles from "./TodoList.module.css";

export const TodoList = () => {
  const { todos, inputValue, setInputValue, addTodo, toggleTodo, deleteTodo } =
    useTodos();

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <input
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button className={styles.addButton} onClick={addTodo}>
          추가
        </button>
      </div>

      <ul className={styles.list}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};
