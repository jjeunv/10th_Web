import { usePosts } from "../hooks/usePosts";
import type { Post } from "../Types/post";

const PostsPage = () => {
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isFetching,
  } = usePosts();

  if (isPending) return <p>초기 로딩 중...</p>;
  if (isError) return <p>{error.message}</p>;

  return (
    <div>
      {data.pages.map((group, i) => (
        <ul key={i}>
          {group.map((post: Post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={isFetching || !hasNextPage}
      >
        {!hasNextPage ? "끝" : "다음"}
      </button>

      {isFetchingNextPage && <p>불러오는 중...</p>}
    </div>
  );
};

export default PostsPage;
