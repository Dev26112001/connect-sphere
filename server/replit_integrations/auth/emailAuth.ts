import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express, RequestHandler } from "express";
import { authStorage } from "./storage";
import { z } from "zod";

// Login schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

// Register schema  
const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

export function getSession() {
    return session({
        secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        },
    });
}

export async function setupAuth(app: Express) {
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    // Configure Passport Local Strategy
    passport.use(
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
            },
            async (email, password, done) => {
                try {
                    const user = await authStorage.getUserByEmail(email);

                    if (!user || !user.password) {
                        return done(null, false, { message: "Invalid email or password" });
                    }

                    const isValidPassword = await bcrypt.compare(password, user.password);

                    if (!isValidPassword) {
                        return done(null, false, { message: "Invalid email or password" });
                    }

                    // Remove password from user object before returning
                    const { password: _, ...userWithoutPassword } = user;
                    return done(null, userWithoutPassword);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // Serialize and deserialize user
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await authStorage.getUser(id);
            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                done(null, userWithoutPassword);
            } else {
                done(null, null);
            }
        } catch (error) {
            done(error);
        }
    });

    // Register endpoint
    app.post("/api/register", async (req, res) => {
        try {
            const validatedData = registerSchema.parse(req.body);

            // Check if user already exists
            const existingUser = await authStorage.getUserByEmail(validatedData.email);

            if (existingUser) {
                return res.status(400).json({ message: "User with this email already exists" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(validatedData.password, 10);

            // Create user
            const newUser = await authStorage.upsertUser({
                email: validatedData.email,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                profileImageUrl: null,
                password: hashedPassword,
            });

            // Auto-login after registration
            req.login(newUser, (err) => {
                if (err) return res.status(500).json({ message: "Registration failed" });
                const { password: _, ...userWithoutPassword } = newUser;
                res.json({ user: userWithoutPassword });
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: error.errors[0].message });
            }
            console.error("Registration error:", error);
            res.status(500).json({ message: "Registration failed" });
        }
    });

    // Login endpoint
    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: any, info: any) => {
            if (err) {
                return res.status(500).json({ message: "Login failed" });
            }

            if (!user) {
                return res.status(401).json({ message: info?.message || "Invalid email or password" });
            }

            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Login failed" });
                }
                res.json({ user });
            });
        })(req, res, next);
    });

    // Logout endpoint
    app.post("/api/logout", (req, res) => {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ message: "Logout failed" });
            }
            res.json({ message: "Logged out successfully" });
        });
    });

    // Get current user
    app.get("/api/auth/user", (req, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        res.json(req.user);
    });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};
