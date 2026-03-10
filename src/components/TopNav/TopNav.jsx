import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Home,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useState } from "react";
import { fetchAllPosts } from "../../utils/fetchAllPosts.js";
import {
  getPostOwner,
  getPostOwnerId,
  normalizeName,
} from "../../utils/postHelpers.js";

export default function TopNav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const displayPhoto =
    user?.photo || user?.profilePhoto || user?.image || user?.avatar || "";

  const navClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
      isActive
        ? "bg-blue-50 text-blue-800"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  const runSearch = async (e) => {
    e?.preventDefault?.();

    const q = search.trim();
    if (!q) return;

    const target = normalizeName(q);

    try {
      setSearching(true);

      const posts = await fetchAllPosts();

      const usersMap = new Map();

      posts.forEach((post) => {
        const owner = getPostOwner(post);
        const ownerId = getPostOwnerId(post);

        if (!owner) return;

        const key =
          ownerId ||
          String(owner?.email || "").toLowerCase().trim() ||
          normalizeName(owner?.name || "");

        if (!key) return;

        if (!usersMap.has(key)) {
          usersMap.set(key, owner);
        }
      });

      // أضف اليوزر الحالي كمان احتياطيًا
      if (user) {
        const myKey =
          user?._id ||
          user?.id ||
          String(user?.email || "").toLowerCase().trim() ||
          normalizeName(user?.name || "");

        if (myKey && !usersMap.has(myKey)) {
          usersMap.set(myKey, user);
        }
      }

      const users = Array.from(usersMap.values());

      const exactUser =
        users.find((u) => normalizeName(u?.name || "") === target) ||
        users.find((u) => normalizeName(u?.name || "").startsWith(target)) ||
        users.find((u) => normalizeName(u?.name || "").includes(target));

      if (exactUser?._id || exactUser?.id) {
        navigate(`/users/${exactUser._id || exactUser.id}`);
      } else {
        navigate(`/home?search=${encodeURIComponent(q)}`);
      }

      setMobileOpen(false);
    } catch (err) {
      console.log("SEARCH ERROR:", err);
      navigate(`/home?search=${encodeURIComponent(q)}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((s) => !s)}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className={`text-lg font-black tracking-tight ${
              theme === "dark" ? "text-sky-400" : "text-blue-800"
            }`}
          >
            Route Posts
          </button>
        </div>

        <div className="hidden w-full max-w-md items-center lg:flex">
          <form onSubmit={runSearch} className="relative w-full">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searching ? "Searching..." : "Search people or posts"}
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
            />
          </form>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          <NavLink to="/home" className={navClass}>
            <Home size={18} />
            Feed
          </NavLink>

          <NavLink to="/profile" className={navClass}>
            <User size={18} />
            Profile
          </NavLink>

          <NavLink to="/notifications" className={navClass}>
            <Bell size={18} />
            Notifications
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 sm:flex"
          >
            <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt="me"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center font-bold text-slate-700">
                  {(user?.name?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>

            <div className="max-w-[140px] text-left">
              <p className="truncate text-sm font-bold text-slate-900">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-3 lg:hidden">
          <div className="mb-3">
            <form onSubmit={runSearch} className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searching ? "Searching..." : "Search people or posts"}
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </form>
          </div>

          <div className="flex flex-col gap-2">
            <NavLink to="/home" className={navClass} onClick={() => setMobileOpen(false)}>
              <Home size={18} />
              Feed
            </NavLink>

            <NavLink to="/profile" className={navClass} onClick={() => setMobileOpen(false)}>
              <User size={18} />
              Profile
            </NavLink>

            <NavLink
              to="/notifications"
              className={navClass}
              onClick={() => setMobileOpen(false)}
            >
              <Bell size={18} />
              Notifications
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}