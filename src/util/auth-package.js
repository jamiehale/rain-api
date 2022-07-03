import jwt from 'jsonwebtoken';

export const generateAuthPackage = (context) => (account) => {
  const payload = {
    userId: account.userId,
  };
  const accessToken = jwt.sign(payload, context.config.jwtSecret, { expiresIn: context.config.accessTokenExpiresIn });
  const refreshToken = jwt.sign(payload, context.config.jwtSecret, { expiresIn: context.config.refreshTokenExpiresIn });

  return {
    accessToken,
    refreshToken,
  };
};
