"use client";

import {
  Plus,
  Trash2,
  Loader2,
  Menu,
  X,
  FolderOpen,
  Home,
  Layers,
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
  const API_URL = "https://image-gallery-2-wk44.onrender.com/api";
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
      confirmButtonColor: "#6366f1",
      background: "#1e1b2e",
      color: "#e2e8f0",
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
        background: "#1e1b2e",
        color: "#e2e8f0",
      });
    } catch {
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
      background: "#1e1b2e",
      color: "#e2e8f0",
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
      } catch {
        Swal.fire("Error", "Failed to delete", "error");
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const rootFolders = folders.filter((f) => !f.parent);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[120] p-4 rounded-full shadow-2xl active:scale-90 transition-all"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className="text-white" />
        )}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[110] w-72 flex flex-col h-screen transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          background:
            "linear-gradient(160deg, #0f0c1a 0%, #1a1530 40%, #0f172a 100%)",
          borderRight: "1px solid rgba(99, 102, 241, 0.15)",
        }}
      >
        {/* Decorative top glow */}
        <div
          className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% -20%, rgba(99,102,241,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          className="relative p-6 border-b"
          style={{ borderColor: "rgba(99,102,241,0.15)" }}
        >
          <Link href="/homePage" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              }}
            >
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                Media Vault
              </span>
              <p className="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">
                Asset Manager
              </p>
            </div>
          </Link>
        </div>

        {/* Home button */}
        <div className="relative px-4 pt-4">
          <button
            onClick={() => {
              setSelectedFolder(null);
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm"
            style={
              selectedFolder === null
                ? {
                    background: "rgba(99,102,241,0.2)",
                    color: "#a5b4fc",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }
                : {
                    color: "rgba(148,163,184,0.8)",
                    border: "1px solid transparent",
                  }
            }
          >
            <Home size={18} />
            <span>All Assets</span>
            {selectedFolder === null && (
              <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="relative p-4 space-y-2">
          <button
            onClick={handleAddFolder}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
            }}
          >
            {isCreating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            New Folder
          </button>

          {selectedFolder && (
            <button
              onClick={handleDeleteFolder}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                color: "#f87171",
                border: "1px solid rgba(248,113,113,0.2)",
                background: "rgba(248,113,113,0.05)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(248,113,113,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(248,113,113,0.05)")
              }
            >
              <Trash2 size={14} />
              Delete Folder
            </button>
          )}
        </div>

        {/* Section label */}
        <div className="relative px-6 py-2 flex items-center gap-3">
          <span
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            Folders
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(99,102,241,0.15)" }}
          />
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}
          >
            {rootFolders.length}
          </span>
        </div>

        {/* Folder tree */}
        <div className="relative flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div
            className="rounded-2xl p-2 min-h-[150px]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(99,102,241,0.08)",
            }}
          >
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
              <div className="py-10 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(99,102,241,0.1)" }}
                >
                  <FolderOpen
                    size={22}
                    style={{ color: "rgba(99,102,241,0.5)" }}
                  />
                </div>
                <p
                  className="text-[11px] font-medium"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  No folders yet
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: "rgba(148,163,184,0.25)" }}
                >
                  Click 'New Folder' to start
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative p-5 text-center"
          style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(148,163,184,0.3)" }}
          >
            © 2026 Asset Management
          </p>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
