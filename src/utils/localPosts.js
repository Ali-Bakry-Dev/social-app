import { readScopedArray, writeScopedArray } from "./userScopedStorage.js";

const LOCAL_POSTS_KEY = "localCreatedPosts";

export function getLocalCreatedPosts() {
  return readScopedArray(LOCAL_POSTS_KEY);
}

export function setLocalCreatedPosts(posts) {
  writeScopedArray(LOCAL_POSTS_KEY, Array.isArray(posts) ? posts : []);
}

function makeUserShape(currentUser) {
  if (!currentUser) return null;

  return {
    _id: currentUser?._id || currentUser?.id || currentUser?.email || "",
    id: currentUser?.id || currentUser?._id || currentUser?.email || "",
    name: currentUser?.name || "User",
    email: currentUser?.email || "",
    photo:
      currentUser?.photo ||
      currentUser?.profilePhoto ||
      currentUser?.image ||
      currentUser?.avatar ||
      "",
    profilePhoto:
      currentUser?.profilePhoto ||
      currentUser?.photo ||
      currentUser?.image ||
      currentUser?.avatar ||
      "",
    image:
      currentUser?.image ||
      currentUser?.photo ||
      currentUser?.profilePhoto ||
      currentUser?.avatar ||
      "",
    avatar:
      currentUser?.avatar ||
      currentUser?.photo ||
      currentUser?.profilePhoto ||
      currentUser?.image ||
      "",
  };
}

export function buildLocalPost({
  body = "",
  image = "",
  apiPost = null,
  currentUser = null,
}) {
  const me = makeUserShape(currentUser);

  const id =
    apiPost?._id ||
    apiPost?.id ||
    `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const createdAt = apiPost?.createdAt || new Date().toISOString();

  return {
    ...apiPost,
    _id: id,
    id,
    body: apiPost?.body ?? body ?? "",
    image: apiPost?.image ?? image ?? "",
    createdAt,
    likes: Array.isArray(apiPost?.likes) ? apiPost.likes : [],
    comments: Array.isArray(apiPost?.comments) ? apiPost.comments : [],
    commentsCount: apiPost?.commentsCount ?? apiPost?.comments?.length ?? 0,
    shares: Array.isArray(apiPost?.shares) ? apiPost.shares : [],
    sharesCount: apiPost?.sharesCount ?? apiPost?.shares?.length ?? 0,

    // أهم نقطة: نحقن اليوزر الحالي في كل الأشكال المحتملة
    user: apiPost?.user || apiPost?.postCreator || apiPost?.createdBy || me,
    postCreator: apiPost?.postCreator || apiPost?.user || apiPost?.createdBy || me,
    createdBy: apiPost?.createdBy || apiPost?.user || apiPost?.postCreator || me,

    __isLocal: true,
  };
}

export function addLocalCreatedPost(postLike, currentUser) {
  const normalized = buildLocalPost({
    apiPost: postLike,
    body: postLike?.body || "",
    image: postLike?.image || "",
    currentUser,
  });

  const current = getLocalCreatedPosts();
  const id = normalized?._id || normalized?.id;

  const filtered = current.filter((p) => {
    const pid = p?._id || p?.id;
    return pid !== id;
  });

  const next = [normalized, ...filtered];
  setLocalCreatedPosts(next);
  return next;
}

export function createAndStoreFallbackPost({ body = "", image = "", currentUser }) {
  const post = buildLocalPost({
    body,
    image,
    currentUser,
    apiPost: null,
  });

  return addLocalCreatedPost(post, currentUser);
}

export function updateLocalCreatedPost(updatedPost, currentUser) {
  const normalized = buildLocalPost({
    apiPost: updatedPost,
    body: updatedPost?.body || "",
    image: updatedPost?.image || "",
    currentUser,
  });

  const id = normalized?._id || normalized?.id;
  const current = getLocalCreatedPosts();

  const next = current.map((p) => {
    const pid = p?._id || p?.id;
    return pid === id ? { ...p, ...normalized } : p;
  });

  setLocalCreatedPosts(next);
  return next;
}

export function removeLocalCreatedPost(postId) {
  const current = getLocalCreatedPosts();
  const next = current.filter((p) => {
    const pid = p?._id || p?.id;
    return pid !== postId;
  });

  setLocalCreatedPosts(next);
  return next;
}

export function dedupePostsById(posts = []) {
  const map = new Map();

  posts.forEach((post) => {
    const id = post?._id || post?.id;
    if (!id) return;
    if (!map.has(id)) map.set(id, post);
  });

  return Array.from(map.values());
}