import {
  fetchFoldersAPI,
  fetchImagesAPI,
  fetchBreadcrumbAPI,
  resolveFolderPathAPI,
  uploadImagesAPI,
  deleteImageAPI,
} from "../services/apiService";

export const loadFolders = async (token: string, setFolders: Function) => {
  try {
    const data = await fetchFoldersAPI(token);
    setFolders(data);
  } catch (err) {
    console.error(err);
  }
};

export const loadImages = async (
  token: string,
  folderId: string | null,
  setImages: Function,
  setLoading: Function,
) => {
  setLoading(true);
  try {
    const data = await fetchImagesAPI(token, folderId);
    setImages(data);
  } catch (err) {
    console.error(err);
    alert("Failed to load images");
  } finally {
    setLoading(false);
  }
};

export const loadBreadcrumb = async (
  token: string,
  folderId: string | null,
  setBreadcrumb: Function,
) => {
  if (!folderId) return setBreadcrumb("");
  try {
    const path = await fetchBreadcrumbAPI(token, folderId);
    setBreadcrumb(path);
  } catch (err) {
    console.error(err);
  }
};

export const handleBreadcrumbClickController = async (
  token: string,
  pathArray: string[],
  setSelectedFolder: Function,
) => {
  if (pathArray.length === 0) {
    setSelectedFolder(null);
    return;
  }
  try {
    const folderId = await resolveFolderPathAPI(token, pathArray);
    setSelectedFolder(folderId);
  } catch (err) {
    console.error("Failed to navigate breadcrumb", err);
  }
};

export const handleUploadController = async (
  token: string,
  files: FileList | File[],
  folderId: string | null,
  setUploading: Function,
  refreshImages: Function,
) => {
  if (!files || files.length === 0) return;
  const fileArray = Array.from(files);
  try {
    setUploading(true);
    await uploadImagesAPI(token, fileArray, folderId || undefined);
    refreshImages();
  } catch (err: any) {
    console.error(err);
    alert(err?.response?.data?.message || "Upload failed");
  } finally {
    setUploading(false);
  }
};

export const handleDeleteController = async (
  token: string,
  id: string,
  setDeletingImages: Function,
  setImages: Function,
) => {
  if (!window.confirm("Delete this image?")) return;
  try {
    setDeletingImages((prev: string[]) => [...prev, id]);
    await deleteImageAPI(token, id);
    setImages((prev: any[]) => prev.filter((img) => img._id !== id));
  } catch (err) {
    console.error(err);
    alert("Failed to delete image");
  } finally {
    setDeletingImages((prev: string[]) => prev.filter((imgId) => imgId !== id));
  }
};
