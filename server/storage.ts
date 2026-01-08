import { users, alerts, type User, type InsertUser, type Alert, type InsertAlert } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User ops
  updateUserLocation(user: InsertUser): Promise<User>;
  getUser(deviceId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  
  // Alert ops
  createAlert(alert: InsertAlert): Promise<Alert>;
  getNearbyAlerts(latitude: number, longitude: number, radius: number): Promise<Alert[]>;
  respondToAlert(alertId: number, helperId: number): Promise<Alert>;
  verifyResqued(alertId: number): Promise<Alert>;
  getResQuest(deviceId: string): Promise<Alert[]>;
  getResQued(helperId: number): Promise<Alert[]>;
  cancelAlert(alertId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async updateUserLocation(insertUser: InsertUser): Promise<User> {
    const existing = await this.getUser(insertUser.deviceId);
    if (existing) {
      const [updated] = await db
        .update(users)
        .set({
          latitude: insertUser.latitude,
          longitude: insertUser.longitude,
          lastSeen: new Date(),
          name: insertUser.name ?? existing.name,
        })
        .where(eq(users.deviceId, insertUser.deviceId))
        .returning();
      return updated;
    } else {
      const [newUser] = await db.insert(users).values(insertUser).returning();
      return newUser;
    }
  }

  async getUser(deviceId: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.deviceId, deviceId),
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async createUser(insertUser: any): Promise<User> {
    const [newUser] = await db.insert(users).values(insertUser).returning();
    return newUser;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }

  async getNearbyAlerts(lat: number, lng: number, radiusMeters: number): Promise<Alert[]> {
    const activeAlerts = await db.select().from(alerts).where(eq(alerts.active, true));

    return activeAlerts.filter(alert => {
      if (!alert.latitude || !alert.longitude) return false;
      const distance = this.calculateDistance(lat, lng, alert.latitude, alert.longitude);
      return distance <= (radiusMeters || 5000);
    });
  }

  async respondToAlert(alertId: number, helperId: number): Promise<Alert> {
    const [updated] = await db
      .update(alerts)
      .set({ helperId, active: false })
      .where(eq(alerts.id, alertId))
      .returning();
    return updated;
  }

  async verifyResqued(alertId: number): Promise<Alert> {
    const [updated] = await db
      .update(alerts)
      .set({ isResqued: true })
      .where(eq(alerts.id, alertId))
      .returning();
    return updated;
  }

  async getResQuest(deviceId: string): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.deviceId, deviceId));
  }

  async getResQued(helperId: number): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.helperId, helperId));
  }

  async cancelAlert(alertId: number): Promise<void> {
    await db
      .update(alerts)
      .set({ active: false })
      .where(eq(alerts.id, alertId));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export const storage = new DatabaseStorage();
