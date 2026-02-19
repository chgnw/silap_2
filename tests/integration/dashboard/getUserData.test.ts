import { POST } from '@/app/api/dashboard/getUserData/route';
import { query } from '@/lib/db';

jest.mock('@/lib/db', () => ({ query: jest.fn() }));

describe('POST /api/dashboard/getUserData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createRequest = (body: any) => {
        return new Request('http://localhost/api/dashboard/getUserData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    };

    it('should return 400 if user_id is missing', async () => {
        const req = createRequest({});
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('should return formatted data on success (Happy Path)', async () => {
        // Mocking the 4 queries inside Promise.allSettled
        // Note: Since Promise.allSettled is used, we need to ensure the mocks return what the implementation expects
        // The implementation calls query() 4 times.

        (query as jest.Mock)
            .mockResolvedValueOnce([{ total: 100 }]) // 1. getTotalWasteInRange
            .mockResolvedValueOnce([{
                points_current: 50,
                tier_name: 'Gold',
                last_streak_week: null
            }]) // 2. getUserMetrics
            .mockResolvedValueOnce([{ category: 'Plastic', total: 60 }]) // 3. getWasteCategoryBreakdown
            .mockResolvedValueOnce([{ date: '2025-01-01', total: 20 }]); // 4. getDailyWasteData

        const req = createRequest({ user_id: 1 });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.data).toBeDefined();

        // Verify specific data mapping
        expect(body.data.total_waste).toBe(100);
        expect(body.data.points_current).toBe(50);
        expect(body.data.categories).toHaveLength(1);
        expect(body.data.categories[0].category).toBe('Plastic');
    });

    it('should handle database errors gracefully (Robustness)', async () => {
        // Simulate DB failure on one query
        (query as jest.Mock)
            .mockRejectedValueOnce(new Error('DB Connection Failed')) // 1. Fail
            .mockResolvedValueOnce([]) // 2. OK
            .mockResolvedValueOnce([]) // 3. OK
            .mockResolvedValueOnce([]); // 4. OK

        const req = createRequest({ user_id: 1 });
        const res = await POST(req);

        // Implementation uses Promise.allSettled, so it should technically succeed but return fallback values for failed queries
        expect(res.status).toBe(200);
        const body = await res.json();

        expect(body.success).toBe(true);
        expect(body.data.total_waste).toBe(0); // Fallback value
    });
});
