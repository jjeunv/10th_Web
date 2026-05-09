import axios from "axios";
import type { Post } from "../Types/post";
import { useInfiniteQuery } from "@tanstack/react-query";

const postsQueryKey = ["posts"];

const fetchPosts = ({ pageParam }: { pageParam: number }) =>
  axios
    .get<
      Post[]
    >(`https://jsonplaceholder.typicode.com/posts?_page=${pageParam}&_limit=10`)
    .then((res) => res.data);

export function usePosts() {
  return useInfiniteQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + 1,
  });
}
