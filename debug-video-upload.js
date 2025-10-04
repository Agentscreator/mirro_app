// Debug script to test video upload functionality
console.log('Testing video upload functionality...');

// Test 1: Check if MediaRecorder is supported
console.log('1. MediaRecorder support:', typeof MediaRecorder !== 'undefined');

if (typeof MediaRecorder !== 'undefined') {
  // Test 2: Check supported MIME types
  const videoTypes = [
    'video/webm',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm;codecs=h264'
  ];
  
  console.log('2. Supported video MIME types:');
  videoTypes.forEach(type => {
    console.log(`   ${type}: ${MediaRecorder.isTypeSupported(type)}`);
  });
}

// Test 3: Check getUserMedia support
console.log('3. getUserMedia support:', 
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
);

// Test 4: Test upload endpoint
async function testUploadEndpoint() {
  try {
    // Create a small test blob
    const testBlob = new Blob(['test video data'], { type: 'video/webm' });
    const formData = new FormData();
    formData.append('file', testBlob, 'test.webm');
    formData.append('type', 'video');
    
    console.log('4. Testing upload endpoint...');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    console.log('   Upload response status:', response.status);
    const result = await response.json();
    console.log('   Upload response:', result);
    
  } catch (error) {
    console.error('   Upload test failed:', error);
  }
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  testUploadEndpoint();
}