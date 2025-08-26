import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { supportConversations, supportMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Get conversation
    const conversation = await db.select()
      .from(supportConversations)
      .where(eq(supportConversations.id, parseInt(id)))
      .limit(1);

    if (conversation.length === 0) {
      return NextResponse.json({ 
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    // Get all messages for this conversation
    const messages = await db.select()
      .from(supportMessages)
      .where(eq(supportMessages.conversationId, parseInt(id)))
      .orderBy(supportMessages.createdAt);

    // Return conversation with nested messages array
    const result = {
      ...conversation[0],
      messages: messages
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if conversation exists
    const existing = await db.select()
      .from(supportConversations)
      .where(eq(supportConversations.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Conversation not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Add provided fields to update object
    if (body.status !== undefined) {
      updates.status = body.status;
      
      // If escalating, set escalatedAt timestamp
      if (body.status === 'escalated') {
        updates.escalatedAt = new Date().toISOString();
        updates.isAiHandled = false;
      }
    }

    if (body.agentName !== undefined) {
      updates.agentName = body.agentName.trim();
    }

    if (body.isAiHandled !== undefined) {
      updates.isAiHandled = body.isAiHandled;
    }

    if (body.escalatedAt !== undefined) {
      updates.escalatedAt = body.escalatedAt;
    }

    // Update conversation
    const updated = await db.update(supportConversations)
      .set(updates)
      .where(eq(supportConversations.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}