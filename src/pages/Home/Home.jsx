import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import CreatePostBox from "../../components/CreatePostBox/CreatePostBox.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import {
  getPostId,
  getPostOwnerName,
  normalizeName,
} from "../../utils/postHelpers.js";
import { clearPostsCache, fetchAllPosts, fetchPostsPages } from "../../utils/fetchAllPosts.js";
import { dedupePostsById, getLocalCreatedPosts } from "../../utils/localPosts.js";

export default function Home() {
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const query = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return (sp.get("search") || "").trim();
  }, [location.search]);

  const filteredPosts = useMemo(() => {
    if (!query) return posts;

    const q = normalizeName(query);

    return posts.filter((post) => {
      const ownerName = normalizeName(getPostOwnerName(post));
      const body = normalizeName(post?.body || "");
      return ownerName.includes(q) || body.includes(q);
    });
  }, [posts, query]);

  const loadInitial = async () => {
    try {
      setLoading(true);

      const serverPosts = query
        ? await fetchAllPosts()
        : await fetchPostsPages(1, 20);

      const localPosts = getLocalCreatedPosts();
      const merged = dedupePostsById([...localPosts, ...serverPosts]);

      setPosts(merged);
      setPageCount(query ? 12 : 1);
    } catch (e) {
      console.log("HOME ERROR:", e);
      setPosts(getLocalCreatedPosts());
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = pageCount + 1;

      const serverPosts = await fetchPostsPages(nextPage, 20);
      const localPosts = getLocalCreatedPosts();
      const merged = dedupePostsById([...localPosts, ...serverPosts]);

      setPosts(merged);
      setPageCount(nextPage);
    } catch (e) {
      console.log("HOME LOAD MORE ERROR:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshFeed = async () => {
    clearPostsCache();
    await loadInitial();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    loadInitial();
  }, [query]);

  return (
    <AppLayout>
      <div className="space-y-5">
        <CreatePostBox onCreated={refreshFeed} />

        {query && (
          <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-900">
              Search results for: <span className="text-blue-700">{query}</span>
            </p>
          </div>
        )}

        {loading ? (
          <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm text-slate-500">
            Loading posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm text-slate-500">
            {query ? "No results found." : "No posts yet."}
          </div>
        ) : (
          <>
            {filteredPosts.map((post, idx) => (
              <PostCard
                key={getPostId(post) || idx}
                post={post}
                onChanged={refreshFeed}
              />
            ))}

            {!query && (
              <div className="flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                  type="button"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}