import { Outlet, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import LoginRequiredModal from "./LoginRequiredModal";

const ProtectRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <LoginRequiredModal from={location.pathname} />;
  }

  return <Outlet />;
};

export default ProtectRoute;
