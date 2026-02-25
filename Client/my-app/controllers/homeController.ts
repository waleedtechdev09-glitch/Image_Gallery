import {
  fetchFoldersAPI,
  fetchImagesAPI,
  fetchBreadcrumbAPI,
  resolveFolderPathAPI,
  uploadImagesAPI,
  deleteImageAPI,
  resizeImageAPI,
} from "../services/apiService";
import Swal from "sweetalert2";

// --- Load Folders ---
export const loadFolders = async (token: string, setFolders: Function) => {
  try {
    const data = await fetchFoldersAPI(token);
    setFolders(data);
  } catch (err) {
    console.error("Folder Load Error:", err);
  }
};

// --- Load Images ---
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
    console.error("Image Load Error:", err);
    Swal.fire("Error", "Failed to load images", "error");
  } finally {
    setLoading(false);
  }
};

// --- Load Breadcrumb ---
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
    console.error("Breadcrumb Error:", err);
  }
};

// --- Breadcrumb Navigation ---
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

// --- Handle Upload ---
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
    await refreshImages(); // Refresh data after upload
    Swal.fire("Success", "Files uploaded successfully", "success");
  } catch (err: any) {
    console.error("Upload Error:", err);
    Swal.fire(
      "Upload Failed",
      err?.response?.data?.message || "Something went wrong",
      "error",
    );
  } finally {
    setUploading(false);
  }
};

// --- Handle Delete ---
export const handleDeleteController = async (
  token: string,
  id: string,
  setDeletingImages: Function,
  setImages: Function,
) => {
  const result = await Swal.fire({
    title: "Delete this image?",
    text: "Original and all resized versions will be deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return;

  try {
    setDeletingImages((prev: string[]) => [...prev, id]);
    await deleteImageAPI(token, id);
    setImages((prev: any[]) => prev.filter((img) => img._id !== id));
    Swal.fire(
      "Deleted!",
      "Asset removed from storage and database.",
      "success",
    );
  } catch (err) {
    console.error("Delete Error:", err);
    Swal.fire("Error", "Failed to delete image", "error");
  } finally {
    setDeletingImages((prev: string[]) => prev.filter((imgId) => imgId !== id));
  }
};

/**
 * ✨ FINALIZED: MANUAL RESIZE CONTROLLER
 * Logic: Validates size, handles duplicates, and refreshes UI.
 */
export const handleResizeController = async (
  token: string,
  id: string,
  targetSize: number,
  setGlobalLoading: Function,
  refreshImages: Function,
) => {
  try {
    setGlobalLoading(true);

    // Backend call for resizing
    await resizeImageAPI(token, id, targetSize);

    // Refresh memory/UI
    await refreshImages();

    Swal.fire({
      title: "Resized!",
      text: `${targetSize}px version created successfully.`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err: any) {
    console.error("Resize Error Details:", err);

    // 🔥 Check for specific validation messages from backend (e.g., "already exists")
    const errorMsg = err.response?.data?.message || "Manual resize failed.";

    Swal.fire({
      title: "Notice",
      text: errorMsg,
      icon: errorMsg.includes("exists") ? "info" : "error",
      confirmButtonColor: "#6366f1",
    });
  } finally {
    setGlobalLoading(false);
  }
};
