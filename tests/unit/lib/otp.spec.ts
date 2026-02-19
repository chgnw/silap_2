import { generateOTP, setOTP, verifyOTP } from '@/lib/otp';
import { redis } from '@/lib/redis';

// Mock Redis directly here since it's used in the module
jest.mock('@/lib/redis', () => ({
    redis: {
        set: jest.fn(),
        get: jest.fn(),
    },
}));

describe('OTP Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('generateOTP should return 6 digit string', () => {
        const otp = generateOTP();
        expect(otp).toHaveLength(6);
        expect(otp).toMatch(/^\d{6}$/);
    });

    it('setOTP should save to redis with expiration', async () => {
        const email = 'test@example.com';
        const otp = '123456';

        await setOTP(email, otp);

        expect(redis.set).toHaveBeenCalledWith(
            `otp:${email}`,
            otp,
            'EX',
            300
        );
    });

    it('verifyOTP should return true if OTP matches', async () => {
        (redis.get as jest.Mock).mockResolvedValue('123456');

        const isValid = await verifyOTP('test@example.com', '123456');
        expect(isValid).toBe(true);
        expect(redis.get).toHaveBeenCalledWith(`otp:test@example.com`);
    });

    it('verifyOTP should return false if OTP does not match', async () => {
        (redis.get as jest.Mock).mockResolvedValue('123456');

        const isValid = await verifyOTP('test@example.com', '000000');
        expect(isValid).toBe(false);
    });

    it('verifyOTP should return false if OTP is expired/null', async () => {
        (redis.get as jest.Mock).mockResolvedValue(null);

        const isValid = await verifyOTP('test@example.com', '123456');
        expect(isValid).toBe(false);
    });
});
