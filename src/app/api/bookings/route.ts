import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, users, vehicles } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const vehicleId = searchParams.get('vehicleId');

    let query = db.select({
      id: bookings.id,
      bookingReference: bookings.bookingReference,
      userId: bookings.userId,
      vehicleId: bookings.vehicleId,
      pickupDate: bookings.pickupDate,
      returnDate: bookings.returnDate,
      pickupTime: bookings.pickupTime,
      returnTime: bookings.returnTime,
      pickupAddress: bookings.pickupAddress,
      dropoffAddress: bookings.dropoffAddress,
      driverName: bookings.driverName,
      driverPhone: bookings.driverPhone,
      driverEmail: bookings.driverEmail,
      extrasInsurance: bookings.extrasInsurance,
      extrasDriver: bookings.extrasDriver,
      extrasChildSeat: bookings.extrasChildSeat,
      promoCode: bookings.promoCode,
      basePrice: bookings.basePrice,
      extrasPrice: bookings.extrasPrice,
      taxes: bookings.taxes,
      totalAmount: bookings.totalAmount,
      paymentMethod: bookings.paymentMethod,
      status: bookings.status,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone
      },
      vehicle: {
        id: vehicles.id,
        name: vehicles.name,
        type: vehicles.type,
        imageUrl: vehicles.imageUrl,
        seats: vehicles.seats,
        transmission: vehicles.transmission,
        fuelType: vehicles.fuelType,
        pricePerDay: vehicles.pricePerDay
      }
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .orderBy(desc(bookings.createdAt));

    const conditions = [];
    
    if (userId) {
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return NextResponse.json({ 
          error: "Valid userId is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(bookings.userId, userIdNum));
    }

    if (status) {
      conditions.push(eq(bookings.status, status));
    }

    if (vehicleId) {
      const vehicleIdNum = parseInt(vehicleId);
      if (isNaN(vehicleIdNum)) {
        return NextResponse.json({ 
          error: "Valid vehicleId is required",
          code: "INVALID_VEHICLE_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(bookings.vehicleId, vehicleIdNum));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
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

    // Validate required fields
    const requiredFields = [
      'userId', 'vehicleId', 'pickupDate', 'returnDate', 
      'pickupAddress', 'dropoffAddress', 'driverName', 
      'driverPhone', 'driverEmail', 'basePrice', 
      'taxes', 'totalAmount', 'paymentMethod'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ 
          error: `${field} is required`,
          code: "MISSING_REQUIRED_FIELD" 
        }, { status: 400 });
      }
    }

    // Validate user exists
    const userExists = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, parseInt(body.userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate vehicle exists
    const vehicleExists = await db.select({ id: vehicles.id })
      .from(vehicles)
      .where(eq(vehicles.id, parseInt(body.vehicleId)))
      .limit(1);

    if (vehicleExists.length === 0) {
      return NextResponse.json({ 
        error: "Vehicle not found",
        code: "VEHICLE_NOT_FOUND" 
      }, { status: 400 });
    }

    // Generate booking reference
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `BK-${dateStr}-${randomNum}`;

    // Sanitize inputs
    const sanitizedData = {
      bookingReference,
      userId: parseInt(body.userId),
      vehicleId: parseInt(body.vehicleId),
      pickupDate: body.pickupDate.trim(),
      returnDate: body.returnDate.trim(),
      pickupTime: body.pickupTime?.trim() || null,
      returnTime: body.returnTime?.trim() || null,
      pickupAddress: body.pickupAddress.trim(),
      dropoffAddress: body.dropoffAddress.trim(),
      driverName: body.driverName.trim(),
      driverPhone: body.driverPhone.trim(),
      driverEmail: body.driverEmail.toLowerCase().trim(),
      extrasInsurance: body.extrasInsurance || false,
      extrasDriver: body.extrasDriver || false,
      extrasChildSeat: body.extrasChildSeat || false,
      promoCode: body.promoCode?.trim() || null,
      basePrice: body.basePrice.trim(),
      extrasPrice: body.extrasPrice || '0',
      taxes: body.taxes.trim(),
      totalAmount: body.totalAmount.trim(),
      paymentMethod: body.paymentMethod.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newBooking = await db.insert(bookings)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}