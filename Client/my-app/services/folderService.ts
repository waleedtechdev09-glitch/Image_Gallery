import axios from "axios";

const API_URL = "http://localhost:5000";

export const getToken = () => localStorage.getItem("token");

export const fetchFoldersAPI = async (token: string) => {
  const res = await axios.get(`${API_URL}/api/folders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createFolderAPI = async (
  name: string,
  parentId: string | null,
  token: string,
) => {
  const res = await axios.post(
    `${API_URL}/api/folders`,
    { name, parentId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

export const deleteFolderAPI = async (folderId: string, token: string) => {
  await axios.delete(`${API_URL}/api/folders/${folderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
