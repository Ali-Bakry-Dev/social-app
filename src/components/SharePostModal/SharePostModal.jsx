import { useState } from "react";
import { X, Share2 } from "lucide-react";
import { sharePostApi } from "../../api/posts.js";
import {
  getPostOwnerName,
  getPostOwnerPhoto,
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
      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 font-extrabold text-slate-700">
        {letter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={user?.name || "user"}
      onError={() => setBroken(true)}
      className="h-10 w-10 rounded-full object-cover"
    />
  );
}

export default function SharePostModal({ open, onClose, post, onShared }) {
  const [sharing, setSharing] = useState(false);

  if (!open || !post) return null;

  const ownerName = getPostOwnerName(post);
  const ownerPhoto = getPostOwnerPhoto(post);

  const handleShare = async () => {
    try {
      setSharing(true);
      const res = await sharePostApi(post._id || post.id);

      const sharedPost =
        res?.data?.data?.post ||
        res?.data?.data?.sharedPost ||
        res?.data?.data ||
        res?.data?.post ||
        res?.data ||
        null;

      onShared?.(sharedPost);
      onClose?.();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to share post");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-extrabold text-slate-900">Share post</h3>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <Avatar user={{ name: ownerName, photo: ownerPhoto }} />
              <div>
                <p className="text-sm font-extrabold text-slate-900">{ownerName}</p>
                <p className="text-xs text-slate-500">Original post</p>
              </div>
            </div>

            {post?.body && (
              <p className="mb-3 text-sm leading-6 text-slate-800">{post.body}</p>
            )}

            {post?.image && (
              <img
                src={post.image}
                alt="post"
                className="max-h-[360px] w-full rounded-2xl object-cover"
              />
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              <Share2 size={16} />
              {sharing ? "Sharing..." : "Share now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}