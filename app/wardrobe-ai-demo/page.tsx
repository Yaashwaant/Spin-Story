import { UploadDropzone } from "@/components/wardrobe/upload-dropzone"

export default function WardrobeAIDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Wardrobe Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Upload photos of your clothing and let AI automatically analyze and categorize them
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Image Upload Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add Clothing by Photo
            </h2>
            <p className="text-gray-600 mb-4">
              Upload a photo of your clothing item and our AI will automatically:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• Identify the clothing type and style</li>
              <li>• Detect colors and patterns</li>
              <li>• Suggest season appropriateness</li>
              <li>• Generate style tags</li>
            </ul>
            <UploadDropzone customerId="demo-customer" />
          </div>

          {/* Demo Wardrobe Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Demo Wardrobe
            </h2>
            <p className="text-gray-600 mb-4">
              Here's your current wardrobe with AI-analyzed items:
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img src="/classic-denim-jacket.png" alt="Blue Denim Jacket" className="w-12 h-12 object-cover rounded" />
                <div>
                  <p className="font-medium">Blue Denim Jacket</p>
                  <p className="text-sm text-gray-600">Casual • Vintage • All Season</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img src="/black-blazer.jpg" alt="Black Blazer" className="w-12 h-12 object-cover rounded" />
                <div>
                  <p className="font-medium">Black Blazer</p>
                  <p className="text-sm text-gray-600">Formal • Business • Fall/Winter</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img src="/white-minimalist-sneakers.png" alt="White Sneakers" className="w-12 h-12 object-cover rounded" />
                <div>
                  <p className="font-medium">White Minimalist Sneakers</p>
                  <p className="text-sm text-gray-600">Casual • Modern • All Season</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> Upload photos of your own clothes to build a complete digital wardrobe. 
                The AI will analyze each item and help you create perfect outfit combinations!
              </p>
            </div>
          </div>
        </div>

        {/* AI Outfit Planning */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            AI Outfit Planning
          </h2>
          <p className="text-gray-600 mb-4">
            Based on your wardrobe, here's what our AI suggests for different occasions:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Casual Weekend</h3>
              <p className="text-sm text-green-800">
                Blue Denim Jacket + White T-Shirt + Denim Jeans + White Sneakers
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Smart Casual</h3>
              <p className="text-sm text-purple-800">
                Black Blazer + White T-Shirt + Denim Jeans + Brown Boots
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-medium text-orange-900 mb-2">Fall Style</h3>
              <p className="text-sm text-orange-800">
                Beige Trench Coat + Red Scarf + Denim Jeans + Brown Boots
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}