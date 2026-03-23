import { memo, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Share2,
  ThumbsUp,
  MoreHorizontal,
} from "lucide-react";
import {
  toggleLikeApi,
  deletePostApi,
  toggleBookmarkApi,
} from "../../api/posts.js";
import { useAuth } from "../../context/AuthContext.jsx";
import EditPostModal from "../EditPostModal/EditPostModal.jsx";
import SharePostModal from "../SharePostModal/SharePostModal.jsx";
import {
  getPostOwnerId,
  getPostOwnerName,
  getPostOwnerPhoto,
  getPostId,
} from "../../utils/postHelpers.js";

function Avatar({ user }) {
  const [broken, setBroken] = useState(false);

  const src =
    user?.photo ||
    user?.profilePhoto ||
    user?.image ||
    user?.avatar ||
    "";

  const letter = (user?.name?.[0] || "U").toUpperCase();

  if (!src || broken) {
    return (
      <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-200 font-extrabold text-slate-700">
        {letter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={user?.name || "user"}
      onError={() => setBroken(true)}
      className="h-11 w-11 rounded-full border object-cover"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

function normalizeLikeIds(likes) {
  if (!Array.isArray(likes)) return [];
  return likes
    .map((l) => (typeof l === "string" ? l : l?._id || l?.id))
    .filter(Boolean);
}

function getSavedKey(userId, postId) {
  return `saved-ui:${userId}:${postId}`;
}

function getInitialSaved(post, myId, postId) {
  const arr = post?.bookmarks || [];
  if (Array.isArray(arr) && myId) {
    const fromPost = arr.some((u) => {
      const id = typeof u === "string" ? u : u?._id || u?.id;
      return id === myId;
    });
    if (fromPost) return true;
  }

  try {
    return localStorage.getItem(getSavedKey(myId, postId)) === "1";
  } catch {
    return false;
  }
}

function getSharedOriginal(post) {
  return (
    post?.sharedPost ||
    post?.originalPost ||
    post?.post ||
    post?.sharedFrom ||
    post?.parentPost ||
    null
  );
}

function SharedPreview({ original }) {
  if (!original) return null;

  const ownerName =
    original?.user?.name ||
    original?.createdBy?.name ||
    original?.owner?.name ||
    original?.postCreator?.name ||
    "User";

  const ownerPhoto =
    original?.user?.photo ||
    original?.user?.profilePhoto ||
    original?.user?.image ||
    original?.user?.avatar ||
    original?.createdBy?.photo ||
    original?.owner?.photo ||
    original?.postCreator?.photo ||
    "";

  return (
    <div className="mx-4 mb-4 overflow-hidden rounded-2xl border bg-slate-50">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar user={{ name: ownerName, photo: ownerPhoto }} />
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-900">
            {ownerName}
          </p>
          <p className="text-xs text-slate-500">Original post</p>
        </div>
      </div>

      {original?.body && (
        <div className="px-4 pb-3 text-[14px] text-slate-800">
          {original.body}
        </div>
      )}

      {original?.image && (
        <img
          src={original.image}
          alt="shared post"
          className="w-full max-h-[420px] object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

function PostCardBase({ post, onChanged }) {
  const { user } = useAuth();
  const myId = user?._id || user?.id;

  const ownerId = useMemo(() => getPostOwnerId(post), [post]);
  const ownerName = useMemo(() => getPostOwnerName(post), [post]);
  const ownerPhoto = useMemo(() => getPostOwnerPhoto(post), [post]);
  const postId = useMemo(() => getPostId(post), [post]);
  const sharedOriginal = useMemo(() => getSharedOriginal(post), [post]);

  const [likes, setLikes] = useState(() => normalizeLikeIds(post?.likes));
  const [liking, setLiking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(() => getInitialSaved(post, myId, postId));
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isLiked = myId ? likes.includes(myId) : false;
  const canEdit = ownerId === myId;

  const created = post?.createdAt
    ? new Date(post.createdAt).toLocaleString()
    : "";

  const commentsCount = post?.commentsCount || post?.comments?.length || 0;
  const shareCount = post?.sharesCount || post?.shares?.length || 0;

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!postId || !myId || liking) return;

    const prev = [...likes];
    const optimistic = isLiked
      ? likes.filter((id) => id !== myId)
      : [...likes, myId];

    setLikes(optimistic);
    setLiking(true);

    try {
      const res = await toggleLikeApi(postId);

      const serverLikes =
        res?.data?.data?.likes ||
        res?.data?.likes ||
        res?.data?.data?.post?.likes ||
        res?.data?.post?.likes ||
        optimistic;

      setLikes(normalizeLikeIds(serverLikes));
    } catch (err) {
      console.log("LIKE ERROR:", err);
      setLikes(prev);
    } finally {
      setLiking(false);
    }
  };

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!postId || !myId || saving) return;

    const prev = saved;
    const next = !prev;

    setSaved(next);
    setSaving(true);

    try {
      await toggleBookmarkApi(postId);
      localStorage.setItem(getSavedKey(myId, postId), next ? "1" : "0");
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.log("BOOKMARK ERROR:", err);
      setSaved(prev);
    } finally {
      setSaving(false);
      setMenuOpen(false);
    }
  };

  const deletePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!postId) return;

    const ok = confirm("Delete this post?");
    if (!ok) return;

    try {
      setDeleting(true);
      await deletePostApi(postId);
      onChanged?.();
    } catch (err) {
      console.log("DELETE ERROR:", err);
      alert(err?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <header className="flex items-center gap-3 p-4">
        <Link to={`/users/${ownerId}`}>
          <Avatar user={{ name: ownerName, photo: ownerPhoto }} />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/users/${ownerId}`}
            className="block truncate text-[15px] font-extrabold text-slate-900 hover:underline"
          >
            {ownerName}
          </Link>

          <p className="text-xs text-slate-500">
            {created} {sharedOriginal ? "• Shared a post" : ""}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((s) => !s);
            }}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 z-20 mt-2 w-40 rounded-xl border bg-white p-2 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={toggleSave}
                disabled={saving}
                className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:opacity-60"
              >
                {saving ? "Saving..." : saved ? "Unsave" : "Save"}
              </button>

              {canEdit && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditOpen(true);
                      setMenuOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={deletePost}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {post?.body && (
        <div className="px-4 pb-3 text-[15px] text-slate-800">
          {post.body}
        </div>
      )}

      {!sharedOriginal && post?.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full max-h-[520px] object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      )}

      {sharedOriginal && <SharedPreview original={sharedOriginal} />}

      <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-slate-500">
        <span>{likes.length} likes</span>

        <div className="flex gap-3">
          <span>{commentsCount} comments</span>
          <span>{shareCount} shares</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t px-2 py-2">
        <button
          type="button"
          onClick={toggleLike}
          disabled={liking}
          className={`flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold hover:bg-blue-100 ${
            isLiked ? "text-blue-700" : "text-slate-700"
          } ${liking ? "opacity-70" : ""}`}
        >
          <ThumbsUp size={18} />
          {isLiked ? "Liked" : "Like"}
        </button>

        <Link
          to={`/posts/${postId}`}
          className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-slate-700 hover:bg-blue-100"
        >
          <MessageCircle size={18} />
          Comment
        </Link>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShareOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-slate-700 hover:bg-blue-100"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>

      <EditPostModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        post={post}
        onUpdated={onChanged}
      />

      <SharePostModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        post={post}
        onShared={onChanged}
      />
    </article>
  );
}

const PostCard = memo(PostCardBase);
export default PostCard;