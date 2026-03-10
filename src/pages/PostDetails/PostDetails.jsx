import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import PostCard from "../../components/PostCard/PostCard.jsx";
import { getPostByIdApi, getPostCommentsApi } from "../../api/posts.js";
import {
  createCommentApi,
  deleteCommentApi,
  updateCommentApi,
} from "../../api/comments.js";
import { useAuth } from "../../context/AuthContext.jsx";

function getCommentOwner(comment) {
  return comment?.commentCreator || comment?.user || comment?.createdBy || null;
}

function getCommentOwnerId(comment) {
  const owner = getCommentOwner(comment);
  return owner?._id || owner?.id || "";
}

function getCommentOwnerName(comment) {
  const owner = getCommentOwner(comment);
  return owner?.name || "User";
}

function getCommentOwnerPhoto(comment) {
  const owner = getCommentOwner(comment);
  return owner?.photo || owner?.profilePhoto || owner?.image || owner?.avatar || "";
}

export default function PostDetails() {
  const { id } = useParams();
  const { userId } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const [editingId, setEditingId] = useState("");
  const [editingBody, setEditingBody] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const [postRes, commentsRes] = await Promise.all([
        getPostByIdApi(id),
        getPostCommentsApi(id),
      ]);

      const postData =
        postRes?.data?.data?.post || postRes?.data?.data || postRes?.data?.post || null;

      const commentsData =
        commentsRes?.data?.data?.comments ||
        commentsRes?.data?.data ||
        commentsRes?.data?.comments ||
        [];

      setPost(postData);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (e) {
      console.log("POST DETAILS ERROR:", e);
      setPost(null);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;

    try {
      setSending(true);
      await createCommentApi(id, { content: text });
      setBody("");
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to comment");
    } finally {
      setSending(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment?._id || comment?.id || "");
    setEditingBody(comment?.content || comment?.body || "");
  };

  const saveEdit = async () => {
    const text = editingBody.trim();
    if (!editingId || !text) return;

    try {
      await updateCommentApi(id, editingId, { content: text });
      setEditingId("");
      setEditingBody("");
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update comment");
    }
  };

  const removeComment = async (commentId) => {
    try {
      await deleteCommentApi(id, commentId);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-slate-500">
          Loading...
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="rounded-2xl border bg-white p-6 shadow-sm text-slate-500">
          Post not found.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <PostCard post={post} onChanged={load} />

        <form onSubmit={submitComment} className="rounded-2xl border bg-white p-4 shadow-sm">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Write a comment..."
            className="w-full rounded-2xl border bg-slate-50 p-4 text-sm outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {sending ? "Posting..." : "Comment"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.map((comment, idx) => {
            const commentId = comment?._id || comment?.id || idx;
            const ownerId = getCommentOwnerId(comment);
            const canEdit = ownerId && ownerId === userId;
            const ownerPhoto = getCommentOwnerPhoto(comment);
            const ownerName = getCommentOwnerName(comment);

            return (
              <div key={commentId} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                    {ownerPhoto ? (
                      <img src={ownerPhoto} alt={ownerName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-bold text-slate-700">
                        {(ownerName?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{ownerName}</p>

                    {editingId === commentId ? (
                      <>
                        <textarea
                          value={editingBody}
                          onChange={(e) => setEditingBody(e.target.value)}
                          rows={3}
                          className="mt-2 w-full rounded-2xl border bg-slate-50 p-3 text-sm outline-none"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId("");
                              setEditingBody("");
                            }}
                            className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-700">
                        {comment?.content || comment?.body || ""}
                      </p>
                    )}

                    {canEdit && editingId !== commentId && (
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(comment)}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeComment(commentId)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {comments.length === 0 && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm text-slate-500">
              No comments yet.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}