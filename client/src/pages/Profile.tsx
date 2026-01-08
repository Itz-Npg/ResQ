import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Clock, CheckCircle, User as UserIcon, ArrowLeft, XCircle } from "lucide-react";

export default function Profile() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      setLocation("/auth");
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [setLocation]);

  const { data: resQuest = [], isLoading: loadingQuest } = useQuery<any[]>({
    queryKey: ["/api/history/resquest", user?.device_id || user?.deviceId],
    enabled: !!(user?.device_id || user?.deviceId),
  });

  const { data: resQued = [], isLoading: loadingQued } = useQuery<any[]>({
    queryKey: ["/api/history/resqued", user?.id],
    enabled: !!user?.id,
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/alerts/${id}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history/resquest", user?.device_id || user?.deviceId] });
      toast({ title: "Help Verified!", description: "Thank you for confirming." });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history/resquest", user?.device_id || user?.deviceId] });
      toast({ title: "Request Cancelled", description: "Your SOS request has been removed." });
    }
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-display">ResQ Profile</h1>
          </div>
        </div>
        <Button variant="ghost" onClick={() => {
          localStorage.removeItem("user");
          setLocation("/");
        }}>Logout</Button>
      </header>

      <main className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardContent className="pt-6 flex items-center space-x-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <UserIcon className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name || "Anonymous User"}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="resquest" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="resquest">ResQuest (My Requests)</TabsTrigger>
            <TabsTrigger value="resqued">ResQued (Helped Others)</TabsTrigger>
          </TabsList>

          <TabsContent value="resquest">
            <div className="space-y-4">
              {resQuest.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No requests made yet.</p>
              ) : (
                resQuest.map((alert: any) => (
                  <Card key={alert.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Level {alert.level} SOS
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                        {alert.active && !alert.helperId && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => cancelMutation.mutate(alert.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{alert.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {alert.helperId ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" /> Helped
                            </span>
                          ) : alert.active ? (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full flex items-center">
                              <XCircle className="w-3 h-3 mr-1" /> Cancelled
                            </span>
                          )}
                          {alert.isResqued && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Verified</span>
                          )}
                        </div>
                        {alert.helperId && !alert.isResqued && (
                          <Button size="sm" onClick={() => verifyMutation.mutate(alert.id)}>
                            Verify Help
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="resqued">
            <div className="space-y-4">
              {resQued.length === 0 ? (
                <p className="text-center py-8 text-gray-500">You haven't helped anyone yet.</p>
              ) : (
                resQued.map((alert: any) => (
                  <Card key={alert.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        ResQued (Level {alert.level})
                      </CardTitle>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{alert.message}</p>
                      <div className="mt-4">
                        {alert.isResqued ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Verification Received</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Awaiting Verification</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}