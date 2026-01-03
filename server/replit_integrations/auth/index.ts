// Email-based authentication system
export { setupAuth, isAuthenticated, getSession } from "./emailAuth";
export { authStorage, type IAuthStorage } from "./storage";
export { registerAuthRoutes } from "./routes";
