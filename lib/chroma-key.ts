export interface ChromaKeySettings {
  threshold: number
  smoothness: number
  spill: number
  keyColor?: [number, number, number] // RGB values for key color
}

export interface ChromaKeyResult {
  imageData: ImageData
  alphaChannel: Uint8Array
}

/**
 * Advanced chroma key processing with multiple algorithms
 */
export class ChromaKeyProcessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement('canvas')
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get 2D context')
    this.ctx = ctx
  }

  /**
   * Process frame with simple green screen removal
   */
  processSimpleGreenScreen(
    sourceImageData: ImageData,
    backgroundImageData: ImageData,
    threshold: number = 0.4
  ): ImageData {
    const result = new ImageData(
      new Uint8ClampedArray(sourceImageData.data),
      sourceImageData.width,
      sourceImageData.height
    )

    const data = result.data
    const bgData = backgroundImageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Calculate green dominance
      const greenness = (g - Math.max(r, b)) / 255

      if (greenness > threshold) {
        // Replace with background
        data[i] = bgData[i]
        data[i + 1] = bgData[i + 1]
        data[i + 2] = bgData[i + 2]
        data[i + 3] = bgData[i + 3]
      }
    }

    return result
  }

  /**
   * Advanced chroma key with HSV color space and spill suppression
   */
  processAdvancedChromaKey(
    sourceImageData: ImageData,
    backgroundImageData: ImageData,
    settings: ChromaKeySettings
  ): ChromaKeyResult {
    const { threshold, smoothness, spill, keyColor = [0, 255, 0] } = settings
    
    const result = new ImageData(
      new Uint8ClampedArray(sourceImageData.data),
      sourceImageData.width,
      sourceImageData.height
    )

    const data = result.data
    const bgData = backgroundImageData.data
    const alphaChannel = new Uint8Array(sourceImageData.width * sourceImageData.height)

    // Convert key color to HSV
    const keyHSV = this.rgbToHsv(keyColor[0], keyColor[1], keyColor[2])

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Convert pixel to HSV
      const pixelHSV = this.rgbToHsv(r, g, b)

      // Calculate color distance in HSV space
      const hueDiff = Math.min(
        Math.abs(pixelHSV.h - keyHSV.h),
        360 - Math.abs(pixelHSV.h - keyHSV.h)
      )
      
      const satDiff = Math.abs(pixelHSV.s - keyHSV.s)
      const valDiff = Math.abs(pixelHSV.v - keyHSV.v)

      // Weighted distance calculation
      const distance = Math.sqrt(
        (hueDiff / 180) ** 2 * 0.5 +
        satDiff ** 2 * 0.3 +
        valDiff ** 2 * 0.2
      )

      // Calculate alpha with smoothing
      let alpha = 1.0
      if (distance < threshold + smoothness) {
        if (distance < threshold - smoothness) {
          alpha = 0.0
        } else {
          // Smooth transition
          alpha = (distance - (threshold - smoothness)) / (2 * smoothness)
        }
      }

      // Spill suppression
      if (alpha > 0 && alpha < 1 && spill > 0) {
        const spillAmount = (1 - alpha) * spill
        const newRGB = this.suppressSpill([r, g, b], keyColor, spillAmount)
        data[i] = newRGB[0]
        data[i + 1] = newRGB[1]
        data[i + 2] = newRGB[2]
      }

      // Composite with background
      if (alpha < 1) {
        const bgIndex = i
        data[i] = Math.round(data[i] * alpha + bgData[bgIndex] * (1 - alpha))
        data[i + 1] = Math.round(data[i + 1] * alpha + bgData[bgIndex + 1] * (1 - alpha))
        data[i + 2] = Math.round(data[i + 2] * alpha + bgData[bgIndex + 2] * (1 - alpha))
      }

      // Store alpha for debugging
      alphaChannel[Math.floor(i / 4)] = Math.round(alpha * 255)
    }

    return { imageData: result, alphaChannel }
  }

  /**
   * Edge-aware chroma keying with morphological operations
   */
  processEdgeAwareChromaKey(
    sourceImageData: ImageData,
    backgroundImageData: ImageData,
    settings: ChromaKeySettings
  ): ImageData {
    // First pass: basic chroma key
    const firstPass = this.processAdvancedChromaKey(sourceImageData, backgroundImageData, settings)
    
    // Second pass: edge refinement
    const refined = this.refineEdges(firstPass.imageData, firstPass.alphaChannel)
    
    return refined
  }

  /**
   * Convert RGB to HSV color space
   */
  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    if (diff !== 0) {
      if (max === r) {
        h = ((g - b) / diff) % 6
      } else if (max === g) {
        h = (b - r) / diff + 2
      } else {
        h = (r - g) / diff + 4
      }
    }
    h = (h * 60 + 360) % 360

    const s = max === 0 ? 0 : diff / max
    const v = max

    return { h, s, v }
  }

  /**
   * Suppress color spill from key color
   */
  private suppressSpill(
    rgb: [number, number, number],
    keyColor: [number, number, number],
    spillAmount: number
  ): [number, number, number] {
    const [r, g, b] = rgb
    const [kr, kg, kb] = keyColor

    // Calculate spill in each channel
    const spillR = Math.max(0, (r - Math.max(g, b)) * spillAmount)
    const spillG = Math.max(0, (g - Math.max(r, b)) * spillAmount)
    const spillB = Math.max(0, (b - Math.max(r, g)) * spillAmount)

    return [
      Math.max(0, Math.min(255, r - spillR)),
      Math.max(0, Math.min(255, g - spillG)),
      Math.max(0, Math.min(255, b - spillB))
    ]
  }

  /**
   * Refine edges using morphological operations
   */
  private refineEdges(imageData: ImageData, alphaChannel: Uint8Array): ImageData {
    const width = imageData.width
    const height = imageData.height
    const refined = new ImageData(
      new Uint8ClampedArray(imageData.data),
      width,
      height
    )

    // Simple edge smoothing kernel
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ]
    const kernelSum = 16

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerAlpha = alphaChannel[y * width + x]
        
        // Only process edge pixels
        if (centerAlpha > 10 && centerAlpha < 245) {
          let weightedSum = 0
          let totalWeight = 0

          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const alpha = alphaChannel[(y + ky) * width + (x + kx)]
              const weight = kernel[ky + 1][kx + 1]
              weightedSum += alpha * weight
              totalWeight += weight
            }
          }

          const smoothedAlpha = weightedSum / totalWeight
          const pixelIndex = (y * width + x) * 4

          // Apply smoothed alpha
          const bgIndex = pixelIndex
          const alpha = smoothedAlpha / 255
          refined.data[pixelIndex] = Math.round(
            refined.data[pixelIndex] * alpha + imageData.data[bgIndex] * (1 - alpha)
          )
          refined.data[pixelIndex + 1] = Math.round(
            refined.data[pixelIndex + 1] * alpha + imageData.data[bgIndex + 1] * (1 - alpha)
          )
          refined.data[pixelIndex + 2] = Math.round(
            refined.data[pixelIndex + 2] * alpha + imageData.data[bgIndex + 2] * (1 - alpha)
          )
        }
      }
    }

    return refined
  }

  /**
   * Analyze video frame to suggest optimal chroma key settings
   */
  analyzeFrame(imageData: ImageData): ChromaKeySettings {
    const data = imageData.data
    const greenPixels: Array<{ r: number; g: number; b: number }> = []

    // Sample green pixels
    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Detect likely green screen pixels
      if (g > r + 30 && g > b + 30 && g > 100) {
        greenPixels.push({ r, g, b })
      }
    }

    if (greenPixels.length === 0) {
      return { threshold: 0.4, smoothness: 0.1, spill: 0.1 }
    }

    // Calculate average green values
    const avgGreen = greenPixels.reduce((sum, pixel) => sum + pixel.g, 0) / greenPixels.length
    const avgRed = greenPixels.reduce((sum, pixel) => sum + pixel.r, 0) / greenPixels.length
    const avgBlue = greenPixels.reduce((sum, pixel) => sum + pixel.b, 0) / greenPixels.length

    // Calculate variance to determine smoothness
    const variance = greenPixels.reduce((sum, pixel) => {
      const diff = pixel.g - avgGreen
      return sum + diff * diff
    }, 0) / greenPixels.length

    const normalizedVariance = Math.sqrt(variance) / 255

    return {
      threshold: Math.max(0.2, Math.min(0.8, (avgGreen - Math.max(avgRed, avgBlue)) / 255)),
      smoothness: Math.max(0.05, Math.min(0.3, normalizedVariance)),
      spill: Math.max(0.05, Math.min(0.2, normalizedVariance * 0.5)),
      keyColor: [avgRed, avgGreen, avgBlue]
    }
  }
}