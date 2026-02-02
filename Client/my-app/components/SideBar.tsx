"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Home, ImageIcon, Settings, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { getToken } from "../utils/auth";

interface SidebarProps {
  setActiveView: (view: "dashboard" | "images" | "settings") => void;
  fetchImages: () => Promise<void>;
  selectedFolder: string | null;
  setSelectedFolder: (id: string | null) => void;
}

interface Folder {
  _id: string;
  name: string;
}

const SideBar = ({
  setActiveView,
  fetchImages,
  selectedFolder,
  setSelectedFolder,
}: SidebarProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const API_URL = "http://localhost:5000";
  const token = getToken();

  const fetchFolders = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/folders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleAddFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name || !token) return;
    try {
      const res = await axios.post(
        `${API_URL}/api/folders`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update folders instantly
      setFolders((prev) => [...prev, res.data]);
      setSelectedFolder(res.data._id);

      // Fetch images for the new folder
      await fetchImages();
    } catch (err) {
      console.error(err);
      alert("Failed to create folder");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Delete this folder and all its images?")) return;
    try {
      await axios.delete(`${API_URL}/api/folders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFolders((prev) => prev.filter((f) => f._id !== id));

      if (selectedFolder === id) setSelectedFolder(null);

      await fetchImages(); // refresh images grid
    } catch (err) {
      console.error(err);
      alert("Folder deletion failed");
    }
  };

  const handleSelectFolder = async (id: string) => {
    setSelectedFolder(id); // update selected folder
    await fetchImages(); // immediately fetch images for this folder
  };

  return (
    <aside className="w-64 bg-white shadow-md p-6 hidden md:flex flex-col h-screen sticky top-0">
      <h2 className="text-2xl font-bold mb-4">Library System</h2>

      <Button
        onClick={handleAddFolder}
        className="flex items-center gap-2 bg-green-500 text-white mb-4"
      >
        <Plus size={16} /> New Folder
      </Button>

      <ul className="flex flex-col gap-1 mb-6">
        {folders.map((f) => (
          <li
            key={f._id}
            className="flex justify-between items-center px-2 py-1 rounded hover:bg-gray-100"
          >
            <span
              className={`cursor-pointer ${
                selectedFolder === f._id ? "font-semibold" : ""
              }`}
              onClick={() => handleSelectFolder(f._id)}
            >
              {f.name}
            </span>
            <button
              onClick={() => handleDeleteFolder(f._id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <nav className="flex flex-col gap-3 mb-auto">
        <Button
          variant="ghost"
          className="justify-start"
          onClick={() => setActiveView("dashboard")}
        >
          <Home size={18} /> Dashboard
        </Button>
        <Button
          variant="ghost"
          className="justify-start"
          onClick={async () => {
            setActiveView("images");
            await fetchImages();
          }}
        >
          <ImageIcon size={18} /> My Images
        </Button>
        <Button
          variant="ghost"
          className="justify-start"
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
