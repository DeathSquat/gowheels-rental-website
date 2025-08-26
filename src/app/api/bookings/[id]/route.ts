import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    const booking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);
    if (booking.length === 0) {
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 });
    }
    return NextResponse.json(booking[0]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);
    if (existingBooking.length === 0) {
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 });
    }
    const body = await request.json();
    const updates: any = {};
    if (body.pickupDate !== undefined) updates.pickupDate = body.pickupDate;
    if (body.returnDate !== undefined) updates.returnDate = body.returnDate;
    if (body.pickupTime !== undefined) updates.pickupTime = body.pickupTime;
    if (body.returnTime !== undefined) updates.returnTime = body.returnTime;
    if (body.pickupAddress !== undefined) updates.pickupAddress = body.pickupAddress?.trim();
    if (body.dropoffAddress !== undefined) updates.dropoffAddress = body.dropoffAddress?.trim();
    if (body.driverName !== undefined) updates.driverName = body.driverName?.trim();
    if (body.driverPhone !== undefined) updates.driverPhone = body.driverPhone?.trim();
    if (body.driverEmail !== undefined) updates.driverEmail = body.driverEmail?.toLowerCase()?.trim();
    if (body.extrasInsurance !== undefined) updates.extrasInsurance = body.extrasInsurance;
    if (body.extrasDriver !== undefined) updates.extrasDriver = body.extrasDriver;
    if (body.extrasChildSeat !== undefined) updates.extrasChildSeat = body.extrasChildSeat;
    if (body.promoCode !== undefined) updates.promoCode = body.promoCode?.trim();
    if (body.basePrice !== undefined) updates.basePrice = body.basePrice;
    if (body.extrasPrice !== undefined) updates.extrasPrice = body.extrasPrice;
    if (body.taxes !== undefined) updates.taxes = body.taxes;
    if (body.totalAmount !== undefined) updates.totalAmount = body.totalAmount;
    if (body.paymentMethod !== undefined) updates.paymentMethod = body.paymentMethod?.trim();
    if (body.status !== undefined) updates.status = body.status?.trim();
    updates.updatedAt = new Date().toISOString();
    const updated = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, parseInt(id)))
      .returning();
    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update booking' 
      }, { status: 500 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);
    if (existingBooking.length === 0) {
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 });
    }
    const cancelled = await db.update(bookings)
      .set({
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      .where(eq(bookings.id, parseInt(id)))
      .returning();
    if (cancelled.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to cancel booking' 
      }, { status: 500 });
    }
    return NextResponse.json({
      message: 'Booking cancelled successfully',
      booking: cancelled[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}