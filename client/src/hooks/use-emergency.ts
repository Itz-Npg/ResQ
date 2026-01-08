import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertUser, InsertAlert } from "@shared/schema";
import { nanoid } from 'nanoid';

// Helper to get or create device ID
export function getDeviceId() {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = nanoid();
    localStorage.setItem('device_id', id);
  }
  return id;
}

// === ALERTS ===

// POST /api/alerts - Create SOS Alert
export function useCreateAlert() {
  return useMutation({
    mutationFn: async (data: Omit<InsertAlert, 'deviceId'>) => {
      const payload = { ...data, deviceId: getDeviceId() };
      const validated = api.alerts.create.input.parse(payload);
      
      const res = await fetch(api.alerts.create.path, {
        method: api.alerts.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Failed to send alert");
      return api.alerts.create.responses[201].parse(await res.json());
    },
  });
}

// GET /api/alerts - Poll for nearby alerts
export function useNearbyAlerts(coords: { latitude: number; longitude: number } | null) {
  return useQuery({
    queryKey: [api.alerts.list.path, coords?.latitude, coords?.longitude],
    queryFn: async () => {
      if (!coords) return [];
      
      const params = {
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        radius: '5000' // 5km default
      };
      
      const url = `${api.alerts.list.path}?${new URLSearchParams(params)}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch alerts");
      
      // Filter out our own alerts from the list
      const allAlerts = api.alerts.list.responses[200].parse(await res.json());
      const deviceId = getDeviceId();
      return allAlerts.filter(a => a.deviceId !== deviceId);
    },
    enabled: !!coords,
    refetchInterval: 2000, // Poll every 2 seconds
  });
}

// === USERS / HEARTBEAT ===

// POST /api/heartbeat - Keep alive
export function useHeartbeat() {
  return useMutation({
    mutationFn: async (data: Omit<InsertUser, 'deviceId'>) => {
      const payload = { ...data, deviceId: getDeviceId() };
      const validated = api.users.heartbeat.input.parse(payload);

      const res = await fetch(api.users.heartbeat.path, {
        method: api.users.heartbeat.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Heartbeat failed");
      return api.users.heartbeat.responses[200].parse(await res.json());
    },
  });
}
