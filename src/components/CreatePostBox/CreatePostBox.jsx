import { useRef, useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { createPostApi } from "../../api/posts.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { addLocalCreatedPost } from "../../utils/localPosts.js";

export default function CreatePostBox({ onCreated }) {
  const { user } = useAuth();

  const fileRef = useRef(null);

  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);

  const displayPhoto =
    user?.photo || user?.profilePhoto || user?.image || user?.avatar || "";

  const submit = async () => {
    const text = body.trim();
    if (!text && !file) return;

    try {
      setPosting(true);

      let res;

      if (file) {
        const fd = new FormData();
        fd.append("body", text);
        fd.append("image", file);

        res = await createPostApi(fd);
      } else {
        res = await createPostApi({ body: text });
      }

      const newPost =
        res?.data?.data?.post ||
        res?.data?.post ||
        res?.data?.data ||
        null;

      if (newPost) {
        const enrichedPost = {
          ...newPost,
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
        };

        addLocalCreatedPost(enrichedPost);
      }

      setBody("");
      setFile(null);

      if (fileRef.current) fileRef.current.value = "";

      onCreated?.();
    } catch (err) {
      console.log("CREATE POST ERROR:", err);

      try {
        if (text || file) {
          addLocalCreatedPost({
            body: text,
            image: file ? URL.createObjectURL(file) : null,
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
            createdAt: new Date().toISOString(),
          });
        }
      } catch {}

      alert(err?.response?.data?.message || "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">

      <div className="flex items-start gap-3">

        <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200 shrink-0">
          {displayPhoto ? (
            <img src={displayPhoto} alt="me" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-lg font-extrabold text-slate-700">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">

          <div className="mb-2">
            <p className="truncate text-sm font-extrabold text-slate-900">
              {user?.name || "User"}
            </p>

            <p className="text-xs text-slate-500">
              Share something with your friends
            </p>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "User"}?`}
            className="w-full resize-none rounded-2xl border bg-slate-50 p-4 text-sm outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
            rows={4}
          />

          {file && (
            <div className="mt-3 rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Selected image: <span className="font-semibold">{file.name}</span>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <ImageIcon size={18} />
              Add Photo

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <button
              onClick={submit}
              disabled={posting || (!body.trim() && !file)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              <Send size={16} />
              {posting ? "Posting..." : "Post"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}