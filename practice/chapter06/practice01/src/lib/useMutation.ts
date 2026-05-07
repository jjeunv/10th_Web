import { useState } from "react";

export const useMutation = ({
  mutationFn,
  onSuccess = undefined,
  onError = undefined,
}) => {
  const [state, setState] = useState({ data: undefined, status: "idle" });

  const mutate = (variables) => {
    setState({ data: undefined, status: "loading" });

    mutationFn(variables)
      .then((data) => {
        setState({ data, status: "success" });
        onSuccess?.(data);
      })
      .catch((error) => {
        setState({ data: undefined, status: "error" });
        onError?.(error);
      });
  };

  return {
    mutate,
    data: state.data,
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
  };
};
