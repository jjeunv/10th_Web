import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LpDetailPage from "./pages/LpDetailPage";
import ProtectRoute from "./components/common/ProtectRoute";
import MyPage from "./pages/MyPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      {
        element: <ProtectRoute />,
        children: [
          { path: "/lps/:lpId", element: <LpDetailPage /> },
          { path: "/my-page", element: <MyPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
