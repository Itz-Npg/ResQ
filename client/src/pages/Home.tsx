import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCreateAlert, useNearbyAlerts, useHeartbeat } from "@/hooks/use-emergency";
import { EmergencyOverlay } from "@/components/EmergencyOverlay";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, MapPin, Radio, User as UserIcon, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";

export default function Home() {
  const [, setLocation] = useLocation();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosLevel, setSosLevel] = useState(1);
  
  // Data hooks
  const createAlert = useCreateAlert();
  const heartbeat = useHeartbeat();
  const { data: nearbyAlerts = [] } = useNearbyAlerts(coords);

  // Heartbeat loop
  useEffect(() => {
    if (!coords) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const savedUser = localStorage.getItem("user");
    const name = savedUser ? JSON.parse(savedUser).name : undefined;
    
    // Initial heartbeat
    heartbeat.mutate({
      latitude: coords.latitude,
      longitude: coords.longitude,
      name
    });

    const interval = setInterval(() => {
      heartbeat.mutate({
        latitude: coords.latitude,
        longitude: coords.longitude,
        name
      });
    }, 10000); // 10s

    return () => clearInterval(interval);
  }, [coords]);

  // GPS Tracking
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLocationError(null);
      },
      (err) => {
        setLocationError(err.message);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleSOS = (level: number) => {
    if (!coords) {
      toast({
        title: "Location Required",
        description: "We need your location to send help.",
        variant: "destructive"
      });
      return;
    }

    setIsSosActive(true);
    setSosLevel(level);
    
    // Play sound if possible (browser restrictions may apply)
    try {
      const audio = new Audio('/siren.mp3'); 
      audio.play().catch(() => {});
    } catch (e) {}

    const messages = {
      1: "IMMEDIATE HELP REQUIRED!",
      2: "URGENT ASSISTANCE NEEDED!",
      3: "SEMI-URGENT HELP NEEDED"
    };

    createAlert.mutate({
      latitude: coords.latitude,
      longitude: coords.longitude,
      level,
      message: messages[level as keyof typeof messages],
    }, {
      onSuccess: () => {
        toast({
          title: `LEVEL ${level} SOS SENT!`,
          description: "Alert has been broadcast to nearby users.",
          className: level === 1 ? "bg-red-600 text-white border-none" : level === 2 ? "bg-yellow-500 text-white border-none" : "bg-green-600 text-white border-none"
        });
      },
      onError: () => {
        setIsSosActive(false);
        toast({
          title: "Failed to send",
          description: "Check connection and try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleCancel = () => {
    setIsSosActive(false);
    setSosLevel(1);
    toast({
      title: "SOS Cancelled",
      description: "You are no longer broadcasting an emergency.",
    });
  };

  if (locationError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <div className="p-4 mb-4 bg-red-100 rounded-full">
          <MapPin className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold font-display">Location Access Needed</h1>
        <p className="max-w-xs text-gray-600">
          This app requires your location to function. Please enable location services in your browser settings.
        </p>
      </div>
    );
  }

  const getLevelColor = (level: number) => {
    switch(level) {
      case 1: return "from-red-500 to-red-700 shadow-red-500/50";
      case 2: return "from-yellow-400 to-yellow-600 shadow-yellow-500/50";
      case 3: return "from-green-500 to-green-700 shadow-green-500/50";
      default: return "from-red-500 to-red-700 shadow-red-500/50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-gray-100 to-transparent -z-10" />
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-red-600" fill="currentColor" fillOpacity={0.2} />
          <span className="text-xl font-bold tracking-tight font-display text-gray-900">
            Res<span className="text-red-600">Q</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/profile")}>
            <UserIcon className="w-5 h-5" />
          </Button>
          <SettingsDialog />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {isSosActive ? (
          // ACTIVE STATE
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center w-full max-w-sm"
          >
            <div className="w-full flex justify-end mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSosActive(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
            <div className="mb-8 text-center animate-pulse">
              <h2 className={`text-4xl font-bold font-display mb-2 ${sosLevel === 1 ? 'text-red-600' : sosLevel === 2 ? 'text-yellow-600' : 'text-green-600'}`}>HELP REQUESTED</h2>
              <p className="text-gray-600 font-medium tracking-wide">Level {sosLevel} SOS Broadcasting...</p>
            </div>

            <div className="relative mb-10">
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${sosLevel === 1 ? 'bg-red-500' : sosLevel === 2 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <div className={`w-64 h-64 bg-gradient-to-br rounded-full shadow-2xl flex items-center justify-center z-10 border-8 border-white ${getLevelColor(sosLevel)}`}>
                <AlertTriangle className="w-24 h-24 text-white animate-bounce" />
              </div>
            </div>

            <button 
              onClick={handleCancel}
              className="w-full py-4 text-lg font-bold text-gray-700 bg-white border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-lg shadow-gray-200/50"
            >
              CANCEL REQUEST
            </button>
          </motion.div>
        ) : (
          // IDLE STATE
          <div className="flex flex-col items-center w-full max-w-sm">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900 font-display mb-2">ARE YOU SAFE?</h2>
              <p className="text-gray-500">Select a level to alert nearby users.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full mb-12">
              <button
                onClick={() => handleSOS(1)}
                className="group relative h-24 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 shadow-xl shadow-red-200 flex items-center px-6 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
              >
                <div className="bg-white/20 p-3 rounded-xl mr-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold text-xl leading-tight">Level 1</span>
                  <span className="text-red-100 text-sm font-medium">Immediate SOS</span>
                </div>
              </button>

              <button
                onClick={() => handleSOS(2)}
                className="group relative h-24 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-xl shadow-yellow-100 flex items-center px-6 transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="bg-white/20 p-3 rounded-xl mr-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold text-xl leading-tight">Level 2</span>
                  <span className="text-yellow-50 text-sm font-medium">Urgent Help</span>
                </div>
              </button>

              <button
                onClick={() => handleSOS(3)}
                className="group relative h-24 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 shadow-xl shadow-green-100 flex items-center px-6 transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="bg-white/20 p-3 rounded-xl mr-4">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold text-xl leading-tight">Level 3</span>
                  <span className="text-green-50 text-sm font-medium">Semi-Urgent</span>
                </div>
              </button>
            </div>

            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center w-full max-w-xs">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">System Active</p>
                <p className="text-xs text-gray-500">
                  {coords 
                    ? `Monitored • GPS High Accuracy` 
                    : "Acquiring GPS Signal..."}
                </p>
              </div>
            </div>

            {nearbyAlerts.length > 0 && (
              <div className="mt-8 w-full max-w-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Nearby Alerts</h3>
                <div className="space-y-3">
                  {nearbyAlerts.map((alert: any) => (
                    <Card key={alert.id} className="border-red-100 bg-white/50 backdrop-blur-sm">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${alert.level === 1 ? 'bg-red-100 text-red-600' : alert.level === 2 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-none mb-1">Level {alert.level} SOS</p>
                            <p className="text-xs text-gray-500">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="h-8" onClick={() => {
                            const savedUser = localStorage.getItem("user");
                            if (!savedUser) {
                              setLocation("/auth");
                              return;
                            }
                            const helper = JSON.parse(savedUser);
                            apiRequest("POST", `/api/alerts/${alert.id}/respond`, { helperId: helper.id })
                              .then(() => {
                                toast({ title: "Responding!", description: "Heading to location." });
                                queryClient.invalidateQueries({ queryKey: [api.alerts.list.path] });
                              });
                          }}>
                            Help
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8" onClick={() => {
                            handleSOS(alert.level);
                            toast({ title: "Sending Backup!", description: "Requesting help for this emergency." });
                          }}>
                            I also need help!
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-xs text-gray-400">
        <p>Made by Aaditya</p>
        <p className="mt-1">Only use in case of emergency. Misuse may result in a ban.</p>
      </footer>

      <EmergencyOverlay alerts={nearbyAlerts} myCoords={coords} />
    </div>
  );
}