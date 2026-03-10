import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "../../api/notifications.js";
import {
  Bell,
  Check,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
} from "lucide-react";

function getNotifId(n) {
  return n?._id || n?.id || "";
}

function getActor(n) {
  return (
    n?.user ||
    n?.from ||
    n?.sender ||
    n?.createdBy ||
    n?.notifier ||
    n?.actor ||
    n?.owner ||
    null
  );
}

function getActorName(n) {
  const actor = getActor(n);
  return actor?.name || actor?.username || actor?.email || "";
}

function getActorPhoto(n) {
  const actor = getActor(n);
  return (
    actor?.photo ||
    actor?.profilePhoto ||
    actor?.image ||
    actor?.avatar ||
    ""
  );
}

function getPostIdFromNotification(n) {
  return (
    n?.post?._id ||
    n?.post?.id ||
    n?.postId ||
    n?.relatedPost?._id ||
    n?.relatedPost?.id ||
    n?.targetPost?._id ||
    n?.targetPost?.id ||
    n?.entityId ||
    ""
  );
}

function getCommentText(n) {
  return (
    n?.comment?.content ||
    n?.comment?.body ||
    n?.content ||
    n?.body ||
    n?.text ||
    ""
  );
}

function getType(n) {
  const raw = String(
    n?.type || n?.action || n?.eventType || n?.kind || n?.notificationType || ""
  ).toLowerCase();

  const msg = String(n?.message || "").toLowerCase();

  if (raw.includes("comment") || msg.includes("comment")) return "comment";
  if (raw.includes("like") || msg.includes("like")) return "like";
  if (raw.includes("share") || msg.includes("share")) return "share";
  if (raw.includes("follow") || msg.includes("follow")) return "follow";
  return "general";
}

function buildMessage(n) {
  const actorName = getActorName(n) || "User";
  const type = getType(n);
  const commentText = getCommentText(n);

  if (type === "comment") {
    return {
      title: `${actorName} commented on your post`,
      sub: commentText || "",
    };
  }

  if (type === "like") {
    return {
      title: `${actorName} liked your post`,
      sub: "",
    };
  }

  if (type === "share") {
    return {
      title: `${actorName} shared your post`,
      sub: "",
    };
  }

  if (type === "follow") {
    return {
      title: `${actorName} started following you`,
      sub: "",
    };
  }

  return {
    title: n?.message || `${actorName} sent you a notification`,
    sub: commentText || "",
  };
}

function isReadValue(n) {
  return Boolean(n?.read || n?.isRead || n?.seen);
}

function getCreatedAt(n) {
  return n?.createdAt || n?.updatedAt || n?.date || "";
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

function TypeIcon({ type }) {
  if (type === "like") return <Heart size={16} className="text-rose-500" />;
  if (type === "comment") return <MessageCircle size={16} className="text-sky-500" />;
  if (type === "share") return <Share2 size={16} className="text-violet-500" />;
  if (type === "follow") return <UserPlus size={16} className="text-emerald-500" />;
  return <Bell size={16} className="text-blue-500" />;
}

function Avatar({ notification }) {
  const [broken, setBroken] = useState(false);
  const photo = getActorPhoto(notification);
  const name = getActorName(notification);
  const letter = (name?.[0] || "U").toUpperCase();

  if (!photo || broken) {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
        {letter}
      </div>
    );
  }

  return (
    <img
      src={photo}
      alt={name}
      className="h-12 w-12 rounded-full object-cover"
      onError={() => setBroken(true)}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      const res = await getNotificationsApi();

      const data =
        res?.data?.data?.notifications ||
        res?.data?.data ||
        res?.data?.notifications ||
        res?.data ||
        [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("NOTIFICATIONS ERROR:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !isReadValue(n)).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (tab === "unread") {
      return notifications.filter((n) => !isReadValue(n));
    }
    return notifications;
  }, [notifications, tab]);

  const markRead = async (id) => {
    const prev = notifications;

    setNotifications((current) =>
      current.map((n) =>
        getNotifId(n) === id ? { ...n, read: true, isRead: true, seen: true } : n
      )
    );

    setBusyId(id);

    try {
      await markNotificationReadApi(id);
    } catch (err) {
      console.log("MARK READ ERROR:", err);
      setNotifications(prev);
    } finally {
      setBusyId("");
    }
  };

  const markAll = async () => {
    const prev = notifications;

    setNotifications((current) =>
      current.map((n) => ({ ...n, read: true, isRead: true, seen: true }))
    );

    setMarkingAll(true);

    try {
      await markAllNotificationsReadApi();
    } catch (err) {
      console.log("MARK ALL READ ERROR:", err);
      setNotifications(prev);
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = async (notification) => {
    const id = getNotifId(notification);
    const postId = getPostIdFromNotification(notification);

    if (!isReadValue(notification) && id) {
      try {
        await markNotificationReadApi(id);
        setNotifications((current) =>
          current.map((n) =>
            getNotifId(n) === id ? { ...n, read: true, isRead: true, seen: true } : n
          )
        );
      } catch (err) {
        console.log("OPEN NOTIFICATION READ ERROR:", err);
      }
    }

    if (postId) {
      navigate(`/posts/${postId}`);
      return;
    }

    const actor = getActor(notification);
    const actorId = actor?._id || actor?.id || "";
    if (actorId) {
      navigate(`/users/${actorId}`);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="border-b px-5 py-5">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                    <h1 className="text-2xl font-extrabold [html.theme-light_&]:text-blue-800 [html.theme-dark_&]:text-sky-300">
  Notifications
</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Realtime updates for likes, comments, shares, and follows.
                </p>
              </div>

              <button
                type="button"
                onClick={markAll}
                disabled={!notifications.length || markingAll}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <Check size={16} />
                {markingAll ? "Marking..." : "Mark all as read"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  tab === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setTab("unread")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                  tab === "unread"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Unread</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    tab === "unread" ? "bg-white/20 text-white" : "bg-white text-blue-600"
                  }`}
                >
                  {unreadCount}
                </span>
              </button>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((n) => {
                  const id = getNotifId(n);
                  const type = getType(n);
                  const read = isReadValue(n);
                  const msg = buildMessage(n);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => openNotification(n)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        read
                          ? "border-slate-200 bg-white hover:bg-slate-50"
                          : "border-blue-100 bg-blue-50/70 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar notification={n} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm text-slate-800">
                                <span className="font-extrabold text-slate-900">
                                  {msg.title}
                                </span>
                              </p>

                              {msg.sub ? (
                                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                  {msg.sub}
                                </p>
                              ) : null}

                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 text-slate-500">
                                  <TypeIcon type={type} />
                                  <span className="text-xs">{formatTime(getCreatedAt(n))}</span>
                                </div>

                                {!read && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markRead(id);
                                    }}
                                    disabled={busyId === id}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-slate-50 disabled:opacity-60"
                                  >
                                    <Check size={14} />
                                    {busyId === id ? "Marking..." : "Mark as read"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {!read && (
                              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}