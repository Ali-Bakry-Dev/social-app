import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchPostsPages } from "../../utils/fetchAllPosts.js";
import {
  getPostId,
  getPostOwner,
} from "../../utils/postHelpers.js";
import { dedupePostsById, getLocalCreatedPosts } from "../../utils/localPosts.js";

function isMyPost(post, me) {
  const owner = getPostOwner(post);
  if (!owner || !me) return false;

  const ownerId = owner?._id || owner?.id || "";
  const myId = me?._id || me?.id || "";

  const ownerEmail = String(owner?.email || "").toLowerCase().trim();
  const myEmail = String(me?.email || "").toLowerCase().trim();

  const ownerName = String(owner?.name || "").trim();
  const myName = String(me?.name || "").trim();

  if (ownerId && myId && ownerId === myId) return true;
  if (ownerEmail && myEmail && ownerEmail === myEmail) return true;
  if (ownerName && myName && ownerName === myName) return true;

  return false;
}

function MyPostsContent() {
  const { user } = useAuth();

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

      const serverPosts = await fetchPostsPages(6, 20);
      const localPosts = getLocalCreatedPosts();

      const merged = dedupePostsById([...localPosts, ...serverPosts]);
      const mine = merged.filter((post) => isMyPost(post, user));

      setPosts(mine);
    } catch (e) {
      console.log("MY POSTS ERROR:", e);
      setPosts(getLocalCreatedPosts().filter((post) => isMyPost(post, user)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.name, user?.email, user?._id, user?.id]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading your posts...
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
        You haven’t posted anything yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post, idx) => (
        <PostCard key={getPostId(post) || idx} post={post} onChanged={load} />
      ))}
    </div>
  );
}

export function useMyPostsCount(user) {
  const localPosts = getLocalCreatedPosts();
  return useMemo(() => {
    if (!user) return 0;
    return localPosts.filter((post) => isMyPost(post, user)).length;
  }, [user, localPosts.length]);
}

export default function MyPosts() {
  const location = useLocation();

  if (location.pathname === "/myposts") {
    return (
      <AppLayout>
        <div className="space-y-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
                 <h1 className="text-2xl font-extrabold [html.theme-light_&]:text-blue-800 [html.theme-dark_&]:text-sky-300">
  My Posts
</h1>
            <p className="mt-1 text-sm text-slate-500">All posts created by you.</p>
          </div>

          <MyPostsContent />
        </div>
      </AppLayout>
    );
  }

  return <MyPostsContent />;
}