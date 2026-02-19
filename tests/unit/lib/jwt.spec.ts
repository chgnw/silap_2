import { signToken, verifyToken, safeVerifyToken } from '@/lib/jwt';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('JWT Helper', () => {
    const mockPayload = { id: 1, email: 'user@test.com' };
    const mockToken = 'mockFiturToken';

    beforeAll(() => {
        process.env.JWT_SECRET = 'secret';
    });

    it('signToken should call jwt.sign with correct params', () => {
        (jwt.sign as jest.Mock).mockReturnValue(mockToken);

        const token = signToken(mockPayload);

        expect(jwt.sign).toHaveBeenCalledWith(
            mockPayload,
            'secret',
            expect.objectContaining({ expiresIn: '1d' })
        );
        expect(token).toBe(mockToken);
    });

    it('verifyToken should return payload on success', () => {
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

        const decoded = verifyToken(mockToken);
        expect(decoded).toEqual(mockPayload);
    });

    it('safeVerifyToken should return null on error', () => {
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const decoded = safeVerifyToken('invalid_token');
        expect(decoded).toBeNull();
    });

    it('safeVerifyToken should return payload on success', () => {
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

        const decoded = safeVerifyToken(mockToken);
        expect(decoded).toEqual(mockPayload);
    });
});
