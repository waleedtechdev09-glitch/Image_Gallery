"use client";

import { useState, useRef, useEffect } from "react";
import { getToken } from "@/utils/auth";
import {
  loadFolders,
  loadImages,
  loadBreadcrumb,
  handleBreadcrumbClickController,
  handleUploadController,
  handleDeleteController,
} from "../controllers/homeController";

export const useHomeController = (initialFolderId: string | null) => {
  const token = getToken();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [folders, setFolders] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(
    initialFolderId,
  );
  const [breadcrumb, setBreadcrumb] = useState<string>("");
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImages, setDeletingImages] = useState<string[]>([]);

  // Load folders, images, and breadcrumb when folder changes
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      await loadFolders(token, setFolders);
      await loadImages(token, selectedFolder, setImages, setImagesLoading);
      await loadBreadcrumb(token, selectedFolder, setBreadcrumb);
    };
    loadData();
  }, [selectedFolder, token]);

  const refreshImages = () => {
    if (!token) return;
    loadImages(token, selectedFolder, setImages, setImagesLoading);
  };

  return {
    token,
    fileInputRef,
    folders,
    setFolders,
    images,
    setImages,
    selectedFolder,
    setSelectedFolder,
    breadcrumb,
    imagesLoading,
    uploading,
    setUploading,
    deletingImages,
    setDeletingImages,
    refreshImages,
    handleBreadcrumbClickController,
    handleUploadController,
    handleDeleteController,
  };
};
