import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supportMessages } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const conversationId = searchParams.get('conversationId');
    const senderType = searchParams.get('senderType');

    let query = db.select().from(supportMessages);

    // Apply filters
    const conditions = [];
    if (conversationId) {
      const convId = parseInt(conversationId);
      if (!isNaN(convId)) {
        conditions.push(eq(supportMessages.conversationId, convId));
      }
    }
    if (senderType) {
      conditions.push(eq(supportMessages.senderType, senderType));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(supportMessages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      conversationId, 
      senderType, 
      content, 
      attachmentUrl, 
      attachmentName, 
      aiGenerated 
    } = body;

    // Validate required fields
    if (!conversationId) {
      return NextResponse.json(
        { 
          error: "conversationId is required",
          code: "MISSING_CONVERSATION_ID" 
        },
        { status: 400 }
      );
    }

    if (!senderType) {
      return NextResponse.json(
        { 
          error: "senderType is required",
          code: "MISSING_SENDER_TYPE" 
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { 
          error: "content is required",
          code: "MISSING_CONTENT" 
        },
        { status: 400 }
      );
    }

    // Validate conversationId is a valid integer
    const convId = parseInt(conversationId);
    if (isNaN(convId)) {
      return NextResponse.json(
        { 
          error: "conversationId must be a valid integer",
          code: "INVALID_CONVERSATION_ID" 
        },
        { status: 400 }
      );
    }

    // Prepare the data with defaults and auto-generated fields
    const messageData = {
      conversationId: convId,
      senderType: senderType.trim(),
      content: content.trim(),
      attachmentUrl: attachmentUrl?.trim() || null,
      attachmentName: attachmentName?.trim() || null,
      isEscalated: false,
      aiGenerated: aiGenerated || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newMessage = await db.insert(supportMessages)
      .values(messageData)
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}