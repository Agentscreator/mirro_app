import { GreenScreenVideo } from '@/components/green-screen-video'
import { SimpleGreenScreen } from '@/components/simple-green-screen'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function GreenScreenPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Green Screen Video Processor</h1>
          <p className="text-lg text-muted-foreground">
            Remove green backgrounds from videos and replace them with custom content
          </p>
        </div>

        <Tabs defaultValue="simple" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Simple Green Screen</TabsTrigger>
            <TabsTrigger value="advanced">Advanced WebGL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple" className="mt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Simple Green Screen</h2>
                <p className="text-muted-foreground">
                  Easy-to-use green screen removal with static background images
                </p>
              </div>
              <SimpleGreenScreen />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Advanced WebGL Processing</h2>
                <p className="text-muted-foreground">
                  Professional-grade chroma keying with video backgrounds and advanced controls
                </p>
              </div>
              <GreenScreenVideo />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 space-y-6">
          <h3 className="text-2xl font-semibold">How to Use</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Simple Green Screen</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Upload a video with a green screen background</li>
                <li>Upload a background image to replace the green screen</li>
                <li>Adjust the threshold slider to fine-tune green detection</li>
                <li>Click Play to preview the result</li>
                <li>Click "Record & Download" to save the processed video</li>
              </ol>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Advanced WebGL</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Upload a green screen video and background video</li>
                <li>Fine-tune chroma key settings (threshold, smoothness, spill)</li>
                <li>Preview real-time processing with WebGL acceleration</li>
                <li>Download the composited result</li>
              </ol>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Tips for Best Results</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use evenly lit green screens without shadows or wrinkles</li>
              <li>Ensure good separation between subject and green screen</li>
              <li>Avoid wearing green clothing or accessories</li>
              <li>Use proper lighting to minimize color spill</li>
              <li>Start with default settings and adjust gradually</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}