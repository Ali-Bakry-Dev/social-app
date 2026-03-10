import api from "./axios.js";

export const getMyProfileApi = () => api.get("/users/profile-data");

export const uploadProfilePhotoApi = (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  return api.put("/users/upload-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadCoverPhotoApi = (file) => {
  const formData = new FormData();
  formData.append("cover", file);

  return api.put("/users/upload-cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export const changePasswordApi = (data) => {
  return api.patch("/users/change-password", data);
};