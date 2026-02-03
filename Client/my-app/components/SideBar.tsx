// "use client";

// import { useState } from "react";
// import { Button } from "./ui/button";
// import { Plus, Trash2 } from "lucide-react";
// import axios from "axios";
// import { getToken } from "@/utils/auth";
// import FolderTree from "./FolderTree";
// import Link from "next/link";

// interface Folder {
//   _id: string;
//   name: string;
//   parent?: string | null;
// }

// interface SidebarProps {
//   folders: Folder[];
//   setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
//   fetchImages: (folderId?: string | null) => Promise<void>;
//   selectedFolder: string | null;
//   setSelectedFolder: (id: string | null) => void;
// }

// const SideBar = ({
//   folders,
//   setFolders,
//   fetchImages,
//   selectedFolder,
//   setSelectedFolder,
// }: SidebarProps) => {
//   const API_URL = "http://localhost:5000";
//   const token = getToken();

//   // NEW: Track expanded folders
//   const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
//     new Set(),
//   );

//   const handleAddFolder = async () => {
//     const name = prompt("Enter folder name:");
//     if (!name) return alert("Folder name cannot be empty!");
//     if (!token) return alert("Authentication failed");

//     try {
//       const res = await axios.post(
//         `${API_URL}/api/folders`,
//         { name, parentId: selectedFolder || null },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       const newFolder = res.data;
//       setFolders((prev) => [...prev, newFolder]);
//       setSelectedFolder(newFolder._id);

//       // Automatically expand all  folders so new folder is visible
//       const newExpanded = new Set(expandedFolders);
//       let parentId = newFolder.parent;
//       while (parentId) {
//         newExpanded.add(parentId);
//         const parent = folders.find((f) => f._id === parentId);
//         parentId = parent?.parent || null;
//       }
//       setExpandedFolders(newExpanded);

//       await fetchImages(newFolder._id);
//       alert(`Folder "${name}" created!`);
//     } catch (err: any) {
//       console.error(err);
//       alert(err?.response?.data?.message || "Failed to create folder");
//     }
//   };

//   const handleDeleteFolder = async () => {
//     if (!selectedFolder) return alert("Select a folder first");
//     if (!window.confirm("Delete this folder and its images?")) return;

//     try {
//       await axios.delete(`${API_URL}/api/folders/${selectedFolder}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setFolders((prev) => prev.filter((f) => f._id !== selectedFolder));
//       setSelectedFolder(null);

//       // Remove deleted folder from expanded folders
//       const newExpanded = new Set(expandedFolders);
//       newExpanded.delete(selectedFolder);
//       setExpandedFolders(newExpanded);

//       await fetchImages(null);
//       alert("Folder deleted!");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete folder");
//     }
//   };

//   const rootFolders = folders.filter((f) => !f.parent);

//   return (
//     <aside className="w-72 bg-gradient-to-b from-orange-50 to-white shadow-xl p-4 flex flex-col h-screen overflow-y-auto border-r border-orange-200">
//       <h2 className="text-3xl font-extrabold mb-6 text-orange-700 tracking-tight cursor-pointer">
//         <Link href="/">Library System</Link>
//       </h2>

//       <Button
//         onClick={handleAddFolder}
//         className="mb-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white cursor-pointer"
//       >
//         <Plus size={18} /> New Folder
//       </Button>

//       {selectedFolder && (
//         <Button
//           variant="outline"
//           onClick={handleDeleteFolder}
//           className="mb-4 w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
//         >
//           <Trash2 size={18} /> Delete Folder
//         </Button>
//       )}

//       <div className="flex-1 overflow-y-auto rounded-md border border-orange-200 p-2 bg-white shadow-inner">
//         {rootFolders.length === 0 && (
//           <p className="text-gray-400 text-sm text-center mt-4">
//             No folders created
//           </p>
//         )}
//         {rootFolders.map((folder) => (
//           <FolderTree
//             key={folder._id}
//             folder={folder}
//             allFolders={folders}
//             selectedFolder={selectedFolder}
//             onSelect={setSelectedFolder}
//             expandedFolders={expandedFolders}
//             setExpandedFolders={setExpandedFolders}
//           />
//         ))}
//       </div>

//       <div className="mt-auto text-xs text-gray-400 pt-4 text-center border-t border-orange-200">
//         &copy; 2026 Library System
//       </div>
//     </aside>
//   );
// };

// export default SideBar;

"use client";

import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { getToken } from "@/utils/auth";
import FolderTree from "./FolderTree";
import Link from "next/link";
import React from "react";

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
}

const SideBar = ({
  folders,
  setFolders,
  fetchImages,
  selectedFolder,
  setSelectedFolder,
}: SidebarProps) => {
  const API_URL = "http://localhost:5000";
  const token = getToken();

  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(
    new Set(),
  );

  // expand parents of selected folder
  React.useEffect(() => {
    if (!selectedFolder) return;

    const newExpanded = new Set<string>();
    let current = folders.find((f) => f._id === selectedFolder);

    while (current?.parent) {
      newExpanded.add(current.parent);
      current = folders.find((f) => f._id === current.parent);
    }

    setExpandedFolders(newExpanded);
  }, [selectedFolder, folders]);

  const handleAddFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return alert("Folder name cannot be empty!");
    if (!token) return alert("Authentication failed");

    try {
      const res = await axios.post(
        `${API_URL}/api/folders`,
        { name, parentId: selectedFolder || null },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setFolders((prev) => [...prev, res.data]);
      setSelectedFolder(res.data._id);
      await fetchImages(res.data._id);
      alert(`Folder "${name}" created!`);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to create folder");
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return alert("Select a folder first");
    if (!window.confirm("Delete this folder and its images?")) return;

    try {
      await axios.delete(`${API_URL}/api/folders/${selectedFolder}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders((prev) => prev.filter((f) => f._id !== selectedFolder));
      setSelectedFolder(null);
      await fetchImages(null);
      alert("Folder deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete folder");
    }
  };

  const rootFolders = folders.filter((f) => !f.parent);

  return (
    <aside className="w-72 bg-gradient-to-b from-orange-50 to-white shadow-xl p-4 flex flex-col h-screen overflow-y-auto border-r border-orange-200">
      <h2 className="text-3xl font-extrabold mb-6 text-orange-700 tracking-tight">
        <Link href="/">Library System</Link>
      </h2>

      <Button
        onClick={handleAddFolder}
        className="mb-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white cursor-pointer"
      >
        <Plus size={18} /> New Folder
      </Button>

      {selectedFolder && (
        <Button
          variant="outline"
          onClick={handleDeleteFolder}
          className="mb-4 w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white cursor-pointer"
        >
          <Trash2 size={18} /> Delete Folder
        </Button>
      )}

      <div className="flex-1 overflow-y-auto rounded-md border border-orange-200 p-2 bg-white shadow-inner">
        {rootFolders.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-4">
            No folders created
          </p>
        )}
        {rootFolders.map((folder) => (
          <FolderTree
            key={folder._id}
            folder={folder}
            allFolders={folders}
            selectedFolder={selectedFolder}
            expandedFolders={expandedFolders}
            onSelect={setSelectedFolder}
          />
        ))}
      </div>

      <div className="mt-auto text-xs text-gray-400 pt-4 text-center border-t border-orange-200">
        &copy; 2026 Library System
      </div>
    </aside>
  );
};

export default SideBar;
