"use client";

import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import React, { useState, useEffect } from "react";

interface FolderType {
  _id: string;
  name: string;
  parent?: string | null;
}

interface FolderTreeProps {
  folder: FolderType;
  allFolders: FolderType[];
  selectedFolder: string | null;
  expandedFolders: Set<string>; // Global expansion (URL/Breadcrumb se aati hai)
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

  // Local state for manual clicking
  const [isOpen, setIsOpen] = useState(false);

  // Sync local state if global expandedFolders changes (e.g. breadcrumb click)
  useEffect(() => {
    if (expandedFolders.has(folder._id)) {
      setIsOpen(true);
    }
  }, [expandedFolders, folder._id]);

  const isSelected = selectedFolder === folder._id;

  return (
    <div className="w-full">
      <div
        className={`
          group flex items-center gap-2 px-3 py-2 my-0.5 rounded-xl cursor-pointer transition-all duration-200
          ${
            isSelected
              ? "bg-indigo-50 text-indigo-700 shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }
        `}
        onClick={(e) => {
          onSelect(folder._id);
          setIsOpen(!isOpen);
        }}
      >
        {/* Arrow Icon */}
        <div className="w-4 h-4 flex items-center justify-center">
          {children.length > 0 && (
            <span className="text-slate-400 group-hover:text-indigo-500">
              {isOpen ? (
                <ChevronDown size={14} strokeWidth={3} />
              ) : (
                <ChevronRight size={14} strokeWidth={3} />
              )}
            </span>
          )}
        </div>

        {/* Folder Icon */}
        <span
          className={
            isSelected
              ? "text-indigo-600"
              : "text-slate-400 group-hover:text-slate-500"
          }
        >
          {isOpen ? <FolderOpen size={18} /> : <Folder size={18} />}
        </span>

        {/* Folder Name */}
        <span className="text-sm font-medium truncate flex-1">
          {folder.name}
        </span>

        {/* Badge for children count (Optional) */}
        {children.length > 0 && !isOpen && (
          <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">
            {children.length}
          </span>
        )}
      </div>

      {/* Recursive Children Rendering */}
      {isOpen && children.length > 0 && (
        <div className="ml-4 pl-2 border-l border-slate-200 mt-1 space-y-1">
          {children.map((child) => (
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
      )}
    </div>
  );
};

export default FolderTree;
