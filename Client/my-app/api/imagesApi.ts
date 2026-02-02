import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = "http://localhost:5000";

export interface UploadedImage {
  _id: string;
  url: string;
  public_id?: string;
}

export const fetchImagesAPI = async (): Promise<UploadedImage[]> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.get(`${BASE_URL}/api/images`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const uploadImageAPI = async (file: File): Promise<UploadedImage> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("image", file);

  const res = await axios.post(`${BASE_URL}/api/images/upload`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteImageAPI = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  await axios.delete(`${BASE_URL}/api/images/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
