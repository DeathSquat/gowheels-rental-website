import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { eq, like, and, or, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Filter parameters
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const availabilityStatus = searchParams.get('availabilityStatus');
    
    let query = db.select().from(vehicles);
    
    // Build where conditions array
    const conditions = [];
    
    // Search across name, type, and locationAddress
    if (search) {
      conditions.push(
        or(
          like(vehicles.name, `%${search}%`),
          like(vehicles.type, `%${search}%`),
          like(vehicles.locationAddress, `%${search}%`)
        )
      );
    }
    
    // Filter by type
    if (type) {
      conditions.push(eq(vehicles.type, type));
    }
    
    // Filter by price range
    if (minPrice) {
      conditions.push(gte(vehicles.pricePerDay, minPrice));
    }
    
    if (maxPrice) {
      conditions.push(lte(vehicles.pricePerDay, maxPrice));
    }
    
    // Filter by availability status
    if (availabilityStatus !== null && availabilityStatus !== undefined) {
      const isAvailable = availabilityStatus === 'true';
      conditions.push(eq(vehicles.availabilityStatus, isAvailable));
    }
    
    // Apply conditions if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('GET vehicles error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'imageUrl', 'seats', 'transmission', 'fuelType', 'pricePerDay', 'locationAddress'];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ 
          error: `${field} is required`,
          code: "MISSING_REQUIRED_FIELD" 
        }, { status: 400 });
      }
    }
    
    // Validate data types
    if (typeof body.seats !== 'number' || body.seats <= 0) {
      return NextResponse.json({ 
        error: "Seats must be a positive number",
        code: "INVALID_SEATS" 
      }, { status: 400 });
    }
    
    // Sanitize inputs
    const sanitizedData = {
      name: body.name.toString().trim(),
      type: body.type.toString().trim(),
      imageUrl: body.imageUrl.toString().trim(),
      seats: parseInt(body.seats),
      transmission: body.transmission.toString().trim(),
      fuelType: body.fuelType.toString().trim(),
      pricePerDay: body.pricePerDay.toString().trim(),
      locationAddress: body.locationAddress.toString().trim(),
    };
    
    // Optional fields with proper handling
    const vehicleData = {
      ...sanitizedData,
      // Handle JSON fields
      galleryImages: body.galleryImages ? JSON.stringify(body.galleryImages) : null,
      amenities: body.amenities ? JSON.stringify(body.amenities) : null,
      
      // Optional fields
      doors: body.doors ? parseInt(body.doors) : null,
      pricePerHour: body.pricePerHour ? body.pricePerHour.toString().trim() : null,
      locationLat: body.locationLat ? body.locationLat.toString().trim() : null,
      locationLng: body.locationLng ? body.locationLng.toString().trim() : null,
      cancellationPolicy: body.cancellationPolicy ? body.cancellationPolicy.toString().trim() : null,
      
      // Defaults
      rating: '0',
      reviewCount: 0,
      availabilityStatus: true,
      isActive: true,
      
      // System generated timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Create the vehicle
    const newVehicle = await db.insert(vehicles)
      .values(vehicleData)
      .returning();
    
    return NextResponse.json(newVehicle[0], { status: 201 });
  } catch (error) {
    console.error('POST vehicles error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    // Check if vehicle exists
    const existingVehicle = await db.select()
      .from(vehicles)
      .where(eq(vehicles.id, parseInt(id)))
      .limit(1);
    
    if (existingVehicle.length === 0) {
      return NextResponse.json({ 
        error: 'Vehicle not found' 
      }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Prepare updates object
    const updates: any = {
      updatedAt: new Date().toISOString()
    };
    
    // Update fields if provided
    if (body.name !== undefined) {
      updates.name = body.name.toString().trim();
    }
    
    if (body.type !== undefined) {
      updates.type = body.type.toString().trim();
    }
    
    if (body.imageUrl !== undefined) {
      updates.imageUrl = body.imageUrl.toString().trim();
    }
    
    if (body.seats !== undefined) {
      if (typeof body.seats !== 'number' || body.seats <= 0) {
        return NextResponse.json({ 
          error: "Seats must be a positive number",
          code: "INVALID_SEATS" 
        }, { status: 400 });
      }
      updates.seats = parseInt(body.seats);
    }
    
    if (body.transmission !== undefined) {
      updates.transmission = body.transmission.toString().trim();
    }
    
    if (body.fuelType !== undefined) {
      updates.fuelType = body.fuelType.toString().trim();
    }
    
    if (body.pricePerDay !== undefined) {
      updates.pricePerDay = body.pricePerDay.toString().trim();
    }
    
    if (body.locationAddress !== undefined) {
      updates.locationAddress = body.locationAddress.toString().trim();
    }
    
    if (body.galleryImages !== undefined) {
      updates.galleryImages = JSON.stringify(body.galleryImages);
    }
    
    if (body.amenities !== undefined) {
      updates.amenities = JSON.stringify(body.amenities);
    }
    
    if (body.doors !== undefined) {
      updates.doors = body.doors ? parseInt(body.doors) : null;
    }
    
    if (body.pricePerHour !== undefined) {
      updates.pricePerHour = body.pricePerHour ? body.pricePerHour.toString().trim() : null;
    }
    
    if (body.rating !== undefined) {
      updates.rating = body.rating.toString();
    }
    
    if (body.reviewCount !== undefined) {
      updates.reviewCount = parseInt(body.reviewCount);
    }
    
    if (body.locationLat !== undefined) {
      updates.locationLat = body.locationLat ? body.locationLat.toString().trim() : null;
    }
    
    if (body.locationLng !== undefined) {
      updates.locationLng = body.locationLng ? body.locationLng.toString().trim() : null;
    }
    
    if (body.availabilityStatus !== undefined) {
      updates.availabilityStatus = Boolean(body.availabilityStatus);
    }
    
    if (body.cancellationPolicy !== undefined) {
      updates.cancellationPolicy = body.cancellationPolicy ? body.cancellationPolicy.toString().trim() : null;
    }
    
    if (body.isActive !== undefined) {
      updates.isActive = Boolean(body.isActive);
    }
    
    // Update the vehicle
    const updated = await db.update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, parseInt(id)))
      .returning();
    
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT vehicles error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }
    
    // Check if vehicle exists
    const existingVehicle = await db.select()
      .from(vehicles)
      .where(eq(vehicles.id, parseInt(id)))
      .limit(1);
    
    if (existingVehicle.length === 0) {
      return NextResponse.json({ 
        error: 'Vehicle not found' 
      }, { status: 404 });
    }
    
    // Delete the vehicle
    const deleted = await db.delete(vehicles)
      .where(eq(vehicles.id, parseInt(id)))
      .returning();
    
    return NextResponse.json({
      message: 'Vehicle deleted successfully',
      deletedVehicle: deleted[0]
    });
  } catch (error) {
    console.error('DELETE vehicles error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}