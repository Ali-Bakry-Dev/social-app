import api from "./axios.js";
export const loginApi = (data) => api.post("/users/signin", data);
export const registerApi = (data) => api.post("/users/signup", data);
export const profileApi = () => api.get("/users/profile-data");