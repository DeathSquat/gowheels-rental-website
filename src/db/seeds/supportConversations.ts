import { db } from '@/db';
import { supportConversations } from '@/db/schema';

async function main() {
    const sampleConversations = [
        {
            userId: 2,
            conversationReference: 'SUPP-20241201-1001',
            status: 'active',
            agentName: 'AI Assistant',
            isAiHandled: true,
            escalatedAt: null,
            createdAt: new Date('2024-12-01T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-12-01T10:30:00Z').toISOString(),
        },
        {
            userId: 3,
            conversationReference: 'SUPP-20241130-2003',
            status: 'escalated',
            agentName: 'Sarah Wilson',
            isAiHandled: false,
            escalatedAt: new Date('2024-11-30T14:45:00Z').toISOString(),
            createdAt: new Date('2024-11-30T09:15:00Z').toISOString(),
            updatedAt: new Date('2024-11-30T14:45:00Z').toISOString(),
        },
        {
            userId: 4,
            conversationReference: 'SUPP-20241128-3005',
            status: 'closed',
            agentName: 'AI Assistant',
            isAiHandled: true,
            escalatedAt: null,
            createdAt: new Date('2024-11-28T16:20:00Z').toISOString(),
            updatedAt: new Date('2024-11-28T17:45:00Z').toISOString(),
        }
    ];

    await db.insert(supportConversations).values(sampleConversations);
    
    console.log('✅ Support conversations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});