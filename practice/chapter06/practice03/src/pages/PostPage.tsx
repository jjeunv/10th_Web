import { useEffect, useRef } from "react";
import { usePosts } from "../hooks/usePosts";

const PostPage = () => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePosts();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <p>초기 로딩 중...</p>;
  if (isError) return <p>{error.message}</p>;

  return (
    <div>
      {data.pages.map((group, i) => (
        <ul key={i}>
          {group.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      ))}
      <div ref={observerRef}></div>
      {isFetchingNextPage && <p>불러오는 중...</p>}
    </div>
  );
};

export default PostPage;
