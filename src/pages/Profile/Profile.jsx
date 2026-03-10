import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../layouts/AppLayout/AppLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  uploadProfilePhotoApi,
  uploadCoverPhotoApi,
} from "../../api/users.js";
import PostCard from "../../components/PostCard/PostCard.jsx";
import { getPostId, isSameUser } from "../../utils/postHelpers.js";
import {
  Camera,
  Image as ImageIcon,
  Info,
  Users,
  Bookmark,
} from "lucide-react";
import { fetchAllPosts } from "../../utils/fetchAllPosts.js";
import {
  dedupePostsById,
  getLocalCreatedPosts,
} from "../../utils/localPosts.js";
import { getSavedIdsForUser } from "../../utils/saved.js";

const getCoverKey = (userId) => `cover:${userId}`;

function ProfilePostsTabs({ activeTab, user, userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const serverPosts = await fetchAllPosts();
      const localPosts = getLocalCreatedPosts();
      const all = dedupePostsById([...localPosts, ...serverPosts]);

      if (activeTab === "saved") {
        const savedIds = getSavedIdsForUser(userId);

        setPosts(
          all.filter((post) => {
            const id = post?._id || post?.id;
            return savedIds.includes(id);
          })
        );
      } else {
        setPosts(all.filter((post) => isSameUser(post, user, userId)));
      }
    } catch (e) {
      console.log("PROFILE POSTS ERROR:", e);

      const localPosts = getLocalCreatedPosts();

      if (activeTab === "saved") {
        const savedIds = getSavedIdsForUser(userId);

        setPosts(
          localPosts.filter((post) => {
            const id = post?._id || post?.id;
            return savedIds.includes(id);
          })
        );
      } else {
        setPosts(localPosts.filter((post) => isSameUser(post, user, userId)));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const onStorage = () => load();
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, [activeTab, user?.name, user?.email, userId]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
        Loading...
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500 shadow-sm">
        {activeTab === "saved" ? "No saved posts yet." : "No posts yet."}
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

export default function Profile() {
  const { user, userId, saveSession, token } = useAuth();

  const myId = userId;

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [myPostsCount, setMyPostsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [coverPreview, setCoverPreview] = useState("");

  const displayPhoto =
    user?.photo || user?.profilePhoto || user?.image || user?.avatar || "";

  const coverUrl = useMemo(() => {
    if (!myId) return "";

    return (
      coverPreview ||
      user?.cover ||
      user?.coverPhoto ||
      user?.cover_image ||
      localStorage.getItem(getCoverKey(myId)) ||
      ""
    );
  }, [myId, coverPreview, user?.cover, user?.coverPhoto, user?.cover_image]);

  useEffect(() => {
    const loadCount = async () => {
      if (!user) {
        setMyPostsCount(0);
        setSavedCount(0);
        return;
      }

      try {
        const serverPosts = await fetchAllPosts();
        const localPosts = getLocalCreatedPosts();
        const all = dedupePostsById([...localPosts, ...serverPosts]);

        setMyPostsCount(
          all.filter((post) => isSameUser(post, user, userId)).length
        );
        setSavedCount(getSavedIdsForUser(userId).length);
      } catch (e) {
        console.log("PROFILE COUNT ERROR:", e);

        const localPosts = getLocalCreatedPosts();

        setMyPostsCount(
          localPosts.filter((post) => isSameUser(post, user, userId)).length
        );
        setSavedCount(getSavedIdsForUser(userId).length);
      }
    };

    loadCount();

    const onStorage = () => loadCount();
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, [user?.name, user?.email, userId]);

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);

      const res = await uploadProfilePhotoApi(file);

      const newUser =
        res?.data?.data?.user || res?.data?.data || res?.data?.user || null;

      const newToken = res?.data?.data?.token || res?.data?.token || token;

      saveSession(newToken, newUser || user);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const onPickCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !myId) return;

    try {
      setUploadingCover(true);

      const res = await uploadCoverPhotoApi(file);

      const nextCover =
        res?.data?.data?.cover ||
        res?.data?.data?.coverPhoto ||
        res?.data?.data?.cover_image ||
        res?.data?.data?.user?.cover ||
        res?.data?.data?.user?.coverPhoto ||
        res?.data?.data?.user?.cover_image ||
        res?.data?.cover ||
        res?.data?.coverPhoto ||
        res?.data?.cover_image ||
        res?.data?.user?.cover ||
        res?.data?.user?.coverPhoto ||
        res?.data?.user?.cover_image ||
        "";

      if (!nextCover) {
        alert("Cover uploaded but url not found");
        return;
      }

      localStorage.setItem(getCoverKey(myId), nextCover);
      setCoverPreview(nextCover);

      saveSession(token, {
        ...user,
        cover: nextCover,
        coverPhoto: nextCover,
        cover_image: nextCover,
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update cover");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const tabClass = (isActive) =>
    `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-blue-50 text-blue-800"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="relative h-64 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700" />
            )}

            <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-white">
              <ImageIcon size={18} />
              {uploadingCover ? "Uploading..." : "Edit cover"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickCover}
              />
            </label>
          </div>

          <div className="relative px-6 pb-6">
            <div className="-mt-16 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-[5px] border-white bg-slate-200 shadow-md">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt="profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-5xl font-extrabold text-slate-700">
                        {(user?.name?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </div>

                  <label className="absolute bottom-2 right-1 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-blue-800 text-white shadow hover:bg-blue-900">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickPhoto}
                    />
                  </label>
                </div>

                <div className="pb-2">
                  <h1 className="truncate text-3xl font-extrabold text-slate-900">
                    {user?.name || "User"}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    @{(user?.name || "user").replace(/\s+/g, "").toLowerCase()}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {uploadingPhoto
                      ? "Uploading profile photo..."
                      : "Personal profile"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Following
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">0</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Followers
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">0</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Posts
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {myPostsCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("posts")}
                  className={tabClass(activeTab === "posts")}
                >
                  My Posts
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("about")}
                  className={tabClass(activeTab === "about")}
                >
                  <Info size={16} />
                  About
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("saved")}
                  className={tabClass(activeTab === "saved")}
                >
                  <Bookmark size={16} />
                  Saved
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "about" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-slate-600" />
                <p className="font-extrabold text-slate-900">About</p>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div>
                  <p className="text-slate-400">Name</p>
                  <p className="font-semibold text-slate-900">
                    {user?.name || "User"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Email</p>
                  <p className="font-semibold text-slate-900">
                    {user?.email || "No email"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-600" />
                <p className="font-extrabold text-slate-900">Stats</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-slate-400">Posts</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {myPostsCount}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-slate-400">Saved</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {savedCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ProfilePostsTabs
            activeTab={activeTab}
            user={user}
            userId={userId}
          />
        )}
      </div>
    </AppLayout>
  );
}