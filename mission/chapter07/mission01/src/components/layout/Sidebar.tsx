import type { ResponseLoginDto } from "../../types/auth";
import { SearchIcon, UserIcon, LogoutIcon } from "../icons";

export type SidebarProps = {
  user: ResponseLoginDto | null;
  pathname: string;
  onNavTo: (path: string) => void;
  onDeleteAccount: () => void;
};

const Sidebar = ({
  user,
  pathname,
  onNavTo,
  onDeleteAccount,
}: SidebarProps) => (
  <div className="flex flex-col h-full py-5 px-3">
    <nav className="flex flex-col gap-0.5 flex-1 mt-2">
      <button
        onClick={() => onNavTo("/")}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
          pathname === "/"
            ? "text-amber bg-amber/10"
            : "text-neutral-500 hover:text-neutral-900 hover:bg-black/5"
        }`}
      >
        <SearchIcon />
        찾기
      </button>

      {user && (
        <button
          onClick={() => onNavTo("/my-page")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
            pathname === "/my-page"
              ? "text-amber bg-amber/10"
              : "text-neutral-500 hover:text-neutral-900 hover:bg-black/5"
          }`}
        >
          <UserIcon />
          마이페이지
        </button>
      )}

      {!user && (
        <button
          onClick={() => onNavTo("/login")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left ${
            pathname === "/login"
              ? "text-amber bg-amber/10"
              : "text-neutral-500 hover:text-neutral-900 hover:bg-black/5"
          }`}
        >
          <UserIcon />
          로그인
        </button>
      )}
    </nav>

    <div>
      {user ? (
        <button
          onClick={onDeleteAccount}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
        >
          <LogoutIcon />
          탈퇴하기
        </button>
      ) : (
        <button
          onClick={() => onNavTo("/signup")}
          className="w-full py-2 rounded-lg bg-amber text-white text-sm font-semibold transition"
        >
          회원가입
        </button>
      )}
    </div>
  </div>
);

export default Sidebar;
