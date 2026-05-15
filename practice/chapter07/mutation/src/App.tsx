import { useMutation } from "@tanstack/react-query";
import { useState, type SyntheticEvent } from "react";

const App = () => {
  const [title, setTitle] = useState<string>("");

  const addTodo = async (title: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 딜레이
    if (title === "error") throw new Error("예외 발생!");
    return { id: Date.now(), title };
  };

  const { error, isError, isPending, isSuccess, mutate, reset, mutateAsync } =
    useMutation({
      mutationKey: ["addTodo"],
      mutationFn: addTodo,
      onError: (error) => console.log(`추가 실패: ${error.message}`),
      onSuccess: (data) => {
        console.log(`추가 성공: ${data.title}`);
        setTitle("");
      },
      onSettled: () => console.log("mutation 종료"),
      // retry: 3,
      // scope: { id: "todo" },
      // meta,
      // mutationKey,
      // networkMode,
      // onMutate,
      // retryDelay,
      // throwOnError,
    });

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    mutate(title, {
      onSuccess: () => console.log("컴포넌트 레벨 성공!"),
      onError: () => console.log("컴포넌트 레벨 실패!"),
    });
  };

  // mutateAsync 사용해보기
  // const handleSubmit = async (e: SyntheticEvent) => {
  //   e.preventDefault();
  //   try {
  //     await mutateAsync(title);
  //     console.log("async 성공!");
  //   } catch {
  //     console.log("async 실패!");
  //   } finally {
  //     console.log("async 종료");
  //   }
  // };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {/* <button type="submit" disabled={isPending}>   */}
      <button type="submit">{isPending ? "추가 중..." : "추가"}</button>
      {isError && (
        <span style={{ cursor: "pointer" }} onClick={() => reset()}>
          {error.message}
        </span>
      )}
      {isSuccess && <span>성공!</span>}
    </form>
  );
};

export default App;
