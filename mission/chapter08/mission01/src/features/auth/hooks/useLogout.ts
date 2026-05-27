import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      logout();
      navigate("/");
    },
  });
};
