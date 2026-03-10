const KEY = "followedUsers";

export const getFollowedIds = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const isFollowing = (userId) => {
  return getFollowedIds().includes(userId);
};

export const toggleFollow = (userId) => {
  const ids = getFollowedIds();

  const next = ids.includes(userId)
    ? ids.filter((x) => x !== userId)
    : [userId, ...ids];

  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
};