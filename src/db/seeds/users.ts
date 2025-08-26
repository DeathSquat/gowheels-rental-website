import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';

async function main() {
    const sampleUsers = [
        {
            email: 'admin@gowheels.com',
            name: 'Admin User',
            phone: '+919876543210',
            passwordHash: await bcrypt.hash('admin123', 12),
            role: 'admin',
            profileImageUrl: null,
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
            lastLoginAt: new Date('2024-02-14').toISOString(),
            isActive: true,
        },
        {
            email: 'john.doe@email.com',
            name: 'John Doe',
            phone: '+919876543211',
            passwordHash: await bcrypt.hash('password123', 12),
            role: 'user',
            profileImageUrl: null,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
            lastLoginAt: new Date('2024-02-12').toISOString(),
            isActive: true,
        },
        {
            email: 'jane.smith@email.com',
            name: 'Jane Smith',
            phone: '+919876543212',
            passwordHash: await bcrypt.hash('password123', 12),
            role: 'user',
            profileImageUrl: null,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
            lastLoginAt: new Date('2024-02-10').toISOString(),
            isActive: true,
        },
        {
            email: 'mike.johnson@email.com',
            name: 'Mike Johnson',
            phone: '+919876543213',
            passwordHash: await bcrypt.hash('password123', 12),
            role: 'user',
            profileImageUrl: null,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
            lastLoginAt: null,
            isActive: true,
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});