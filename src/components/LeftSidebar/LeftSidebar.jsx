import { Bookmark, Home, Settings, Users, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

function Item({ to, icon, label }) {
  const Icon = icon;
  const { theme } = useTheme();

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          isActive
            ? theme === "dark"
              ? "!bg-slate-800 !text-white"
              : "!bg-blue-600 !text-white"
            : theme === "dark"
            ? "text-slate-200 hover:!bg-slate-800 hover:!text-white"
            : "text-slate-700 hover:!bg-blue-50 hover:!text-blue-700"
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function LeftSidebar() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const displayPhoto =
    user?.photo || user?.profilePhoto || user?.image || user?.avatar || "";

  return (
    <div className="space-y-4">
      <div className="app-card p-3">
        <NavLink
          to="/profile"
          className={`mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
            theme === "dark"
              ? "hover:!bg-slate-800"
              : "hover:!bg-blue-50"
          }`}
        >
          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            {displayPhoto ? (
              <img src={displayPhoto} alt="me" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center font-bold text-slate-700 dark:text-slate-200">
                {(user?.name?.[0] || "U").toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              View your profile
            </p>
          </div>
        </NavLink>

        <div className="space-y-1">
          <Item to="/home" icon={Home} label="Feed" />
          <Item to="/myposts" icon={FileText} label="My Posts" />
          <Item to="/community" icon={Users} label="Community" />
          <Item to="/saved" icon={Bookmark} label="Saved" />
          <Item to="/settings" icon={Settings} label="Settings" />
        </div>
      </div>
    </div>
  );
}