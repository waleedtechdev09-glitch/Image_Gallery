"use client";

import { useRef } from "react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { Button } from "./ui/button";

interface UploadProps {
  folderId: string | null;
  onUploaded: () => void;
}

const UploadZone = ({ folderId, onUploaded }: UploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = "http://localhost:5000";
  const token = getToken();

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!token) return alert("Not authenticated");

    const formData = new FormData();
    Array.from(e.target.files).forEach((file) =>
      formData.append("images", file),
    );
    if (folderId) formData.append("folderId", folderId);

    try {
      await axios.post(`${API_URL}/api/images/upload-multiple`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Uploaded successfully!");
      onUploaded();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <>
      <Button
        onClick={handleUploadClick}
        className="fixed bottom-6 right-6 bg-blue-500 text-white hover:bg-blue-600 rounded-full px-6 py-3 shadow-lg"
      >
        Upload Images
      </Button>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default UploadZone;
