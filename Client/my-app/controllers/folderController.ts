import {
  createFolderAPI,
  deleteFolderAPI,
  getToken,
} from "../services/folderService";

export const handleAddFolderController = async (
  selectedFolder: string | null,
  setFolders: Function,
  setSelectedFolder: Function,
  fetchImages: Function,
) => {
  const name = prompt("Enter folder name:");
  if (!name) return alert("Folder name cannot be empty!");

  const token = getToken();
  if (!token) return alert("Authentication failed");

  try {
    const newFolder = await createFolderAPI(
      name,
      selectedFolder || null,
      token,
    );
    setFolders((prev: any[]) => [...prev, newFolder]);
    setSelectedFolder(newFolder._id);
    await fetchImages(newFolder._id);
    alert(`Folder "${name}" created!`);
  } catch (err: any) {
    console.error(err);
    alert(err?.response?.data?.message || "Failed to create folder");
  }
};

export const handleDeleteFolderController = async (
  selectedFolder: string | null,
  setFolders: Function,
  setSelectedFolder: Function,
  fetchImages: Function,
) => {
  if (!selectedFolder) return alert("Select a folder first");
  if (!window.confirm("Delete this folder and its images?")) return;

  const token = getToken();
  if (!token) return alert("Authentication failed");

  try {
    await deleteFolderAPI(selectedFolder, token);
    setFolders((prev: any[]) => prev.filter((f) => f._id !== selectedFolder));
    setSelectedFolder(null);
    await fetchImages(null);
    alert("Folder deleted!");
  } catch (err) {
    console.error(err);
    alert("Failed to delete folder");
  }
};
