import { POST } from '@/app/api/auth/register/route';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Mock Dependencies
jest.mock('@/lib/db', () => ({ query: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed_password') }));

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const createRequest = (body: any) => {
        return new Request('http://localhost/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    };

    it('should return 400 if fields are missing', async () => {
        const req = createRequest({});
        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe("Missing required fields");
    });

    it('should return 409 if email exists', async () => {
        // Mock user check returns exists
        (query as jest.Mock).mockResolvedValueOnce([{ id: 1 }]);

        const req = createRequest({
            first_name: 'John', last_name: 'Doe', email: 'exist@test.com',
            password: 'pass', role: 'Driver', phone_number: '123'
        });

        const res = await POST(req);
        expect(res.status).toBe(409);
        const body = await res.json();
        expect(body.error).toBe("Email already registered");
    });

    it('should return 400 if role is invalid', async () => {
        (query as jest.Mock)
            .mockResolvedValueOnce([]) // users check empty
            .mockResolvedValueOnce([]); // role check empty (invalid)

        const req = createRequest({
            first_name: 'John', last_name: 'Doe', email: 'new@test.com',
            password: 'pass', role: 'SuperHero', phone_number: '123'
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("Invalid role name");
    });

    it('should return 201 on successful registration', async () => {
        (query as jest.Mock)
            .mockResolvedValueOnce([]) // Check user (ok)
            .mockResolvedValueOnce([{ id: 2 }]) // Check role (ok)
            .mockResolvedValueOnce({ insertId: 100 }) // Insert user
            .mockResolvedValueOnce({ insertId: 50 }); // Insert driver

        const req = createRequest({
            first_name: 'John', last_name: 'Doe', email: 'new@test.com',
            password: 'pass', role: 'Driver', phone_number: '123'
        });

        const res = await POST(req);
        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body.ok).toBe(true);
    });
});
