import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import {
  getPostOwner,
  getPostOwnerId,
  getPostId,
} from "../../utils/postHelpers.js";
import { Info, Users } from "lucide-react";
import { isFollowing, toggleFollow } from "../../utils/follows.js";
import { fetchAllPosts } from "../../utils/fetchAllPosts.js";

function UserPosts({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const all = await fetchAllPosts();
      const userPosts = all.filter((post) => getPostOwnerId(post) === userId);
      setPosts(userPosts);
    } catch (e) {
      console.log("USER POSTS ERROR:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading posts...
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post, idx) => (
        <PostCard key={getPostId(post) || idx} post={post} />
      ))}
    </div>
  );
}

export default function UserProfile() {
  const { id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [postsCount, setPostsCount] = useState(0);
  const [following, setFollowing] = useState(() => isFollowing(id));

  const displayPhoto = useMemo(() => {
    const u = profileUser;
    return u?.photo || u?.profilePhoto || u?.image || u?.avatar || "";
  }, [profileUser]);

  const loadUser = async () => {
    if (!id) return;

    try {
      setLoadingUser(true);
      const all = await fetchAllPosts();
      const userPosts = all.filter((post) => getPostOwnerId(post) === id);
      const firstOwner = userPosts.length ? getPostOwner(userPosts[0]) : null;

      setProfileUser(firstOwner);
      setPostsCount(userPosts.length);
    } catch (e) {
      console.log("USER PROFILE ERROR:", e);
      setProfileUser(null);
      setPostsCount(0);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUser();
    setFollowing(isFollowing(id));
  }, [id]);

  const handleFollow = () => {
    toggleFollow(id);
    setFollowing(isFollowing(id));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {loadingUser ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-slate-500">
            Loading profile...
          </div>
        ) : !profileUser ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-slate-500">
            User not found.
          </div>
        ) : (
          <>
            <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white bg-slate-200 shadow-sm">
                      {displayPhoto ? (
                        <img
                          src={displayPhoto}
                          alt="profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-2xl font-extrabold text-slate-700">
                          {(profileUser?.name?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 pt-1">
                      <h1 className="truncate text-xl font-extrabold text-slate-900">
                        {profileUser?.name || "User"}
                      </h1>
                      <p className="mt-1 text-sm text-slate-500">
                        @{(profileUser?.name || "user").replace(/\s+/g, "").toLowerCase()}
                      </p>

                      <button
                        onClick={handleFollow}
                        className={`mt-3 rounded-xl px-4 py-2 text-sm font-semibold ${
                          following
                            ? "border bg-white text-slate-700 hover:bg-slate-50"
                            : "bg-blue-800 text-white hover:bg-blue-900"
                        }`}
                        type="button"
                      >
                        {following ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-center sm:min-w-[220px]">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Following
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-slate-900">0</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Followers
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-slate-900">
                        {following ? 1 : 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Posts
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-slate-900">
                        {postsCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <Info size={16} className="text-slate-600" />
                      <p className="font-extrabold text-slate-900">About</p>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p>{profileUser?.email || "No email available"}</p>
                      <p>{profileUser?.name || "User"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-600" />
                      <p className="font-extrabold text-slate-900">Stats</p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400">Posts</p>
                        <p className="font-extrabold text-slate-900">{postsCount}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Followers</p>
                        <p className="font-extrabold text-slate-900">
                          {following ? 1 : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h1 className="text-2xl font-extrabold [html.theme-light_&]:text-blue-800 [html.theme-dark_&]:text-sky-300">
  Posts
</h1>
            </div>

            <UserPosts userId={id} />
          </>
        )}
      </div>
    </AppLayout>
  );
}