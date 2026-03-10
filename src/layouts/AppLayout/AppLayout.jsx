import TopNav from "../../components/TopNav/TopNav.jsx";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar.jsx";
import RightSidebar from "../../components/RightSidebar/RightSidebar.jsx";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <TopNav />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <LeftSidebar />
            </div>
          </aside>

          <main className="col-span-12 lg:col-span-6">
            {children}
          </main>

          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24">
              <RightSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}