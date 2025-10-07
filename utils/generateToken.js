import jwt from "jsonwebtoken";

// Generate both tokens
export const generateTokens = (userId) => {
  // Access token (short expiry)
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m", // default 15 mins
  });

  // Refresh token (long expiry)
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // default 7 days
  });

  return { accessToken, refreshToken };
};
