// Mobile device detection and utilities
export const detectDevice = () => {
  const userAgent = navigator.userAgent;
  
  return {
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isChrome: /Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent)
  };
};

// Get optimal video constraints for the device
export const getVideoConstraints = (facingMode: 'user' | 'environment' = 'user') => {
  const device = detectDevice();
  
  const baseConstraints = {
    video: {
      facingMode,
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  };

  // iOS-specific optimizations
  if (device.isIOS) {
    return {
      ...baseConstraints,
      video: {
        ...baseConstraints.video,
        width: { ideal: 1280, max: 1280 }, // iOS can be picky about resolution
        height: { ideal: 720, max: 720 },
        frameRate: { ideal: 30, max: 30 }
      }
    };
  }

  // Android-specific optimizations
  if (device.isAndroid) {
    return {
      ...baseConstraints,
      video: {
        ...baseConstraints.video,
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 }
      }
    };
  }

  return baseConstraints;
};

// Get optimal MIME type for video recording
export const getOptimalVideoMimeType = () => {
  const device = detectDevice();
  
  // Test MIME types in order of preference for each platform
  const mimeTypes = device.isIOS 
    ? ['video/mp4', 'video/webm'] // iOS Safari sometimes supports mp4
    : device.isAndroid
    ? ['video/webm;codecs=vp8', 'video/webm;codecs=h264', 'video/webm']
    : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];

  for (const mimeType of mimeTypes) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  // Fallback
  return 'video/webm';
};

// Get optimal chunk size for recording
export const getOptimalChunkSize = () => {
  const device = detectDevice();
  
  // iOS works better with smaller chunks
  if (device.isIOS) return 100;
  
  // Android and desktop can handle larger chunks
  return 1000;
};

// Check if device supports video recording
export const supportsVideoRecording = () => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  );
};

// Request camera permissions with better error handling
export const requestCameraPermission = async (includeAudio = true) => {
  try {
    const constraints = getVideoConstraints();
    if (!includeAudio) {
      constraints.audio = false;
    }
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return { success: true, stream };
  } catch (error) {
    console.error('Camera permission error:', error);
    
    // Try fallback with basic constraints
    try {
      const fallbackConstraints = {
        video: true,
        audio: includeAudio
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      return { success: true, stream };
    } catch (fallbackError) {
      console.error('Fallback camera permission error:', fallbackError);
      
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported on this device.';
      } else {
        errorMessage += 'Please check your camera permissions.';
      }
      
      return { success: false, error: errorMessage };
    }
  }
};

// Handle video element setup for mobile
export const setupVideoElement = (videoElement: HTMLVideoElement) => {
  // Essential for iOS
  videoElement.playsInline = true;
  videoElement.muted = true;
  videoElement.autoplay = true;
  
  // Set webkit-specific attributes
  videoElement.setAttribute('webkit-playsinline', 'true');
  videoElement.setAttribute('playsinline', 'true');
  
  return videoElement;
};