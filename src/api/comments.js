import api from "./axios.js";


export const createCommentApi = (postId, payload) =>
  api.post(`/posts/${postId}/comments`, payload);


export const updateCommentApi = (postId, commentId, payload) =>
  api.put(`/posts/${postId}/comments/${commentId}`, payload);

export const deleteCommentApi = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);