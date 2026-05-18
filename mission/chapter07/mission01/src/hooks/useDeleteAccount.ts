import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { deleteUser } from "../apis/user";

export const useDeleteAccount = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      logout();
      navigate("/login");
    },
  });
};
