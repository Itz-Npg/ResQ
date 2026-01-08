import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.users.heartbeat.path, async (req, res) => {
    try {
      const input = api.users.heartbeat.input.parse(req.body);
      if (!input.deviceId) {
        return res.status(400).json({ message: "Device ID required" });
      }
      await storage.updateUserLocation(input);
      res.json({ status: "online" });
    } catch (err) {
      console.error("Heartbeat error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: err.errors });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.alerts.create.path, async (req, res) => {
    try {
      const input = api.alerts.create.input.parse(req.body);
      const alert = await storage.createAlert(input);
      
      // In a real production app, you would iterate through active users' 
      // push subscriptions here and send Web Push notifications.
      // For this MVP, we simulate the "broadcast" awareness.
      console.log(`SOS Alert created by ${input.deviceId}. Broadcasting to nearby users...`);
      
      res.status(201).json(alert);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data" });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.alerts.list.path, async (req, res) => {
    try {
      const lat = req.query.latitude ? Number(req.query.latitude) : undefined;
      const lng = req.query.longitude ? Number(req.query.longitude) : undefined;
      const radius = req.query.radius ? Number(req.query.radius) : 5000;

      if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Invalid or missing latitude/longitude" });
      }
      
      const alerts = await storage.getNearbyAlerts(lat, lng, radius);
      res.json(alerts);
    } catch (err) {
      console.error("Alerts list error:", err);
      res.status(400).json({ message: "Invalid query parameters" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, deviceId, name } = req.body;
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(400).json({ message: "Email already exists" });
      
      const user = await storage.createUser({ email, password, deviceId, name });
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(user);
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/alerts/:id/respond", async (req, res) => {
    try {
      const { helperId } = req.body;
      const alert = await storage.respondToAlert(Number(req.params.id), helperId);
      res.json(alert);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/alerts/:id/verify", async (req, res) => {
    try {
      const alert = await storage.verifyResqued(Number(req.params.id));
      res.json(alert);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/history/resquest/:deviceId", async (req, res) => {
    try {
      const alerts = await storage.getResQuest(req.params.deviceId);
      res.json(alerts);
    } catch (err) {
      console.error("History resquest error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/history/resqued/:helperId", async (req, res) => {
    const alerts = await storage.getResQued(Number(req.params.helperId));
    res.json(alerts);
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      await storage.cancelAlert(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
