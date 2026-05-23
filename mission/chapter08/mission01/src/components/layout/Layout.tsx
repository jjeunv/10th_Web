import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useLogout } from "../../hooks/useLogout";
import { useDeleteAccount } from "../../hooks/useDeleteAccount";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSidebar } from "../../hooks/useSidebar";

const SIDEBAR_W = 160;

const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { isOpen: sidebarOpen, toggle, close } = useSidebar();
  const { mutate: logoutMutate } = useLogout();
  const { mutate: deleteAccountMutate } = useDeleteAccount();

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-[#111]">
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-2xl mb-2">⚠️</p>
            <h2 className="font-semibold text-lg mb-2">정말 탈퇴하시겠어요?</h2>
            <p className="text-sm text-neutral-400 mb-6">
              탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 transition"
              >
                아니오
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  deleteAccountMutate();
                }}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-neutral-200 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: SIDEBAR_W }}
        onClick={(e) => e.stopPropagation()}
      >
        <Sidebar
          user={user}
          pathname={location.pathname}
          onNavTo={(path) => navigate(path)}
          onDeleteAccount={() => setShowDeleteConfirm(true)}
        />
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:bg-transparent bg-black/30"
          style={{ left: SIDEBAR_W }}
          onClick={close}
        />
      )}

      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? SIDEBAR_W : 0 }}
      >
        <Header
          user={user}
          onToggleSidebar={toggle}
          onLogout={() => logoutMutate()}
          onNavigate={navigate}
        />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
