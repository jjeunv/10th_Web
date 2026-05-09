import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostPage from "./pages/PostPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostPage />
    </QueryClientProvider>
  );
}

export default App;
