export const getPostId = (post) => {
  return post?._id || post?.id || post?.postId || null;
};

export const getPostOwner = (post) => {
  return (
    post?.user ||
    post?.owner ||
    post?.createdBy ||
    post?.author ||
    null
  );
};

export const getPostOwnerId = (post) => {
  const owner = getPostOwner(post);

  return (
    owner?._id ||
    owner?.id ||
    post?.userId ||
    post?.ownerId ||
    null
  );
};

export const getPostOwnerName = (post) => {
  const owner = getPostOwner(post);

  return (
    owner?.name ||
    owner?.username ||
    owner?.email ||
    "User"
  );
};

export const getPostOwnerPhoto = (post) => {
  const owner = getPostOwner(post);

  return (
    owner?.photo ||
    owner?.profilePhoto ||
    owner?.image ||
    owner?.avatar ||
    ""
  );
};

export const normalizeName = (name) => {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
};

export const isSameUser = (post, user, userId) => {
  const ownerId = getPostOwnerId(post);

  if (!ownerId) return false;

  if (userId && ownerId === userId) return true;

  const owner = getPostOwner(post);

  if (!owner) return false;

  if (user?.email && owner?.email === user.email) return true;

  if (user?.name && owner?.name === user.name) return true;

  return false;
};

export const normalizePostsResponse = (res) => {
  if (!res) return [];

  if (Array.isArray(res.data)) return res.data;

  if (Array.isArray(res.data?.data)) return res.data.data;

  if (Array.isArray(res.data?.posts)) return res.data.posts;

  if (Array.isArray(res.data?.data?.posts)) return res.data.data.posts;

  return [];
};

export const dedupePosts = (posts) => {
  const map = new Map();

  posts.forEach((p) => {
    const id = getPostId(p);
    if (!id) return;

    map.set(id, p);
  });

  return Array.from(map.values());
};