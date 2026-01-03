import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

export const DATABASE_URL = process.env.DATABASE_URL || "";
export const SESSION_SECRET =
  process.env.SESSION_SECRET || "default_session_secret";
export const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";
export const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
