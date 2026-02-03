// "use client";

// import { ChevronRight, ChevronDown, Folder } from "lucide-react";
// import { useState } from "react";

// interface FolderItem {
//   _id: string;
//   name: string;
//   parent?: string | null;
// }

// interface Props {
//   folder: FolderItem;
//   allFolders: FolderItem[];
//   selectedFolder: string | null;
//   onSelect: (id: string) => void;
// }

// const FolderTree = ({
//   folder,
//   allFolders,
//   selectedFolder,
//   onSelect,
// }: Props) => {
//   const [expanded, setExpanded] = useState(false);

//   // Get children folders
//   const children = allFolders.filter((f) => f.parent === folder._id);

//   return (
//     <div className="ml-2">
//       {/* Folder row */}
//       <div className="flex items-center gap-1 group hover:bg-gray-100 rounded p-1 cursor-pointer">
//         {/* Expand/collapse button */}
//         {children.length > 0 && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation(); // prevent selecting folder
//               setExpanded(!expanded);
//             }}
//             className="flex items-center justify-center w-5 h-5"
//           >
//             {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//           </button>
//         )}

//         {/* Folder name */}
//         <span
//           onClick={() => onSelect(folder._id)}
//           className={`flex items-center gap-1 ${
//             selectedFolder === folder._id
//               ? "font-bold text-blue-600"
//               : "text-black"
//           }`}
//         >
//           <Folder size={16} /> {folder.name}
//         </span>
//       </div>

//       {/* Render children folders recursively */}
//       {expanded && (
//         <div className="ml-5 border-l border-gray-200 pl-2">
//           {children.map((child) => (
//             <FolderTree
//               key={child._id}
//               folder={child}
//               allFolders={allFolders}
//               selectedFolder={selectedFolder}
//               onSelect={onSelect}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FolderTree;

"use client";

import { ChevronRight, ChevronDown, Folder } from "lucide-react";
import { useState } from "react";

interface FolderItem {
  _id: string;
  name: string;
  parent?: string | null;
}

interface Props {
  folder: FolderItem;
  allFolders: FolderItem[];
  selectedFolder: string | null;
  onSelect: (id: string) => void;
}

const FolderTree = ({
  folder,
  allFolders,
  selectedFolder,
  onSelect,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const children = allFolders.filter((f) => f.parent === folder._id);

  return (
    <div className="ml-2">
      <div className="flex items-center gap-1 group hover:bg-gray-100 rounded p-1 cursor-pointer">
        {children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex items-center justify-center w-5 h-5"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <span
          onClick={() => onSelect(folder._id)}
          className={`flex items-center gap-1 ${selectedFolder === folder._id ? "font-bold text-blue-600" : "text-black"}`}
        >
          <Folder size={16} /> {folder.name}
        </span>
      </div>
      {expanded && children.length > 0 && (
        <div className="ml-5 border-l border-gray-200 pl-2">
          {children.map((child) => (
            <FolderTree
              key={child._id}
              folder={child}
              allFolders={allFolders}
              selectedFolder={selectedFolder}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderTree;
