import { createContext, useContext } from "react";

const QueryClientContext = createContext(null);

export function QueryClientProvider({ client, children }) {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}

export function useQueryClient() {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error(
      "useQueryClient는 QueryClientProvider 내부에 존재해야 합니다.",
    );
  }
  return client;
}
