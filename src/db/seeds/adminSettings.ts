import { db } from '@/db';
import { adminSettings } from '@/db/schema';

async function main() {
    const sampleSettings = [
        {
            settingKey: 'tax_rate',
            settingValue: '18.0',
            description: 'GST rate percentage for all bookings',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            settingKey: 'cancellation_policy',
            settingValue: 'Free cancellation up to 24 hours before pickup. 50% refund for cancellations within 24 hours.',
            description: 'Default cancellation policy for all vehicles',
            createdAt: new Date('2024-01-02').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            settingKey: 'deposit_percentage',
            settingValue: '30.0',
            description: 'Default deposit percentage for partial payments',
            createdAt: new Date('2024-01-03').toISOString(),
            updatedAt: new Date('2024-01-03').toISOString(),
        },
        {
            settingKey: 'max_booking_days',
            settingValue: '30',
            description: 'Maximum number of days allowed for a single booking',
            createdAt: new Date('2024-01-04').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            settingKey: 'platform_commission',
            settingValue: '15.0',
            description: 'Platform commission percentage from vehicle owners',
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        }
    ];

    await db.insert(adminSettings).values(sampleSettings);
    
    console.log('✅ Admin settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});