/**
 * Debug utilities for troubleshooting 404 errors and routing issues
 */

export function debugRequest(context: string, data: Record<string, any>) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔍 DEBUG [${context}]:`)
  Object.entries(data).forEach(([key, value]) => {
    console.log(`   ${key}:`, value)
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

export function debugApiRoute(
  routeName: string,
  params: any,
  request: any
) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🔍 API ROUTE DEBUG [${routeName}]:`)
  console.log('   Params:', JSON.stringify(params, null, 2))
  console.log('   URL:', request.url)
  console.log('   Method:', request.method)
  console.log('   Pathname:', new URL(request.url).pathname)
  console.log('   Search Params:', Object.fromEntries(new URL(request.url).searchParams))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

export function debugError(context: string, error: unknown) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error(`❌ ERROR [${context}]:`)
  console.error('   Type:', error?.constructor?.name)
  console.error('   Message:', error instanceof Error ? error.message : 'Unknown')
  console.error('   Stack:', error instanceof Error ? error.stack : undefined)
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

export function debugResponse(context: string, status: number, body: any) {
  const emoji = status >= 200 && status < 300 ? '✅' : '❌'
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`${emoji} RESPONSE [${context}]:`)
  console.log('   Status:', status)
  console.log('   Body:', JSON.stringify(body, null, 2))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}
