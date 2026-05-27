import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../features/auth/contexts/AuthContext";
import { useLp } from "../features/lp/hooks/useLp";
import { useDeleteLp } from "../features/lp/hooks/useDeleteLp";
import { useToggleLike } from "../features/lp/hooks/useToggleLike";
import Spinner from "../shared/components/Spinner";
import ErrorMessage from "../shared/components/ErrorMessage";
import LpComments from "../features/lp/components/LpComments";
import LpModal from "../features/lp/components/LpModal";
import { HeartIcon, EditIcon, TrashIcon } from "../shared/icons";

const LpDetailPage = () => {
  const { lpId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: lp, isPending, isError, error } = useLp(Number(lpId));
  const { mutate: deleteMutate } = useDeleteLp(Number(lpId));
  const { mutate: toggleLikeMutate } = useToggleLike(Number(lpId));

  if (isPending) return <Spinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  const isAuthor = user?.id === lp.authorId;
  const isLiked = lp.likes.some((like) => like.userId === user?.id);

  return (
    <div className="max-w-4xl mx-auto">
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-2xl mb-2">🗑️</p>
            <h2 className="font-semibold text-lg mb-2">LP를 삭제할까요?</h2>
            <p className="text-sm text-neutral-400 mb-6">
              삭제된 LP는 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 transition"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  deleteMutate();
                }}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <LpModal
          onClose={() => setIsEditOpen(false)}
          lpId={Number(lpId)}
          initialData={{
            title: lp.title,
            content: lp.content,
            tags: lp.tags.map((t) => t.name),
          }}
        />
      )}

      <button
        onClick={() => navigate(-1)}
        className="text-sm text-neutral-500 hover:text-neutral-900 transition mb-6 flex items-center gap-1"
      >
        ← 목록으로
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
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

        <div className="flex flex-col gap-5">
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

          <h1 className="font-display text-3xl md:text-4xl text-neutral-900 tracking-[0.03em] leading-tight">
            {lp.title}
          </h1>

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

          <p className="text-sm text-neutral-400 leading-relaxed flex-1">
            {lp.content}
          </p>

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

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => toggleLikeMutate()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                isLiked
                  ? "text-amber border-amber/40 bg-amber/10"
                  : "text-neutral-400 border-neutral-200 hover:text-amber hover:border-amber/40 hover:bg-amber/5"
              }`}
            >
              <HeartIcon filled={isLiked} />
              {lp.likes.length}
            </button>

            {isAuthor && (
              <>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-neutral-400 border border-neutral-200 hover:text-neutral-900 hover:bg-black/5 transition"
                >
                  <EditIcon />
                  수정
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-neutral-400 border border-neutral-200 hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 transition"
                >
                  <TrashIcon />
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <LpComments lpId={Number(lpId)} />
    </div>
  );
};

export default LpDetailPage;
