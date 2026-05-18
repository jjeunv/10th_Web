import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import ErrorMessage from "../../components/common/ErrorMessage";
import LpCardSkeleton from "./components/LpCardSkeleton";
import { useLps } from "./hooks/useLps";
import LpModal from "../../components/lp/LpModal";
import { useAuth } from "../../contexts/AuthContext";
import LoginRequiredModal from "../../components/common/LoginRequiredModal";

const HomePage = () => {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
    fetchNextPage,
  } = useLps(order);

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

  if (isError) return <ErrorMessage message={error.message} />;

  if (isPending) {
    return (
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <LpCardSkeleton key={i} />
        ))}
      </ul>
    );
  }

  const lps = data.pages.flatMap((page) => page.data);

  return (
    <div>
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <p className="text-sm mt-1 text-neutral-400">
            {lps.length}개의 레코드
          </p>
        </div>
        <button
          onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
          className="shrink-0 flex items-center gap-2 text-xs px-4 py-2 rounded-full text-amber border border-amber/30 transition hover:bg-amber/10 hover:border-amber/50 active:scale-[0.98]"
        >
          {order === "desc" ? "↓ 최신순" : "↑ 오래된순"}
        </button>
      </div>

      {lps.length === 0 ? (
        <div className="text-center py-24 text-neutral-400">
          <p className="text-6xl mb-4">◉</p>
          <p className="text-sm">아직 등록된 LP가 없습니다</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lps.map((lp) => (
            <li
              key={lp.id}
              onClick={() => navigate(`/lps/${lp.id}`)}
              className="group cursor-pointer"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-100 transition-transform duration-300 group-hover:scale-[1.03]">
                {lp.thumbnail ? (
                  <img
                    src={lp.thumbnail}
                    alt={lp.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-neutral-700">
                    ◉
                  </div>
                )}
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <p className="text-sm font-semibold text-white truncate leading-snug">
                    {lp.title}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(lp.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                  <p className="text-xs text-amber mt-0.5">
                    ♥ {lp.likes.length}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <LpCardSkeleton key={i} />
          ))}
        </ul>
      )}

      <button
        onClick={() =>
          user ? setIsModalOpen(true) : setIsLoginModalOpen(true)
        }
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-amber text-white text-2xl font-bold shadow-lg hover:bg-amber/90 active:scale-95 transition-all flex items-center justify-center"
        aria-label="LP 작성"
      >
        +
      </button>
      {isLoginModalOpen && <LoginRequiredModal from="/" />}
      {isModalOpen && <LpModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default HomePage;
