import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

const SIDEBAR_W = 160;

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navTo = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-[#111]">
      {/* 사이드바 */}
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
          onNavTo={navTo}
          onLogout={handleLogout}
        />
      </aside>

      {/* 사이드바 열렸을 때 외부 클릭 닫기 오버레이 (모바일: 반투명 / 데스크탑: 투명) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:bg-transparent bg-black/30"
          style={{ left: SIDEBAR_W }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 우측 전체 영역 */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? SIDEBAR_W : 0 }}
      >
        <Header
          user={user}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onLogout={handleLogout}
          onNavigate={navigate}
        />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
