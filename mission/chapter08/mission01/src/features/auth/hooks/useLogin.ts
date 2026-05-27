import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";
import { login as loginApi } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      login(data);
      navigate(from, { replace: true });
    },
  });
};
