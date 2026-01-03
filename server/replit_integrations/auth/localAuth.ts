import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { authStorage } from "./storage";

// Simple local authentication for development
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

    // Simple local strategy for demo purposes
    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                // For demo purposes, create or get a demo user
                let user = await authStorage.getUser("demo-user");
                if (!user) {
                    user = await authStorage.upsertUser({
                        id: "demo-user",
                        email: "demo@example.com",
                        firstName: "Demo",
                        lastName: "User",
                        profileImageUrl: null,
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );

    passport.serializeUser((user: any, done) => done(null, user));
    passport.deserializeUser((user: any, done) => done(null, user));

    // Simple login route
    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.redirect("/");
    });

    // Simple demo login (for development)
    app.get("/api/login", (req, res) => {
        // For demo purposes, auto-login a demo user
        req.login(
            {
                id: "demo-user",
                email: "demo@example.com",
                firstName: "Demo",
                lastName: "User",
                claims: { sub: "demo-user" },
            },
            (err) => {
                if (err) return res.status(500).json({ message: "Login failed" });
                res.redirect("/");
            }
        );
    });

    app.get("/api/logout", (req, res) => {
        req.logout(() => {
            res.redirect("/");
        });
    });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};
