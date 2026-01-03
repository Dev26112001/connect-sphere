import { db } from "./db";
import {
  intentions, connections, users,
  type Intention, type InsertIntention,
  type Connection, type InsertConnection,
  type User
} from "@shared/schema";
import { eq, desc, and, or, ilike, like } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createIntention(intention: InsertIntention & { creatorId: string }): Promise<Intention>;
  getIntention(id: number): Promise<Intention | undefined>;
  getIntentions(filters?: { search?: string; category?: string }): Promise<(Intention & { creator: User | null })[]>;
  createConnection(connection: InsertConnection & { requesterId: string, intentionId: number }): Promise<Connection>;
  getConnection(id: number): Promise<Connection | undefined>;
  getConnectionsForUser(userId: string): Promise<{
    sent: (Connection & { intention: Intention | null })[],
    received: (Connection & { intention: Intention | null, requester: User | null })[]
  }>;
  updateConnectionStatus(id: number, status: "accepted" | "rejected"): Promise<Connection>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods delegated to the imported authStorage
  getUser(id: string) {
    return authStorage.getUser(id);
  }

  getUserByEmail(email: string) {
    return authStorage.getUserByEmail(email);
  }

  getUsers() {
    return authStorage.getUsers();
  }

  upsertUser(user: any) {
    return authStorage.upsertUser(user);
  }

  // Intentions
  async createIntention(intention: InsertIntention & { creatorId: string }): Promise<Intention> {
    const [newIntention] = await db.insert(intentions).values(intention).returning();
    return newIntention;
  }

  async getIntentions(filters?: { search?: string; category?: string }): Promise<(Intention & { creator: User | null })[]> {
    let whereConditions = [];

    if (filters?.category && filters.category !== "all") {
      whereConditions.push(eq(intentions.category, filters.category));
    }

    if (filters?.search) {
      whereConditions.push(
        or(
          ilike(intentions.title, `%${filters.search}%`),
          ilike(intentions.description, `%${filters.search}%`)
        )
      );
    }

    return await db.query.intentions.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [desc(intentions.createdAt)],
      with: {
        creator: true,
      },
    });
  }

  async getIntention(id: number): Promise<Intention | undefined> {
    return await db.query.intentions.findFirst({
      where: eq(intentions.id, id),
    });
  }

  // Connections
  async createConnection(connection: InsertConnection & { requesterId: string, intentionId: number }): Promise<Connection> {
    const [newConnection] = await db.insert(connections).values(connection).returning();
    return newConnection;
  }

  async getConnectionsForUser(userId: string): Promise<{
    sent: (Connection & { intention: Intention | null })[],
    received: (Connection & { intention: Intention | null, requester: User | null })[]
  }> {
    const sent = await db.query.connections.findMany({
      where: eq(connections.requesterId, userId),
      with: {
        intention: true,
      },
      orderBy: [desc(connections.createdAt)],
    });

    // Find intentions created by this user to get received connections
    const userIntentions = await db.select({ id: intentions.id }).from(intentions).where(eq(intentions.creatorId, userId));
    const intentionIds = userIntentions.map(i => i.id);

    let received: (Connection & { intention: Intention | null, requester: User | null })[] = [];

    if (intentionIds.length > 0) {
      received = await db.query.connections.findMany({
        where: (connection, { inArray }) => inArray(connection.intentionId, intentionIds),
        with: {
          intention: true,
          requester: true,
        },
        orderBy: [desc(connections.createdAt)],
      });
    }

    return { sent, received };
  }

  async getConnection(id: number): Promise<Connection | undefined> {
    return await db.query.connections.findFirst({
      where: eq(connections.id, id),
      with: {
        intention: true, // Need to check creator of intention for permission
      }
    });
  }

  async updateConnectionStatus(id: number, status: "accepted" | "rejected"): Promise<Connection> {
    const [updated] = await db.update(connections)
      .set({ status })
      .where(eq(connections.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
