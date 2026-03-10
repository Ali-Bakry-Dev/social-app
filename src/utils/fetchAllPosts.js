import { getPostsApi } from "../api/posts.js";
import { normalizePostsResponse, dedupePosts } from "./postHelpers.js";

let postsCache = [];
let cachedPages = 0;
let pendingPromise = null;

export async function fetchPostsPages(targetPages = 1, limit = 20) {
  if (cachedPages >= targetPages) {
    return postsCache;
  }

  if (pendingPromise) {
    await pendingPromise;
    return postsCache;
  }

  pendingPromise = (async () => {
    try {
      let all = [...postsCache];
      const startPage = cachedPages + 1;

      for (let page = startPage; page <= targetPages; page++) {
        const res = await getPostsApi(page, limit);
        const arr = normalizePostsResponse(res);

        if (!Array.isArray(arr) || arr.length === 0) {
          break;
        }

        all = dedupePosts([...all, ...arr]);
        cachedPages = page;

        if (arr.length < limit) {
          break;
        }
      }

      postsCache = all;
    } finally {
      pendingPromise = null;
    }
  })();

  await pendingPromise;
  return postsCache;
}

export async function fetchAllPosts() {
  return fetchPostsPages(10, 20);
}

export function clearPostsCache() {
  postsCache = [];
  cachedPages = 0;
  pendingPromise = null;
}

export function getCachedPosts() {
  return postsCache;
}