import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
import { getLp } from "../apis/lp";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "../components/common/Spinner";
import ErrorMessage from "../components/common/ErrorMessage";

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const LpDetailPage = () => {
  const { lpId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: lp,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["lp", lpId],
    queryFn: () => getLp(Number(lpId)),
  });

  if (isPending) return <Spinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  const isAuthor = user?.id === lp.authorId;
  const isLiked = lp.likes.some((like) => like.userId === user?.id);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-neutral-500 hover:text-neutral-900 transition mb-6 flex items-center gap-1"
      >
        ← 목록으로
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {/* 썸네일 */}
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
          {lp.thumbnail ? (
            <img
              src={lp.thumbnail}
              alt={lp.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[5rem] text-neutral-700">
              ◉
            </div>
          )}
        </div>

        {/* 정보 영역 */}
        <div className="flex flex-col gap-5">
          {/* 태그 */}
          {lp.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {lp.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2.5 py-1 rounded-full bg-amber/10 border border-amber/25 text-amber"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* 제목 */}
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900 tracking-[0.03em] leading-tight">
            {lp.title}
          </h1>

          {/* 업로드일 · 좋아요 수 */}
          <div className="flex items-center gap-4 text-sm border-b border-neutral-200 pb-5">
            <span className="text-neutral-500">
              {new Date(lp.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-amber font-medium">♥ {lp.likes.length}</span>
          </div>

          {/* 본문 */}
          <p className="text-sm text-neutral-400 leading-relaxed flex-1">
            {lp.content}
          </p>

          {/* 아티스트 */}
          <div className="flex items-center gap-3 pt-1 border-t border-neutral-200">
            <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
              ◉
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-600 leading-none mb-0.5">
                Artist
              </p>
              <p className="text-sm font-medium text-neutral-700">
                {lp.author?.name ?? "Unknown"}
              </p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2 pt-1">
            {/* 좋아요 */}
            <button
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                isLiked
                  ? "text-amber border-amber/40 bg-amber/10"
                  : "text-neutral-400 border-neutral-200 hover:text-amber hover:border-amber/40 hover:bg-amber/5"
              }`}
            >
              <HeartIcon filled={isLiked} />
              {lp.likes.length}
            </button>

            {/* 수정 · 삭제 - 본인만 노출 */}
            {isAuthor && (
              <>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-neutral-400 border border-neutral-200 hover:text-neutral-900 hover:bg-black/5 transition">
                  <EditIcon />
                  수정
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-neutral-400 border border-neutral-200 hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 transition">
                  <TrashIcon />
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LpDetailPage;
