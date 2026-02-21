import axios from "axios";

const API_URL = "http://dlsystem.duckdns.org/api";

export const getToken = () => localStorage.getItem("token");

export const fetchFoldersAPI = async (token: string) => {
  const res = await axios.get(`${API_URL}/folders`, {
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
    `${API_URL}/folders`,
    { name, parentId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

export const deleteFolderAPI = async (folderId: string, token: string) => {
  await axios.delete(`${API_URL}/folders/${folderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
