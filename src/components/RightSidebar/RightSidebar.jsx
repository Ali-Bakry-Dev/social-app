import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  getPostOwner,
  getPostOwnerId,
  normalizeName,
  isSameUser,
} from "../../utils/postHelpers.js";
import { fetchPostsPages } from "../../utils/fetchAllPosts.js";

function FriendAvatar({ friend }) {
  const [broken, setBroken] = useState(false);

  const photo =
    friend?.photo ||
    friend?.profilePhoto ||
    friend?.image ||
    friend?.avatar ||
    "";

  if (!photo || broken) {
    return (
      <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
        {(friend?.name?.[0] || "U").toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={friend?.name || "user"}
      className="h-11 w-11 rounded-full object-cover"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}

function RightSidebarBase() {
  const { user, userId } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (targetPages = pages) => {
    if (!user) {
      setFriends([]);
      setLoading(false);
      return;
    }

    try {
      if (targetPages === 2) setLoading(true);
      else setLoadingMore(true);

      const all = await fetchPostsPages(targetPages, 20);

      const usersMap = new Map();

      all.forEach((post) => {
        const owner = getPostOwner(post);
        const ownerId = getPostOwnerId(post);

        if (!owner) return;
        if (isSameUser(post, user, userId)) return;

        const mapKey =
          ownerId || owner?.email || normalizeName(owner?.name || "");

        if (!mapKey) return;

        if (!usersMap.has(mapKey)) {
          usersMap.set(mapKey, owner);
        }
      });

      setFriends(Array.from(usersMap.values()));
      setPages(targetPages);
    } catch (e) {
      console.log("RIGHT SIDEBAR ERROR:", e);
      setFriends([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load(2);
  }, [user?.name, user?.email, userId]);

  const renderedFriends = useMemo(() => {
    return friends
      .filter((friend) => friend?._id || friend?.id)
      .map((friend, idx) => {
        const id = friend?._id || friend?.id || idx;

        return (
          <button
            key={id}
            type="button"
            onClick={() => navigate(`/users/${friend?._id || friend?.id}`)}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
              theme === "dark"
                ? "hover:bg-slate-800"
                : "hover:bg-blue-50"
            }`}
          >
            <FriendAvatar friend={friend} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {friend?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                View profile
              </p>
            </div>
          </button>
        );
      });
  }, [friends, navigate, theme]);

  return (
    <div className="space-y-4">
      <div className="app-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p
            className={`text-sm font-extrabold ${
              theme === "dark" ? "text-sky-400" : "text-blue-800"
            }`}
          >
            Suggested Friends
          </p>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {friends.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ) : !renderedFriends.length ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">No friends yet.</p>
        ) : (
          <>
            <div className="max-h-[70vh] space-y-1 overflow-auto pr-1">
              {renderedFriends}
            </div>

            <button
  type="button"
  onClick={() => load(pages + 2)}
  disabled={loadingMore}
  className={`mt-3 w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${
    theme === "dark"
      ? "border-slate-700 text-slate-200 hover:bg-slate-800 hover:scale-[1.02]"
      : "border-slate-200 text-slate-700 hover:bg-blue-100 hover:text-blue-700 hover:scale-[1.02]"
  }`}
>
  {loadingMore ? "Loading..." : "Load More"}
</button>
          </>
        )}
      </div>
    </div>
  );
}

const RightSidebar = memo(RightSidebarBase);
export default RightSidebar;