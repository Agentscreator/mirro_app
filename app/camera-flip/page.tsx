'use client'

import { useState } from 'react'
import UnifiedCamera from '@/components/UnifiedCamera'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CameraFlipPage() {
  const [showCamera, setShowCamera] = useState(false)
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; type: 'photo' | 'video' } | null>(null)

  const handleCapture = (url: string, type: 'photo' | 'video') => {
    setCapturedMedia({ url, type })
    setShowCamera(false)
  }

  const handleCloseCamera = () => {
    setShowCamera(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Camera Flip Demo</h1>
          <p className="text-lg text-muted-foreground">
            Test the flip camera functionality to switch between front and back cameras
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Camera Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button 
                  onClick={() => setShowCamera(true)}
                  size="lg"
                  className="w-full max-w-md"
                >
                  Open Camera
                </Button>
              </div>
              
              {capturedMedia && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Last Captured Media:</h3>
                  <div className="flex justify-center">
                    {capturedMedia.type === 'photo' ? (
                      <img 
                        src={capturedMedia.url} 
                        alt="Captured photo" 
                        className="max-w-full max-h-96 rounded-lg shadow-lg"
                      />
                    ) : (
                      <video 
                        src={capturedMedia.url} 
                        controls 
                        className="max-w-full max-h-96 rounded-lg shadow-lg"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Use Flip Camera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click "Open Camera" to launch the camera interface</li>
                  <li>Look for the "Flip Camera" button in the effects panel on the right side</li>
                  <li>Tap the flip camera button to switch between front and back cameras</li>
                  <li>The button will be highlighted when using the back camera</li>
                  <li>Take photos or record videos with either camera</li>
                </ol>
                
                <div className="bg-muted p-4 rounded-lg mt-6">
                  <h4 className="font-medium mb-2">Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Seamless switching between front (selfie) and back cameras</li>
                    <li>Maintains video quality and settings when flipping</li>
                    <li>Works with both photo and video modes</li>
                    <li>Visual feedback showing which camera is active</li>
                    <li>Automatic fallback if camera switching fails</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {showCamera && (
          <UnifiedCamera 
            onCapture={handleCapture}
            onClose={handleCloseCamera}
          />
        )}
      </div>
    </div>
  )
}