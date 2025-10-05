// Utility functions for media processing and compression

export async function compressVideo(file: File, maxSizeMB: number = 5): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    video.onloadedmetadata = () => {
      // Calculate compression ratio based on file size
      const currentSizeMB = file.size / (1024 * 1024);
      if (currentSizeMB <= maxSizeMB) {
        resolve(file); // No compression needed
        return;
      }

      // Set canvas dimensions (reduce resolution for compression)
      const scale = Math.sqrt(maxSizeMB / currentSizeMB);
      canvas.width = Math.floor(video.videoWidth * scale);
      canvas.height = Math.floor(video.videoHeight * scale);

      // Create MediaRecorder for re-encoding
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 1000000 // 1 Mbps
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([compressedBlob], file.name, {
          type: 'video/webm',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      };

      // Start recording and play video
      mediaRecorder.start();
      
      video.ontimeupdate = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      };

      video.onended = () => {
        mediaRecorder.stop();
      };

      video.play();
    };

    video.onerror = () => {
      reject(new Error('Failed to load video for compression'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function compressImage(file: File, maxSizeMB: number = 2, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate compression ratio
      const currentSizeMB = file.size / (1024 * 1024);
      if (currentSizeMB <= maxSizeMB) {
        resolve(file); // No compression needed
        return;
      }

      // Calculate new dimensions
      const scale = Math.sqrt(maxSizeMB / currentSizeMB);
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image'));
          return;
        }

        const compressedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, 'image/jpeg', quality);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}