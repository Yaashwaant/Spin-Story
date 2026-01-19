export async function uploadProfilePhoto(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-profile-photo", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload profile photo");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Profile photo upload error:", error);
    throw error;
  }
}