import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Password is required",
        code: "MISSING_PASSWORD" 
      }, { status: 400 });
    }

    // Sanitize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ 
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS" 
      }, { status: 401 });
    }

    const user = userResult[0];

    // Check if user account is active
    if (!user.isActive) {
      return NextResponse.json({ 
        error: "Account is not active. Please contact support.",
        code: "ACCOUNT_INACTIVE" 
      }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS" 
      }, { status: 401 });
    }

    // Update lastLoginAt timestamp
    const currentTimestamp = new Date().toISOString();
    const updatedUser = await db.update(users)
      .set({
        lastLoginAt: currentTimestamp,
        updatedAt: currentTimestamp
      })
      .where(eq(users.id, user.id))
      .returning();

    // Return user object without password hash
    const { passwordHash, ...userWithoutPassword } = updatedUser[0];

    return NextResponse.json({
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
      phone: userWithoutPassword.phone,
      role: userWithoutPassword.role,
      profileImageUrl: userWithoutPassword.profileImageUrl,
      createdAt: userWithoutPassword.createdAt,
      updatedAt: userWithoutPassword.updatedAt,
      lastLoginAt: userWithoutPassword.lastLoginAt,
      isActive: userWithoutPassword.isActive
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}