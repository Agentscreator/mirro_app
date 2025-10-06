export default function TestEventPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🧪 Test Event Page</h1>
      <p><strong>Event ID:</strong> {params.id}</p>
      <p><strong>Route:</strong> /test-event/[id]</p>
      <p>If you can see this, dynamic routing is working!</p>
    </div>
  )
}