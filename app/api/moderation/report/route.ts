import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reporterId, reportedUserId, reportedEventId, reason, description } = body;

    // Validation
    if (!reporterId || !reason) {
      return NextResponse.json(
        { error: 'Reporter ID and reason are required' },
        { status: 400 }
      );
    }

    // Must report either a user or an event, not both or neither
    if ((!reportedUserId && !reportedEventId) || (reportedUserId && reportedEventId)) {
      return NextResponse.json(
        { error: 'Must report either a user or an event, not both' },
        { status: 400 }
      );
    }

    // Validate reason
    const validReasons = ['spam', 'harassment', 'inappropriate_content', 'hate_speech', 'violence', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid report reason' },
        { status: 400 }
      );
    }

    // Check if user has already reported this content
    const existingReport = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.reporterId, reporterId),
          reportedUserId
            ? eq(reports.reportedUserId, reportedUserId)
            : eq(reports.reportedEventId, reportedEventId!)
        )
      )
      .limit(1);

    if (existingReport.length > 0) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 409 }
      );
    }

    // Create report
    const [report] = await db
      .insert(reports)
      .values({
        reporterId,
        reportedUserId: reportedUserId || null,
        reportedEventId: reportedEventId || null,
        reason,
        description: description || null,
      })
      .returning();

    return NextResponse.json({
      message: 'Report submitted successfully. Our team will review it shortly.',
      report,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

// Get reports (for admin/moderation purposes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reporterId = searchParams.get('reporterId');
    const status = searchParams.get('status') || 'pending';

    let allReports;

    if (reporterId) {
      allReports = await db
        .select()
        .from(reports)
        .where(eq(reports.reporterId, reporterId));
    } else {
      // If no reporter specified, filter by status
      allReports = await db
        .select()
        .from(reports)
        .where(eq(reports.status, status));
    }

    return NextResponse.json(allReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
