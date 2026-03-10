import { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPostId, isSameUser } from "../../utils/postHelpers.js";
import { fetchPostsPages } from "../../utils/fetchAllPosts.js";

export default function Community() {
  const { user, userId } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const all = await fetchPostsPages(3, 20);
      const others = all.filter((post) => !isSameUser(post, user, userId));
      setPosts(others);
    } catch (e) {
      console.log("COMMUNITY ERROR:", e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.name, user?.email, userId]);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold [html.theme-light_&]:text-blue-800 [html.theme-dark_&]:text-sky-300">
  Community
</h1>
          <p className="mt-1 text-sm text-slate-500">
            Posts from everyone except you.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-slate-500">
            Loading community posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-slate-500">
            No community posts found.
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post, idx) => (
              <PostCard key={getPostId(post) || idx} post={post} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}