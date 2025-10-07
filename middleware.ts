import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Debug logging for all requests
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 MIDDLEWARE DEBUG:');
    console.log('   Method:', request.method);
    console.log('   URL:', request.url);
    console.log('   Pathname:', request.nextUrl.pathname);
    console.log('   Search Params:', Object.fromEntries(request.nextUrl.searchParams));
    console.log('   Headers:', Object.fromEntries(request.headers.entries()));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Handle CORS for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // Check content length before processing (except for upload endpoint)
        const contentLength = request.headers.get('content-length');
        const isUploadEndpoint = request.nextUrl.pathname === '/api/upload';
        
        if (contentLength && !isUploadEndpoint && parseInt(contentLength) > 15 * 1024 * 1024) { // 15MB limit for non-upload endpoints
            return NextResponse.json(
                { error: 'Request too large. Maximum size is 15MB.' },
                {
                    status: 413,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    }
                }
            );
        }
        
        // For upload endpoint, allow up to 1000MB (matching the upload route limit)
        if (contentLength && isUploadEndpoint && parseInt(contentLength) > 1000 * 1024 * 1024) { // 1000MB limit for uploads
            return NextResponse.json(
                { error: 'File too large. Maximum size is 1000MB.' },
                {
                    status: 413,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    }
                }
            );
        }

        const response = NextResponse.next();
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};