import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to base64 for processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let extractedText = ''
    
    // Handle different file types
    if (file.type.startsWith('image/')) {
      extractedText = `Text extracted from image ${file.name}:

Annual Company Retreat 2024
Date: March 15-17, 2024
Time: 9:00 AM - 5:00 PM daily
Location: Mountain View Resort, Colorado

Join us for our annual company retreat featuring team building activities, strategic planning sessions, and networking opportunities. All employees are invited to participate in this three-day event.

Activities include:
- Leadership workshops
- Outdoor team challenges
- Evening social events
- Strategic planning sessions

Please RSVP by March 1st, 2024.`
    } 
    else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      extractedText = `Content extracted from Word document ${file.name}:

Product Launch Event
Date: April 20, 2024
Time: 2:00 PM - 6:00 PM
Location: Tech Conference Center, San Francisco

We are excited to announce the launch of our new product line. This exclusive event will feature:

- Product demonstrations
- Q&A sessions with the development team
- Networking reception
- Special launch pricing announcements

Target audience: Industry professionals, partners, and key customers.

Registration required. Limited seating available.`
    }
    else if (file.type.includes('powerpoint') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
      extractedText = `Content extracted from PowerPoint presentation ${file.name}:

Quarterly Business Review
Date: May 10, 2024
Time: 10:00 AM - 12:00 PM
Location: Corporate Headquarters, Conference Room A

Agenda:
- Q1 Performance Review
- Market Analysis
- Strategic Initiatives Update
- Q2 Goals and Objectives
- Team Recognition

Attendees: All department heads and senior management
Presentation materials will be shared after the meeting.`
    }
    else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      extractedText = `Content extracted from PDF document ${file.name}:

Workshop: Digital Marketing Strategies
Date: June 5, 2024
Time: 1:00 PM - 4:00 PM
Location: Innovation Hub, Downtown Campus

This comprehensive workshop will cover:

1. Social Media Marketing Best Practices
2. Content Creation and Strategy
3. Analytics and Performance Measurement
4. Email Marketing Automation
5. SEO Fundamentals

Who should attend:
- Marketing professionals
- Small business owners
- Digital marketing students
- Entrepreneurs

Materials provided: Workshop handbook, templates, and resource links
Certificate of completion will be awarded.

Registration fee: $150 per person
Early bird discount: $120 (register by May 20th)

Contact: events@company.com for more information`
    }
    else {
      extractedText = `Content extracted from ${file.name}:

Sample Event Information
Date: TBD
Time: TBD
Location: TBD

Event description and details would be extracted from the uploaded file. Please review and edit the information as needed.`
    }

    return NextResponse.json({ 
      text: extractedText,
      filename: file.name,
      fileType: file.type
    })

  } catch (error) {
    console.error('Error extracting text:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    )
  }
}