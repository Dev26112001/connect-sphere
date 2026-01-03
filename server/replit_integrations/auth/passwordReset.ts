import crypto from "crypto";
import { z } from "zod";
import type { RequestHandler } from "express";
import { authStorage } from "./storage";
import bcrypt from "bcrypt";

// In a real application, you would store these in a database
// For demo purposes, we'll use a simple in-memory store
const resetTokens = new Map<string, { email: string; expires: Date }>();

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const forgotPassword: RequestHandler = async (req, res) => {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);

        // Check if user exists
        const user = await authStorage.getUserByEmail(email);
        if (!user) {
            // Don't reveal whether user exists for security
            return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour from now

        // Store token (in production, store in database)
        resetTokens.set(token, { email, expires });

        // In a real application, you would send an email here
        // For demo purposes, we'll just log the token
        console.log(`Password reset token for ${email}: ${token}`);
        console.log(`Reset link: http://localhost:5000/forgot-password?token=${token}`);

        res.json({
            message: "If an account with that email exists, a password reset link has been sent.",
            // For demo purposes only - in production, remove this
            debugToken: process.env.NODE_ENV === 'development' ? token : undefined
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Failed to process request" });
    }
};

export const resetPassword: RequestHandler = async (req, res) => {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);

        // Check if token exists and is valid
        const tokenData = resetTokens.get(token);
        if (!tokenData || tokenData.expires < new Date()) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Get user
        const user = await authStorage.getUserByEmail(tokenData.email);
        if (!user) {
            return res.status(400).json({ message: "Invalid reset token" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await authStorage.upsertUser({
            ...user,
            password: hashedPassword,
        });

        // Remove token
        resetTokens.delete(token);

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Failed to reset password" });
    }
};

// Cleanup expired tokens (run this periodically in production)
export const cleanupExpiredTokens = () => {
    const now = new Date();
    const tokensToDelete: string[] = [];

    resetTokens.forEach((data, token) => {
        if (data.expires < now) {
            tokensToDelete.push(token);
        }
    });

    tokensToDelete.forEach(token => {
        resetTokens.delete(token);
    });
};
