import { useNavigate } from "react-router";

type LoginRequiredModalProps = {
  from: string;
};

const LoginRequiredModal = ({ from }: LoginRequiredModalProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => navigate(-1)}
    >
      <div
        className="bg-white border border-neutral-200 rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-3xl mb-4">🔒</p>
        <h2 className="font-display text-2xl text-amber tracking-[0.06em] mb-2">
          로그인 필요
        </h2>
        <p className="text-sm text-neutral-400 mb-6">
          이 페이지는 로그인 후 이용할 수 있습니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 rounded-lg border border-neutral-200 text-neutral-600 text-sm transition hover:bg-black/5"
          >
            돌아가기
          </button>
          <button
            onClick={() => navigate("/login", { state: { from } })}
            className="flex-1 py-2.5 rounded-lg bg-amber text-white font-semibold text-sm transition hover:bg-amber/90"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
