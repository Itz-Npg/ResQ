import { AlertTriangle, MapPin } from "lucide-react";
import { getDistance } from "geolib";
import { type Alert } from "@shared/schema";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EmergencyOverlayProps {
  alerts: Alert[];
  myCoords: { latitude: number; longitude: number } | null;
}

export function EmergencyOverlay({ alerts, myCoords }: EmergencyOverlayProps) {
  const [nearestAlert, setNearestAlert] = useState<Alert | null>(null);
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    if (alerts.length > 0 && myCoords) {
      // Find nearest alert
      let minDistance = Infinity;
      let closest = alerts[0];

      alerts.forEach(alert => {
        const dist = getDistance(
          { latitude: myCoords.latitude, longitude: myCoords.longitude },
          { latitude: alert.latitude, longitude: alert.longitude }
        );
        if (dist < minDistance) {
          minDistance = dist;
          closest = alert;
        }
      });

      setNearestAlert(closest);
      setDistance(minDistance);
    } else {
      setNearestAlert(null);
    }
  }, [alerts, myCoords]);

  return (
    <AnimatePresence>
      {nearestAlert && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
        >
          {/* Siren visual effect background */}
          <div className="absolute inset-0 opacity-20 animate-siren pointer-events-none" />

          <div className="relative z-10 w-full max-w-md p-6 overflow-hidden text-center bg-white border-4 border-red-600 shadow-2xl rounded-3xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full animate-pulse">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
            </div>

            <h2 className="mb-2 text-4xl font-bold text-red-600 font-display">
              EMERGENCY NEARBY
            </h2>
            
            <p className="text-xl font-medium text-gray-800">
              Someone needs help!
            </p>

            <div className="flex items-center justify-center py-6 my-6 bg-red-50 rounded-xl">
              <MapPin className="w-8 h-8 mr-3 text-red-600" />
              <span className="text-3xl font-bold text-gray-900 font-display">
                {distance}m <span className="text-lg font-normal text-gray-600">AWAY</span>
              </span>
            </div>

            <p className="mb-8 text-gray-600">
              "{nearestAlert.message}"
            </p>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${nearestAlert.latitude},${nearestAlert.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full px-8 py-4 text-xl font-bold text-white transition-transform bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 shadow-lg shadow-red-600/30"
            >
              NAVIGATE TO LOCATION
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
