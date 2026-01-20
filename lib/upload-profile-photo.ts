export async function uploadProfilePhoto(file: File): Promise<string> {
  console.log(`Starting upload for ${file.name} (${file.size} bytes)`);
  
  // Cloudinary free tier limit is 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; 
  
  try {
    // Compress image if it's too large (over 1MB)
    let fileToUpload = file;
    if (file.size > 1024 * 1024) { // 1MB threshold
      try {
        console.log(`Compressing ${file.name}...`);
        fileToUpload = await compressImage(file);
        console.log(`Compressed ${file.name} to ${fileToUpload.size} bytes`);
      } catch (compressError) {
        console.warn("Image compression failed:", compressError);
        // Fallback is original file, but we check size below
      }
    }

    // Final safety check before upload
    if (fileToUpload.size > MAX_FILE_SIZE) {
      throw new Error(`File is too large (${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB). Max limit is 10MB.`);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    console.log(`Sending upload request for ${file.name}...`);
    const response = await fetch("/api/upload-profile-photo", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload profile photo");
    }

    const data = await response.json();
    console.log(`Upload successful for ${file.name}: ${data.url}`);
    return data.url;
  } catch (error) {
    console.error("Profile photo upload error:", error);
    throw error;
  }
}

export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      reject(new Error("Image compression timed out"));
    }, 15000); // Increased to 15s timeout

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (e) => {
      clearTimeout(timeoutId);
      reject(e);
    };

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Reduced Max dimensions for safety
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          clearTimeout(timeoutId);
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            clearTimeout(timeoutId);
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          "image/jpeg",
          0.7 // Reduced quality to 70%
        );
      } catch (err) {
        clearTimeout(timeoutId);
        reject(err);
      }
    };
    
    img.onerror = (err) => {
      clearTimeout(timeoutId);
      reject(new Error("Failed to load image for compression"));
    };

    reader.readAsDataURL(file);
  });
}