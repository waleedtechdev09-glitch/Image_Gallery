import axios from "axios";

const API_URL = "http://dlsystem.duckdns.org/api";

export const getToken = () => localStorage.getItem("token");

// FOLDER FETCHING
export const fetchFoldersAPI = async (token: string) => {
  const res = await axios.get(`${API_URL}/folders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// IMAGE FETCHING
export const fetchImagesAPI = async (
  token: string,
  folderId?: string | null,
) => {
  const url = folderId
    ? `${API_URL}/images?folderId=${folderId}`
    : `${API_URL}/images`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// BREADCRUMB FETCHING
export const fetchBreadcrumbAPI = async (token: string, folderId: string) => {
  const res = await axios.get(`${API_URL}/folders/path/${folderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.path;
};

// RESOLVED FOLDER PATH
export const resolveFolderPathAPI = async (
  token: string,
  pathArray: string[],
) => {
  const res = await axios.post(
    `${API_URL}/folders/resolve-path`,
    { path: pathArray },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data.folderId;
};

// UPLOAD IMAGE
export const uploadImagesAPI = async (
  token: string,
  files: File[],
  folderId?: string,
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  if (folderId) formData.append("folderId", folderId);

  await axios.post(`${API_URL}/images/upload-multiple`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// DELETE IMAGE
export const deleteImageAPI = async (token: string, id: string) => {
  await axios.delete(`${API_URL}/images/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

//NEW: MANUAL RESIZE IMAGE API
export const resizeImageAPI = async (
  token: string,
  id: string,
  targetSize: number,
) => {
  const res = await axios.post(
    `${API_URL}/images/resize/${id}`,
    { targetSize },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
};
