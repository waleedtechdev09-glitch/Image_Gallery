"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Home, ImageIcon, Settings, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { getToken } from "../utils/auth";

interface SidebarProps {
  setActiveView: (view: "dashboard" | "images" | "settings") => void;
  fetchImages: () => Promise<void>;
}

interface Folder {
  _id: string;
  name: string;
}

const SideBar = ({ setActiveView, fetchImages }: SidebarProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const API_URL = "http://localhost:5000";
  const token = getToken();

  // 🔹 Fetch folders from backend
  const fetchFolders = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/api/folders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFolders(res.data);
    } catch (err) {
      console.error("Failed to fetch folders", err);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // 🔹 Create new folder
  const handleAddFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName || !token) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/folders`,
        { name: folderName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setFolders((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to create folder", err);
      alert("Folder creation failed");
    }
  };

  // 🔹 DELETE FOLDER FUNCTION
  const handleDeleteFolder = async (id: string) => {
    if (!token) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this folder?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/folders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // UI se remove kar do
      setFolders((prev) => prev.filter((folder) => folder._id !== id));

      alert("Folder deleted successfully");
    } catch (err) {
      console.error("Failed to delete folder", err);
      alert("Folder deletion failed");
    }
  };

  return (
    <aside className="w-64 bg-white shadow-md p-6 hidden md:flex flex-col h-screen sticky top-0">
      <h2 className="text-2xl font-bold mb-4">Library System</h2>

      {/* + button for folder creation */}
      <div className="mb-4">
        <Button
          onClick={handleAddFolder}
          className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600 cursor-pointer"
        >
          <Plus size={16} /> New Folder
        </Button>
      </div>

      {/* Folders list WITH DELETE BUTTON */}
      <ul className="flex flex-col gap-1 mb-6">
        {folders.map((folder) => (
          <li
            key={folder._id}
            className="flex justify-between items-center text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
          >
            <span className="cursor-pointer">{folder.name}</span>

            <button
              onClick={() => handleDeleteFolder(folder._id)}
              className="text-red-500 hover:text-red-700"
              title="Delete Folder"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 mb-auto">
        <Button
          variant="ghost"
          className="justify-start w-full flex items-center gap-2 cursor-pointer"
          onClick={() => setActiveView("dashboard")}
        >
          <Home size={18} /> Dashboard
        </Button>

        <Button
          variant="ghost"
          className="justify-start w-full flex items-center gap-2 cursor-pointer"
          onClick={async () => {
            setActiveView("images");
            await fetchImages();
          }}
        >
          <ImageIcon size={18} /> My Images
        </Button>

        <Button
          variant="ghost"
          className="justify-start w-full flex items-center gap-2 cursor-pointer"
          onClick={() => setActiveView("settings")}
        >
          <Settings size={18} /> Settings
        </Button>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200 text-sm text-gray-500">
        &copy; 2026 Library System
      </div>
    </aside>
  );
};

export default SideBar;
