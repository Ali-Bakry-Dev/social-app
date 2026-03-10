import api from "./axios.js";

export const getNotificationsApi = () => api.get("/notifications");

export const markNotificationReadApi = (id) =>
  api.put(`/notifications/${id}/read`);

export const markAllNotificationsReadApi = () =>
  api.put("/notifications/read-all");