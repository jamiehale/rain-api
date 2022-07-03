import crypto from 'crypto';

export const generateSalt = () => crypto.randomBytes(16).toString('hex');

export const saltPassword = (password, salt) => crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

export const isPasswordValid = (password) => (account) => saltPassword(password, account.salt) === account.saltedPassword;
