"use client";

import { Button } from "./ui/button";
import {
  Plus,
  Trash2,
  Loader2,
  Menu,
  X,
  Library,
  FolderOpen,
  Home,
} from "lucide-react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import FolderTree from "./FolderTree";
import Link from "next/link";
import React, { useState } from "react";
import Swal from "sweetalert2";

interface Folder {
  _id: string;
  name: string;
  parent?: string | null;
}

interface SidebarProps {
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  fetchImages: (folderId?: string | null) => Promise<void>;
  selectedFolder: string | null;
  setSelectedFolder: (id: string | null) => void;
  setGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideBar = ({
  folders,
  setFolders,
  fetchImages,
  selectedFolder,
  setSelectedFolder,
  setGlobalLoading,
}: SidebarProps) => {
  const API_URL = "https://media-lib.conn-api.com/api";
  const token = getToken();

  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  React.useEffect(() => {
    if (!selectedFolder) return;
    const newExpanded = new Set<string>(expandedFolders);
    let current = folders.find((f) => f._id === selectedFolder);

    while (current && current.parent) {
      const parentId = current.parent;
      newExpanded.add(parentId);
      current = folders.find((f) => f._id === parentId);
    }
    setExpandedFolders(newExpanded);
  }, [selectedFolder, folders]);

  const handleAddFolder = async () => {
    const { value: folderName } = await Swal.fire({
      title: "New Folder",
      input: "text",
      inputPlaceholder: "Enter folder name...",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
    });

    if (!folderName || !token) return;

    setIsCreating(true);
    try {
      const res = await axios.post(
        `${API_URL}/folders`,
        { name: folderName, parentId: selectedFolder || null },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setFolders((prev) => [...prev, res.data]);
      setSelectedFolder(res.data._id);
      await fetchImages(res.data._id);
      Swal.fire({
        title: "Created!",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", "Failed to create folder", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;
    const result = await Swal.fire({
      title: "Delete Folder?",
      text: "All contents inside will be permanently lost!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        setGlobalLoading(true);
        await axios.delete(`${API_URL}/folders/${selectedFolder}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFolders((prev) => prev.filter((f) => f._id !== selectedFolder));
        setSelectedFolder(null);
        await fetchImages(null);
        Swal.fire("Deleted!", "Folder removed.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete", "error");
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const rootFolders = folders.filter((f) => !f.parent);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[120] bg-indigo-600 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[110] w-72 bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 border-b border-slate-50">
          <Link href="/homePage" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Library size={22} />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Media Vault
            </span>
          </Link>
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={() => {
              setSelectedFolder(null);
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${selectedFolder === null ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </div>

        <div className="p-4 space-y-2">
          <Button
            onClick={handleAddFolder}
            disabled={isCreating}
            className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-xl py-6 font-semibold transition-all"
          >
            {isCreating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus size={18} className="mr-2" />
            )}{" "}
            New Folder
          </Button>
          {selectedFolder && (
            <Button
              variant="ghost"
              onClick={handleDeleteFolder}
              className="w-full text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
            >
              <Trash2 size={16} className="mr-2" /> Delete Folder
            </Button>
          )}
        </div>

        <div className="px-6 py-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            My Folders
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div className="bg-slate-50/30 rounded-2xl p-2 border border-slate-100 min-h-[150px]">
            {rootFolders.length > 0 ? (
              rootFolders.map((folder) => (
                <FolderTree
                  key={folder._id}
                  folder={folder}
                  allFolders={folders}
                  selectedFolder={selectedFolder}
                  expandedFolders={expandedFolders}
                  onSelect={(id) => {
                    setSelectedFolder(id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                />
              ))
            ) : (
              <div className="py-10 text-center opacity-40">
                <FolderOpen size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[11px] font-medium">No folders created</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 text-[10px] text-slate-400 font-bold uppercase text-center border-t border-slate-100">
          © 2026 Asset Management
        </div>
      </aside>
    </>
  );
};

export default SideBar;
