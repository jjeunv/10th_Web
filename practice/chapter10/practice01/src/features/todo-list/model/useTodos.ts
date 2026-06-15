import { useCallback, useState } from "react";
import type { Todo } from "../../../entities/todo/model/types";

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "자기 전에 일기 쓰기", completed: false },
    { id: 2, text: "학교 가서 공부하기", completed: true },
  ]);
  const [inputValue, setInputValue] = useState("");

  const addTodo = () => {
    if (!inputValue.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: inputValue, completed: false },
    ]);
    setInputValue("");
  };

  // useCallback([]): 함수 참조 고정 -> memo(TodoItem)의 리렌더링 방지가 실제로 동작
  // 의존성 []: setTodos를 함수형 업데이트(prev => ...)로 써서 외부 값 참조 안 함
  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return { todos, inputValue, setInputValue, addTodo, toggleTodo, deleteTodo };
};
