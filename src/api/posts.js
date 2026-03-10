import api from "./axios.js";

export const getPostsApi = (page = 1, limit = 20) =>
  api.get(`/posts?page=${page}&limit=${limit}`);

export const getPostByIdApi = (id) =>
  api.get(`/posts/${id}`);

export const getPostCommentsApi = (postId, page = 1, limit = 20) =>
  api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);

export const createPostApi = (payload) =>
  api.post("/posts", payload);

export const updatePostApi = (postId, payload) =>
  api.put(`/posts/${postId}`, payload);

export const deletePostApi = (postId) =>
  api.delete(`/posts/${postId}`);

export const toggleLikeApi = (postId) =>
  api.put(`/posts/${postId}/like`);

export const toggleBookmarkApi = (postId) =>
  api.put(`/posts/${postId}/bookmark`);

export const sharePostApi = (postId) =>
  api.post(`/posts/${postId}/share`);