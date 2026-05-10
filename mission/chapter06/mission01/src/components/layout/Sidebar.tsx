import type { ResponseLoginDto } from "../../types/auth";

const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export type SidebarProps = {
  user: ResponseLoginDto | null;
  pathname: string;
  onNavTo: (path: string) => void;
  onLogout: () => void;
};

const Sidebar = ({ user, pathname, onNavTo, onLogout }: SidebarProps) => (
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
          onClick={onLogout}
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
