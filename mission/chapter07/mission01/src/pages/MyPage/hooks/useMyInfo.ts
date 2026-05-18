import { useQuery } from "@tanstack/react-query";
import { getMyInfo } from "../../../apis/user";

export const useMyInfo = () =>
  useQuery({
    queryKey: ["myInfo"],
    queryFn: getMyInfo,
  });
