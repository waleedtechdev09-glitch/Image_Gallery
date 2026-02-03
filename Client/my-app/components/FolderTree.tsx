// "use client";

// import { ChevronDown, ChevronRight } from "lucide-react";
// import { Folder } from "./SideBar";

// interface FolderTreeProps {
//   folder: Folder;
//   allFolders: Folder[];
//   selectedFolder: string | null;
//   onSelect: (id: string | null) => void;
//   expandedFolders: Set<string>;
//   setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
// }

// const FolderTree = ({
//   folder,
//   allFolders,
//   selectedFolder,
//   onSelect,
//   expandedFolders,
//   setExpandedFolders,
// }: FolderTreeProps) => {
//   const childFolders = allFolders.filter((f) => f.parent === folder._id);
//   const isOpen = expandedFolders.has(folder._id);

//   const toggle = () => {
//     const newSet = new Set(expandedFolders);
//     if (isOpen) newSet.delete(folder._id);
//     else newSet.add(folder._id);
//     setExpandedFolders(newSet);
//   };

//   return (
//     <div className="ml-2">
//       <div
//         className={`flex items-center justify-between p-1 cursor-pointer rounded hover:bg-orange-100 ${
//           selectedFolder === folder._id ? "bg-orange-200 font-semibold" : ""
//         }`}
//       >
//         <div className="flex items-center gap-1">
//           {childFolders.length > 0 && (
//             <span onClick={toggle}>
//               {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
//             </span>
//           )}
//           <span onClick={() => onSelect(folder._id)}>{folder.name}</span>
//         </div>
//       </div>

//       {isOpen &&
//         childFolders.map((child) => (
//           <FolderTree
//             key={child._id}
//             folder={child}
//             allFolders={allFolders}
//             selectedFolder={selectedFolder}
//             onSelect={onSelect}
//             expandedFolders={expandedFolders}
//             setExpandedFolders={setExpandedFolders}
//           />
//         ))}
//     </div>
//   );
// };

// export default FolderTree;

"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

interface Folder {
  _id: string;
  name: string;
  parent?: string | null;
}

interface FolderTreeProps {
  folder: Folder;
  allFolders: Folder[];
  selectedFolder: string | null;
  expandedFolders: Set<string>;
  onSelect: (id: string | null) => void;
}

const FolderTree = ({
  folder,
  allFolders,
  selectedFolder,
  expandedFolders,
  onSelect,
}: FolderTreeProps) => {
  const children = allFolders.filter((f) => f.parent === folder._id);
  const isExpanded = expandedFolders.has(folder._id);
  const [localExpanded, setLocalExpanded] = useState(false);

  const toggle = () => setLocalExpanded((prev) => !prev);

  return (
    <div className="pl-2">
      <div
        className={`flex items-center justify-between p-1 cursor-pointer hover:bg-orange-50 rounded ${
          selectedFolder === folder._id ? "bg-orange-100 font-semibold" : ""
        }`}
        onClick={() => {
          onSelect(folder._id);
          toggle();
        }}
      >
        <span>{folder.name}</span>
        {children.length > 0 && (
          <span className="text-gray-400 text-sm">
            {isExpanded || localExpanded ? <ChevronDown /> : <ChevronRight />}
          </span>
        )}
      </div>

      {(isExpanded || localExpanded) &&
        children.map((child) => (
          <FolderTree
            key={child._id}
            folder={child}
            allFolders={allFolders}
            selectedFolder={selectedFolder}
            expandedFolders={expandedFolders}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
};

export default FolderTree;
