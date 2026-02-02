"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Home, ImageIcon, Settings, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { getToken } from "../utils/auth";
import { useRouter } from "next/navigation";

interface SidebarProps {
  setActiveView: (view: "dashboard" | "images" | "settings") => void;
  fetchImages: (folderId?: string | null) => Promise<void>;
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
  const router = useRouter();

  // ------------------ Fetch folders ------------------
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

  // ------------------ Add folder ------------------
  const handleAddFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name || !token) return;
    try {
      const res = await axios.post(
        `${API_URL}/api/folders`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Add folder to state
      setFolders((prev) => [...prev, res.data]);

      // Select new folder & update route
      setSelectedFolder(res.data._id);
      router.push(`/homePage/${res.data._id}`);

      // Fetch images for the new folder
      await fetchImages(res.data._id);
    } catch (err) {
      console.error(err);
      alert("Failed to create folder");
    }
  };

  // ------------------ Delete folder ------------------
  const handleDeleteFolder = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Delete this folder and all its images?")) return;
    try {
      await axios.delete(`${API_URL}/api/folders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFolders((prev) => prev.filter((f) => f._id !== id));

      // If deleted folder was selected, clear selection & go default route
      if (selectedFolder === id) {
        setSelectedFolder(null);
        router.push(`/homePage`);
      }

      await fetchImages(null); // refresh images grid
    } catch (err) {
      console.error(err);
      alert("Folder deletion failed");
    }
  };

  // ------------------ Select folder ------------------
  const handleSelectFolder = async (id: string) => {
    setSelectedFolder(id);
    router.push(`/homePage/${id}`);
    await fetchImages(id);
  };

  return (
    <aside className="w-64 bg-white shadow-md p-6 hidden md:flex flex-col h-screen sticky top-0">
      <h2 className="text-2xl font-bold mb-4">Library System</h2>

      <Button
        onClick={handleAddFolder}
        className="flex items-center gap-2 bg-green-500 text-white mb-4 cursor-pointer"
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
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <nav className="flex flex-col gap-3 mb-auto">
        <Button
          variant="ghost"
          className="justify-start cursor-pointer"
          onClick={() => setActiveView("dashboard")}
        >
          <Home size={18} /> Dashboard
        </Button>
        <Button
          variant="ghost"
          className="justify-start cursor-pointer"
          onClick={async () => {
            setActiveView("images");
            await fetchImages(selectedFolder);
          }}
        >
          <ImageIcon size={18} /> My Images
        </Button>
        <Button
          variant="ghost"
          className="justify-start cursor-pointer"
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
