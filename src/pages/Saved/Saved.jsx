import { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import { fetchAllPosts } from "../../utils/fetchAllPosts.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getSavedIdsForUser } from "../../utils/saved.js";

export default function Saved() {
  const { userId } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const all = await fetchAllPosts();
      const savedIds = getSavedIdsForUser(userId);

      const savedPosts = all.filter((post) => {
        const id = post?._id || post?.id;
        return savedIds.includes(id);
      });

      setPosts(savedPosts);
    } catch (err) {
      console.log("SAVED ERROR:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const onStorage = () => load();
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, [userId]);

  return (
    <AppLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold [html.theme-light_&]:text-blue-800 [html.theme-dark_&]:text-sky-300">
          Saved Posts
        </h1>

        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading...
          </div>
        ) : !posts.length ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
            No saved posts yet.
          </div>
        ) : (
          posts.map((post, idx) => (
            <PostCard
              key={post?._id || post?.id || idx}
              post={post}
              onChanged={load}
            />
          ))
        )}
      </div>
    </AppLayout>
  );
}