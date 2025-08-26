import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, bookings } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let query = db.select().from(payments);

    // Build filters
    const filters = [];
    
    if (bookingId) {
      if (isNaN(parseInt(bookingId))) {
        return NextResponse.json({ 
          error: 'Valid booking ID is required',
          code: 'INVALID_BOOKING_ID' 
        }, { status: 400 });
      }
      filters.push(eq(payments.bookingId, parseInt(bookingId)));
    }

    if (status) {
      filters.push(eq(payments.status, status));
    }

    // If userId is provided, we need to join with bookings table
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID' 
        }, { status: 400 });
      }

      const userPayments = await db.select({
        id: payments.id,
        bookingId: payments.bookingId,
        razorpayOrderId: payments.razorpayOrderId,
        razorpayPaymentId: payments.razorpayPaymentId,
        razorpaySignature: payments.razorpaySignature,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        paymentType: payments.paymentType,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt
      })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.id))
      .where(
        and(
          eq(bookings.userId, parseInt(userId)),
          ...filters
        )
      )
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

      return NextResponse.json(userPayments);
    }

    // Apply filters if any
    if (filters.length > 0) {
      query = query.where(and(...filters));
    }

    const results = await query
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, razorpayOrderId, amount, paymentType, currency } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json({ 
        error: 'Booking ID is required',
        code: 'MISSING_BOOKING_ID' 
      }, { status: 400 });
    }

    if (!razorpayOrderId) {
      return NextResponse.json({ 
        error: 'Razorpay Order ID is required',
        code: 'MISSING_RAZORPAY_ORDER_ID' 
      }, { status: 400 });
    }

    if (!amount) {
      return NextResponse.json({ 
        error: 'Amount is required',
        code: 'MISSING_AMOUNT' 
      }, { status: 400 });
    }

    if (!paymentType) {
      return NextResponse.json({ 
        error: 'Payment type is required',
        code: 'MISSING_PAYMENT_TYPE' 
      }, { status: 400 });
    }

    // Validate bookingId is valid integer
    if (isNaN(parseInt(bookingId))) {
      return NextResponse.json({ 
        error: 'Valid booking ID is required',
        code: 'INVALID_BOOKING_ID' 
      }, { status: 400 });
    }

    // Check if booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(bookingId)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ 
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND' 
      }, { status: 400 });
    }

    // Prepare payment data with defaults and system fields
    const paymentData = {
      bookingId: parseInt(bookingId),
      razorpayOrderId: razorpayOrderId.trim(),
      amount: amount.toString(),
      paymentType: paymentType.trim(),
      currency: currency || 'INR',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create new payment
    const newPayment = await db.insert(payments)
      .values(paymentData)
      .returning();

    return NextResponse.json(newPayment[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if payment exists
    const existingPayment = await db.select()
      .from(payments)
      .where(eq(payments.id, parseInt(id)))
      .limit(1);

    if (existingPayment.length === 0) {
      return NextResponse.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const updates = { ...body };

    // Remove id if accidentally included
    delete updates.id;

    // Auto-update timestamp
    updates.updatedAt = new Date().toISOString();

    // Sanitize string fields
    if (updates.razorpayOrderId) {
      updates.razorpayOrderId = updates.razorpayOrderId.trim();
    }
    if (updates.razorpayPaymentId) {
      updates.razorpayPaymentId = updates.razorpayPaymentId.trim();
    }
    if (updates.razorpaySignature) {
      updates.razorpaySignature = updates.razorpaySignature.trim();
    }
    if (updates.paymentType) {
      updates.paymentType = updates.paymentType.trim();
    }
    if (updates.status) {
      updates.status = updates.status.trim();
    }

    // Update payment
    const updatedPayment = await db.update(payments)
      .set(updates)
      .where(eq(payments.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedPayment[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if payment exists
    const existingPayment = await db.select()
      .from(payments)
      .where(eq(payments.id, parseInt(id)))
      .limit(1);

    if (existingPayment.length === 0) {
      return NextResponse.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // Delete payment
    const deletedPayment = await db.delete(payments)
      .where(eq(payments.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Payment deleted successfully',
      payment: deletedPayment[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}