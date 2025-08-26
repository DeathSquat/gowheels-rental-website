import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json({
        error: "User ID is required",
        code: "MISSING_USER_ID"
      }, { status: 400 });
    }

    if (isNaN(parseInt(userId))) {
      return NextResponse.json({
        error: "Valid User ID is required",
        code: "INVALID_USER_ID"
      }, { status: 400 });
    }

    // Find user by ID and check if active
    const user = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      profileImageUrl: users.profileImageUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastLoginAt: users.lastLoginAt,
      isActive: users.isActive
    })
      .from(users)
      .where(
        and(
          eq(users.id, parseInt(userId)),
          eq(users.isActive, true)
        )
      )
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({
        error: "User not found or inactive",
        code: "USER_NOT_FOUND"
      }, { status: 404 });
    }

    return NextResponse.json(user[0], { status: 200 });

  } catch (error) {
    console.error('GET user error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: "INTERNAL_SERVER_ERROR"
    }, { status: 500 });
  }
}