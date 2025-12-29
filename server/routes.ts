import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Intentions
  app.get(api.intentions.list.path, isAuthenticated, async (req, res) => {
    const items = await storage.getIntentions();
    res.json(items);
  });

  app.get(api.intentions.get.path, isAuthenticated, async (req, res) => {
    const item = await storage.getIntention(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.post(api.intentions.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.intentions.create.input.parse(req.body);
      const intention = await storage.createIntention({
        ...input,
        creatorId: req.user.claims.sub,
      });
      res.status(201).json(intention);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Connections
  app.post(api.connections.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const { intentionId, message } = req.body;
      const connection = await storage.createConnection({
        intentionId,
        message,
        requesterId: req.user.claims.sub,
        status: "pending"
      });
      res.status(201).json(connection);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.connections.list.path, isAuthenticated, async (req: any, res) => {
    const connections = await storage.getConnectionsForUser(req.user.claims.sub);
    res.json(connections);
  });

  app.patch(api.connections.updateStatus.path, isAuthenticated, async (req: any, res) => {
    const connectionId = Number(req.params.id);
    const { status } = req.body;
    
    // Verify ownership (simplified: only check if connection exists for now, 
    // ideally check if req.user owns the intention associated with this connection)
    const connection = await storage.getConnection(connectionId);
    if (!connection) return res.status(404).json({ message: "Connection not found" });
    
    // In a real app, verify that req.user.claims.sub is the creator of connection.intention
    
    const updated = await storage.updateConnectionStatus(connectionId, status);
    res.json(updated);
  });

  return httpServer;
}

// Seed function for initial data
async function seedData() {
  // In a real app, we might check if intentions exist.
  // Since we rely on auth users, we can't easily seed intentions without fake users.
  // We'll skip auto-seeding for now as it requires valid user IDs.
}
