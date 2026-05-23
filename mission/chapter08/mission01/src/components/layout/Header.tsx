import type { ResponseLoginDto } from "../../types/auth";
import { MenuIcon } from "../icons";

type HeaderProps = {
  user: ResponseLoginDto | null;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
};

const Header = ({
  user,
  onToggleSidebar,
  onLogout,
  onNavigate,
}: HeaderProps) => (
  <header className="sticky top-0 z-20 flex items-center justify-between px-5 h-12 bg-white border-b border-neutral-200">
    <div className="flex items-center gap-3">
      <button
        onClick={onToggleSidebar}
        className="text-neutral-400 hover:text-neutral-900 transition"
        aria-label="사이드바 토글"
      >
        <MenuIcon />
      </button>
      <span
        onClick={() => onNavigate("/")}
        className="font-display text-2xl tracking-[0.12em] text-amber"
      >
        KASA
      </span>
    </div>
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-neutral-400 hidden sm:inline">
            {user.name}님 반갑습니다.
          </span>
          <button
            onClick={onLogout}
            className="text-sm text-neutral-400 hover:text-neutral-900 transition"
          >
            로그아웃
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => onNavigate("/login")}
            className="text-sm text-neutral-400 hover:text-neutral-900 transition"
          >
            로그인
          </button>
          <button
            onClick={() => onNavigate("/signup")}
            className="text-sm px-4 py-1.5 rounded-full bg-amber text-white font-semibold transition"
          >
            회원가입
          </button>
        </>
      )}
    </div>
  </header>
);

export default Header;
