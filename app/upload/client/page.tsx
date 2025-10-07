'use client';

import { useState, useRef } from 'react';

interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  type: string;
}

export default function ClientUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Upload (R2)</h1>
          <p className="text-gray-600 mb-8">Upload files to Cloudflare R2 from your browser</p>

          <form
            onSubmit={async (event) => {
              event.preventDefault();

              if (!inputFileRef.current?.files?.[0]) {
                setError('Please select a file');
                return;
              }

              const file = inputFileRef.current.files[0];

              setUploading(true);
              setError(null);

              try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', file.type.startsWith('image/') ? 'image' : 'video');

                const response = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Upload failed');
                }

                const result = await response.json();
                setUploadResult(result);
              } catch (err) {
                setError((err as Error).message || 'Upload failed');
              } finally {
                setUploading(false);
              }
            }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Choose File
              </label>
              <input
                id="file-upload"
                name="file"
                ref={inputFileRef}
                type="file"
                accept="image/*,video/*"
                required
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-900 file:text-white
                  hover:file:bg-gray-800
                  file:cursor-pointer cursor-pointer"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-full font-semibold
                hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>

          {uploadResult && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Upload Successful!</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-700">File URL:</span>
                  <a
                    href={uploadResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 break-all mt-1"
                  >
                    {uploadResult.url}
                  </a>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-700">Filename:</span>
                  <span className="block text-sm text-gray-700 mt-1">{uploadResult.filename}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-green-700">Size:</span>
                  <span className="block text-sm text-gray-700 mt-1">{Math.round(uploadResult.size / 1024)} KB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
