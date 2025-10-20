import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'supersecretkey';

export const signToken = (payload) => jwt.sign(payload, secret, { expiresIn: '7d' });
export const verifyToken = (token) => jwt.verify(token, secret);
