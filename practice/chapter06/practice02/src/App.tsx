import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostsPage from "./pages/PostsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostsPage />
    </QueryClientProvider>
  );
}

export default App;
