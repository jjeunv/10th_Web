import axios from "axios";
import { useQuery } from "./lib/useQuery";
// import { useMutation } from "./lib/useMutation";
// import { queryClient } from "./lib/queryClient";
import { useState } from "react";

function App() {
  const [userId, setUserId] = useState<number | null>(null);

  const { data, isLoading, isPending } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      axios
        .get(`https://jsonplaceholder.typicode.com/users/${userId}`)
        .then((res) => res.data),
    enabled: !!userId, // userId가 있을 때만 fetch
  });

  return (
    <div>
      <button onClick={() => setUserId(1)}>유저 불러오기</button>
      {isPending && !isLoading && <p>대기 중 (fetch 안 함)</p>}
      {isLoading && <p>로딩 중...</p>}
      {data && <p>{JSON.stringify(data)}</p>}
    </div>
  );
}

export default App;
