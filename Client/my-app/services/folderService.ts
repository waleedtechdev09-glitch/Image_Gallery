import axios from "axios";

const API_URL =
  "http://a8e4f52fd8989452b84e82a64e3bb256-254123936.ap-south-1.elb.amazonaws.com/api/folders";

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
