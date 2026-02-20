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

// ... (Baaki functions same rahenge)

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
  const result = await Swal.fire({
    title: "Delete this image?",
    text: "This action cannot be undone!",
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
    Swal.fire("Deleted!", "Your image has been deleted.", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to delete image", "error");
  } finally {
    setDeletingImages((prev: string[]) => prev.filter((imgId) => imgId !== id));
  }
};

// ✨ UPDATED: MANUAL RESIZE HANDLER WITH SIZE PARAMETER
export const handleResizeController = async (
  token: string,
  id: string,
  targetSize: number, // 👈 Receiving size from HomePage
  setGlobalLoading: Function,
  refreshImages: Function,
) => {
  try {
    setGlobalLoading(true);

    // API call mein size pass kar rahe hain
    await resizeImageAPI(token, id, targetSize);

    await refreshImages();

    Swal.fire({
      title: "Resized!",
      text: `Thumbnail (${targetSize}px) generated successfully.`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err: any) {
    console.error("Resize Error:", err);
    Swal.fire(
      "Error",
      err.response?.data?.message ||
        "Manual resize failed. Check if resizer service is active.",
      "error",
    );
  } finally {
    setGlobalLoading(false);
  }
};
