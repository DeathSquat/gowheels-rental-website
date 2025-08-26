import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'),
  profileImageUrl: text('profile_image_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  lastLoginAt: text('last_login_at'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  imageUrl: text('image_url').notNull(),
  galleryImages: text('gallery_images', { mode: 'json' }),
  seats: integer('seats').notNull(),
  transmission: text('transmission').notNull(),
  fuelType: text('fuel_type').notNull(),
  doors: integer('doors'),
  pricePerHour: text('price_per_hour'),
  pricePerDay: text('price_per_day').notNull(),
  amenities: text('amenities', { mode: 'json' }),
  rating: text('rating').default('0'),
  reviewCount: integer('review_count').default(0),
  locationAddress: text('location_address').notNull(),
  locationLat: text('location_lat'),
  locationLng: text('location_lng'),
  availabilityStatus: integer('availability_status', { mode: 'boolean' }).default(true),
  cancellationPolicy: text('cancellation_policy'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingReference: text('booking_reference').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  pickupDate: text('pickup_date').notNull(),
  returnDate: text('return_date').notNull(),
  pickupTime: text('pickup_time'),
  returnTime: text('return_time'),
  pickupAddress: text('pickup_address').notNull(),
  dropoffAddress: text('dropoff_address').notNull(),
  driverName: text('driver_name').notNull(),
  driverPhone: text('driver_phone').notNull(),
  driverEmail: text('driver_email').notNull(),
  extrasInsurance: integer('extras_insurance', { mode: 'boolean' }).default(false),
  extrasDriver: integer('extras_driver', { mode: 'boolean' }).default(false),
  extrasChildSeat: integer('extras_child_seat', { mode: 'boolean' }).default(false),
  promoCode: text('promo_code'),
  basePrice: text('base_price').notNull(),
  extrasPrice: text('extras_price').default('0'),
  taxes: text('taxes').notNull(),
  totalAmount: text('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id').references(() => bookings.id),
  razorpayOrderId: text('razorpay_order_id').notNull(),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),
  amount: text('amount').notNull(),
  currency: text('currency').default('INR'),
  status: text('status').notNull().default('pending'),
  paymentType: text('payment_type').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const supportConversations = sqliteTable('support_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  conversationReference: text('conversation_reference').notNull().unique(),
  status: text('status').notNull().default('active'),
  agentName: text('agent_name').default('AI Assistant'),
  isAiHandled: integer('is_ai_handled', { mode: 'boolean' }).default(true),
  escalatedAt: text('escalated_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const supportMessages = sqliteTable('support_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').references(() => supportConversations.id),
  senderType: text('sender_type').notNull(),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url'),
  attachmentName: text('attachment_name'),
  isEscalated: integer('is_escalated', { mode: 'boolean' }).default(false),
  aiGenerated: integer('ai_generated', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const vehicleInsuranceOptions = sqliteTable('vehicle_insurance_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  type: text('type').notNull(),
  pricePerDay: text('price_per_day').notNull(),
  description: text('description').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const adminSettings = sqliteTable('admin_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  settingKey: text('setting_key').notNull().unique(),
  settingValue: text('setting_value').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});