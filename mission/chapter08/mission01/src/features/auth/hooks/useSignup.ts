import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { signup } from "../api/auth";

export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => navigate("/login"),
    onError: (error) => console.log(error),
  });
};
