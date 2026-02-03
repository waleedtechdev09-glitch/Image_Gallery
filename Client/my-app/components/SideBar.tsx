"use client";

import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { getToken } from "../utils/auth";
import FolderTree from "./FolderTree";

interface Folder {
  _id: string;
  name: string;
  parent?: string | null;
}

interface SidebarProps {
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setActiveView: (view: "dashboard" | "images" | "settings") => void;
  fetchImages: (folderId?: string | null) => Promise<void>;
  selectedFolder: string | null;
  setSelectedFolder: (id: string | null) => void;
}

const SideBar = ({
  folders,
  setFolders,
  setActiveView,
  fetchImages,
  selectedFolder,
  setSelectedFolder,
}: SidebarProps) => {
  const API_URL = "http://localhost:5000";
  const token = getToken();

  const handleAddFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name || !token) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/folders`,
        {
          name,
          parentId: selectedFolder || null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setFolders((prev) => [...prev, res.data]);
      setSelectedFolder(res.data._id);
      setActiveView("images");

      await fetchImages(res.data._id);
    } catch (err) {
      console.error(err);
      alert("Failed to create folder");
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder || !token) return;

    if (!window.confirm("Delete this folder and all its images?")) return;

    try {
      await axios.delete(`${API_URL}/api/folders/${selectedFolder}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFolders((prev) => prev.filter((f) => f._id !== selectedFolder));

      setSelectedFolder(null);
      setActiveView("dashboard");

      await fetchImages(null);
    } catch (err) {
      console.error(err);
      alert("Folder deletion failed");
    }
  };

  const handleSelectFolder = async (id: string) => {
    setSelectedFolder(id);
    setActiveView("images");
    await fetchImages(id);
  };

  const rootFolders = folders.filter((f) => !f.parent);

  return (
    <aside className="w-72 bg-white shadow-md p-4 flex flex-col h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Library System</h2>

      <Button onClick={handleAddFolder} className="mb-3">
        <Plus size={16} /> New Folder
      </Button>

      {selectedFolder && (
        <Button variant="outline" className="mb-3" onClick={handleDeleteFolder}>
          <Trash2 size={16} /> Delete Selected
        </Button>
      )}

      <div className="border rounded p-2 overflow-y-auto">
        {rootFolders.length === 0 && (
          <p className="text-gray-500 text-sm">No folders created</p>
        )}

        {rootFolders.map((folder) => (
          <FolderTree
            key={folder._id}
            folder={folder}
            allFolders={folders}
            selectedFolder={selectedFolder}
            onSelect={handleSelectFolder}
          />
        ))}
      </div>

      <div className="mt-auto text-xs text-gray-500 pt-4">
        &copy; 2026 Library System
      </div>
    </aside>
  );
};

export default SideBar;
