import { useEffect, useRef, useState } from "react";
import { X, Image } from "lucide-react";
import { updatePostApi } from "../../api/posts";

export default function EditPostModal({ open, onClose, post, onUpdated }) {
  const fileRef = useRef(null);
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && post) {
      setBody(post.body || "");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [open, post]);

  if (!open) return null;

  const save = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("body", body);
      if (file) fd.append("image", file);

      await updatePostApi(post._id, fd);
      onUpdated?.();
      onClose?.();
    } catch (e) {
      console.log("UPDATE ERROR:", e);
      alert(e?.response?.data?.message || "Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 p-4 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-extrabold text-slate-900">Edit post</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-slate-100 grid place-items-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <textarea
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-2xl border bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-blue-200"
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900"
            >
              <Image size={18} /> Change photo
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {file && <p className="text-xs text-slate-500">Selected: {file.name}</p>}
        </div>
      </div>
    </div>
  );
}