import { getEventById } from '@/lib/auth'

interface DebugEventPageProps {
  params: { eventId: string }
}

export default async function DebugEventPage({ params }: DebugEventPageProps) {
  let event = null
  let error = null

  try {
    console.log('Debug: Loading event with ID:', params.eventId)
    event = await getEventById(params.eventId)
    console.log('Debug: Event result:', event)
  } catch (e) {
    console.error('Debug: Error loading event:', e)
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Event Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Event ID:</strong> {params.eventId}
        </div>
        
        <div>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </div>
        
        <div>
          <strong>Database URL exists:</strong> {process.env.DATABASE_URL ? 'Yes' : 'No'}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {event ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Event Found:</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        ) : !error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <strong>Event Not Found</strong>
          </div>
        )}
        
        <div className="mt-8">
          <a 
            href={`/?event=${params.eventId}`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Main App with Event Modal
          </a>
        </div>
      </div>
    </div>
  )
}