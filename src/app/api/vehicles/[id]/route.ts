import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const vehicle = await db.select()
      .from(vehicles)
      .where(eq(vehicles.id, parseInt(id)))
      .limit(1);

    if (vehicle.length === 0) {
      return NextResponse.json({
        error: 'Vehicle not found'
      }, { status: 404 });
    }

    return NextResponse.json(vehicle[0]);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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

    // Sanitize inputs
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name.toString().trim();
    if (body.type !== undefined) updates.type = body.type.toString().trim();
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl.toString().trim();
    if (body.galleryImages !== undefined) updates.galleryImages = body.galleryImages;
    if (body.seats !== undefined) updates.seats = parseInt(body.seats);
    if (body.transmission !== undefined) updates.transmission = body.transmission.toString().trim();
    if (body.fuelType !== undefined) updates.fuelType = body.fuelType.toString().trim();
    if (body.doors !== undefined) updates.doors = parseInt(body.doors);
    if (body.pricePerHour !== undefined) updates.pricePerHour = body.pricePerHour.toString().trim();
    if (body.pricePerDay !== undefined) updates.pricePerDay = body.pricePerDay.toString().trim();
    if (body.amenities !== undefined) updates.amenities = body.amenities;
    if (body.rating !== undefined) updates.rating = body.rating.toString().trim();
    if (body.reviewCount !== undefined) updates.reviewCount = parseInt(body.reviewCount);
    if (body.locationAddress !== undefined) updates.locationAddress = body.locationAddress.toString().trim();
    if (body.locationLat !== undefined) updates.locationLat = body.locationLat.toString().trim();
    if (body.locationLng !== undefined) updates.locationLng = body.locationLng.toString().trim();
    if (body.availabilityStatus !== undefined) updates.availabilityStatus = Boolean(body.availabilityStatus);
    if (body.cancellationPolicy !== undefined) updates.cancellationPolicy = body.cancellationPolicy.toString().trim();
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);

    // Always update timestamp
    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({
        error: 'Failed to update vehicle'
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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

    // Soft delete by setting isActive to false
    const deleted = await db.update(vehicles)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .where(eq(vehicles.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({
        error: 'Failed to delete vehicle'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Vehicle deleted successfully',
      deletedVehicle: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}