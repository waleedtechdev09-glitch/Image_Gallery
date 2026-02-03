// "use client";

// import { Button } from "./ui/button";
// import { Plus, Trash2 } from "lucide-react";
// import axios from "axios";
// import { getToken } from "../utils/auth";
// import FolderTree from "./FolderTree";

// interface Folder {
//   _id: string;
//   name: string;
//   parent?: string | null;
// }

// interface SidebarProps {
//   folders: Folder[];
//   setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
//   setActiveView: (view: "dashboard" | "images" | "settings") => void;
//   fetchImages: (folderId?: string | null) => Promise<void>;
//   selectedFolder: string | null;
//   setSelectedFolder: (id: string | null) => void;
// }

// const SideBar = ({
//   folders,
//   setFolders,
//   setActiveView,
//   fetchImages,
//   selectedFolder,
//   setSelectedFolder,
// }: SidebarProps) => {
//   // BASE URL
//   const API_URL = "http://localhost:5000";
//   const token = getToken();

//   const handleAddFolder = async () => {
//     const name = prompt("Enter folder name:");
//     if (!name) return alert("Folder name cannot be empty!");
//     if (!token) return alert("Authentication failed.");

//     try {
//       const res = await axios.post(
//         `${API_URL}/api/folders`,
//         { name, parentId: selectedFolder || null },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );

//       setFolders((prev) => [...prev, res.data]);
//       setSelectedFolder(res.data._id);
//       setActiveView("images");
//       await fetchImages(res.data._id);

//       alert(`Folder "${name}" created successfully!`);
//     } catch (err: any) {
//       console.error(err);
//       alert(err?.response?.data?.message || "Failed to create folder");
//     }
//   };

//   const handleDeleteFolder = async () => {
//     if (!selectedFolder) return alert("Select a folder first.");
//     if (!window.confirm("Delete this folder and all its images?")) return;

//     try {
//       await axios.delete(`${API_URL}/api/folders/${selectedFolder}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setFolders((prev) => prev.filter((f) => f._id !== selectedFolder));
//       setSelectedFolder(null);
//       setActiveView("dashboard");
//       await fetchImages(null);

//       alert("Folder deleted successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Folder deletion failed");
//     }
//   };

//   const rootFolders = folders.filter((f) => !f.parent);

//   return (
//     <aside className="w-72 bg-gradient-to-b from-orange-50 to-white shadow-xl p-4 flex flex-col h-screen overflow-y-auto border-r border-orange-200">
//       {/* Sidebar header */}
//       <h2 className="text-3xl font-extrabold mb-6 text-orange-700 tracking-tight">
//         Library System
//       </h2>

//       {/* Add new folder button */}
//       <Button
//         onClick={handleAddFolder}
//         className="mb-3 w-full flex items-center justify-center gap-2 cursor-pointer bg-green-500 hover:bg-green-600 text-white font-medium shadow-sm transition-all duration-200"
//       >
//         <Plus size={18} /> New Folder
//       </Button>

//       {/* Delete selected folder button */}
//       {selectedFolder && (
//         <Button
//           variant="outline"
//           className="mb-4 w-full flex items-center justify-center gap-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm transition-all duration-200"
//           onClick={handleDeleteFolder}
//         >
//           <Trash2 size={18} /> Delete Folder
//         </Button>
//       )}

//       {/* Folder tree */}
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
//             onSelect={async (id) => {
//               setSelectedFolder(id);
//               setActiveView("images");
//               await fetchImages(id);
//             }}
//           />
//         ))}
//       </div>

//       {/* Footer */}
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
        Library System
      </h2>

      <Button
        onClick={handleAddFolder}
        className="mb-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
      >
        <Plus size={18} /> New Folder
      </Button>

      {selectedFolder && (
        <Button
          variant="outline"
          onClick={handleDeleteFolder}
          className="mb-4 w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
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
            onSelect={(id) => setSelectedFolder(id)}
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
