import { useState } from "react";
import { Send, X } from "lucide-react";
import { createPostApi } from "../../api/posts.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { addLocalCreatedPost } from "../../utils/localPosts.js";

function getOwnerName(post) {
  return (
    post?.user?.name ||
    post?.createdBy?.name ||
    post?.owner?.name ||
    post?.postCreator?.name ||
    "User"
  );
}

function getOwnerPhoto(post) {
  return (
    post?.user?.photo ||
    post?.user?.profilePhoto ||
    post?.user?.image ||
    post?.user?.avatar ||
    post?.createdBy?.photo ||
    post?.owner?.photo ||
    post?.postCreator?.photo ||
    ""
  );
}

export default function SharePostModal({ open, onClose, post, onShared }) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [sharing, setSharing] = useState(false);

  if (!open) return null;

  const myPhoto =
    user?.photo || user?.profilePhoto || user?.image || user?.avatar || "";

  const originalOwnerName = getOwnerName(post);
  const originalOwnerPhoto = getOwnerPhoto(post);

  const handleShare = async () => {
    if (sharing) return;

    try {
      setSharing(true);

      const res = await createPostApi({
        body: body.trim(),
      });

      const newPost =
        res?.data?.data?.post ||
        res?.data?.post ||
        res?.data?.data ||
        null;

      if (newPost) {
        const enrichedSharedPost = {
          ...newPost,
          body: body.trim(),
          user: {
            _id: user?._id || user?.id,
            name: user?.name,
            email: user?.email,
            photo:
              user?.photo ||
              user?.profilePhoto ||
              user?.image ||
              user?.avatar ||
              "",
          },
          sharedPost: post,
        };

        addLocalCreatedPost(enrichedSharedPost);
      }

      setBody("");
      onShared?.();
      onClose?.();
    } catch (err) {
      console.log("SHARE ERROR:", err?.response?.data || err);
      alert(err?.response?.data?.message || "Failed to share post");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-extrabold text-slate-900">Share post</h2>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-full bg-slate-200">
              {myPhoto ? (
                <img
                  src={myPhoto}
                  alt="me"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center font-bold text-slate-700">
                  {(user?.name?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500">Share to your feed</p>
            </div>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Say something about this..."
            rows={4}
            className="w-full resize-none rounded-2xl border bg-slate-50 p-4 text-sm outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-4 overflow-hidden rounded-2xl border bg-slate-50">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                {originalOwnerPhoto ? (
                  <img
                    src={originalOwnerPhoto}
                    alt={originalOwnerName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center font-bold text-slate-700">
                    {(originalOwnerName?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-extrabold text-slate-900">
                  {originalOwnerName}
                </p>
                <p className="text-xs text-slate-500">Original post</p>
              </div>
            </div>

            {post?.body && (
              <div className="px-4 pb-3 text-sm text-slate-800">
                {post.body}
              </div>
            )}

            {post?.image && (
              <img
                src={post.image}
                alt="shared post"
                className="max-h-[420px] w-full object-cover"
              />
            )}
          </div>

          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <Send size={16} />
            {sharing ? "Sharing..." : "Share now"}
          </button>
        </div>
      </div>
    </div>
  );
}