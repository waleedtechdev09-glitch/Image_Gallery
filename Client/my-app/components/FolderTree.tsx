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
      <div className="flex items-center gap-1">
        {children.length > 0 && (
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}

        <span
          className={`cursor-pointer flex items-center gap-1 ${
            selectedFolder === folder._id ? "font-bold text-blue-600" : ""
          }`}
          onClick={() => onSelect(folder._id)}
        >
          <Folder size={16} /> {folder.name}
        </span>
      </div>

      {expanded && (
        <div className="ml-4">
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
