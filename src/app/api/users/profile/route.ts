import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId parameter
    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({
        error: "Valid userId is required",
        code: "INVALID_USER_ID"
      }, { status: 400 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({
        error: "Invalid JSON payload",
        code: "INVALID_JSON"
      }, { status: 400 });
    }

    // Extract and validate allowed fields
    const { name, phone, profileImageUrl } = body;
    
    // Check if at least one field is provided
    if (!name && !phone && !profileImageUrl) {
      return NextResponse.json({
        error: "At least one field (name, phone, profileImageUrl) must be provided",
        code: "NO_FIELDS_PROVIDED"
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({
        error: "User not found",
        code: "USER_NOT_FOUND"
      }, { status: 404 });
    }

    // Prepare update data - only include provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json({
          error: "Name must be a string",
          code: "INVALID_NAME_TYPE"
        }, { status: 400 });
      }
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        return NextResponse.json({
          error: "Name cannot be empty",
          code: "EMPTY_NAME"
        }, { status: 400 });
      }
      updateData.name = trimmedName;
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string') {
        return NextResponse.json({
          error: "Phone must be a string",
          code: "INVALID_PHONE_TYPE"
        }, { status: 400 });
      }
      const trimmedPhone = phone.trim();
      if (trimmedPhone.length === 0) {
        return NextResponse.json({
          error: "Phone cannot be empty",
          code: "EMPTY_PHONE"
        }, { status: 400 });
      }
      updateData.phone = trimmedPhone;
    }

    if (profileImageUrl !== undefined) {
      if (profileImageUrl !== null && typeof profileImageUrl !== 'string') {
        return NextResponse.json({
          error: "Profile image URL must be a string or null",
          code: "INVALID_PROFILE_IMAGE_TYPE"
        }, { status: 400 });
      }
      updateData.profileImageUrl = profileImageUrl === null ? null : profileImageUrl.trim();
    }

    // Update user
    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(userId)))
      .returning();

    // Remove sensitive information from response
    const { passwordHash, ...userWithoutPassword } = updatedUser[0];

    return NextResponse.json(userWithoutPassword, { status: 200 });

  } catch (error) {
    console.error('PUT /api/users/profile error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: "INTERNAL_ERROR"
    }, { status: 500 });
  }
}