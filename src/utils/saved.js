export function getSavedKey(userId, postId) {
  return `saved-ui:${userId}:${postId}`;
}

export function isSaved(post, userId) {
  const postId = post?._id || post?.id;
  if (!userId || !postId) return false;

  try {
    return localStorage.getItem(getSavedKey(userId, postId)) === "1";
  } catch {
    return false;
  }
}

export function getSavedIdsForUser(userId) {
  if (!userId) return [];

  try {
    const ids = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const prefix = `saved-ui:${userId}:`;
      if (key.startsWith(prefix) && localStorage.getItem(key) === "1") {
        ids.push(key.slice(prefix.length));
      }
    }

    return ids;
  } catch {
    return [];
  }
}