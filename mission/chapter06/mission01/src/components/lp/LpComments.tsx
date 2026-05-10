import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { getComments } from "../../apis/lp";
import CommentSkeleton from "./CommentSkeleton";

type Props = { lpId: number };

const LpComments = ({ lpId }: Props) => {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [comment, setComment] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["lpComments", lpId, order],
      queryFn: ({ pageParam }) => getComments(lpId, pageParam, 10, order),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.hasNext ? lastPage.nextCursor : undefined,
    });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const comments = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="mt-12">
      {/* 댓글 작성란 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          댓글 작성
        </label>
        <div className="flex gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/30 transition"
          />
          <button
            disabled={comment.trim().length === 0}
            className="self-end px-4 py-2 rounded-lg text-sm font-medium bg-amber text-white hover:bg-amber/90 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            등록
          </button>
        </div>
        {comment.trim().length === 0 && comment.length > 0 && (
          <p className="mt-1 text-xs text-red-400">내용을 입력해주세요.</p>
        )}
      </div>

      {/* 댓글 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-neutral-700">
          댓글 {comments.length}개
        </p>
        <button
          onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
          className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-500 hover:border-amber/40 hover:text-amber transition"
        >
          {order === "desc" ? "↓ 최신순" : "↑ 오래된순"}
        </button>
      </div>

      {/* 초기 로딩 스켈레톤 */}
      {isPending && (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 댓글 목록 */}
      {!isPending && (
        <>
          {comments.length === 0 ? (
            <p className="text-center py-12 text-sm text-neutral-400">
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
            </p>
          ) : (
            <ul>
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="flex gap-3 py-4 border-b border-neutral-100"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-400 shrink-0">
                    ◉
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-800">
                        {c.author?.name ?? "Unknown"}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div ref={sentinelRef} className="h-4" />

          {/* 추가 로딩 스켈레톤 */}
          {isFetchingNextPage && (
            <div>
              {Array.from({ length: 3 }).map((_, i) => (
                <CommentSkeleton key={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LpComments;
