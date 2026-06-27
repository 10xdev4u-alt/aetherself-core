export const corsConfig = {
  origin: ["http://localhost:5173", "http://localhost:4197"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};
