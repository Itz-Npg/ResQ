import { useState, useEffect } from "react";
import { Settings, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function SettingsDialog() {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    if (storedName) setName(storedName);
  }, []);

  const handleSave = () => {
    localStorage.setItem("user_name", name);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-2 transition-colors rounded-full hover:bg-gray-100">
          <Settings className="w-6 h-6 text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">YOUR PROFILE</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-semibold text-gray-700">Display Name</Label>
            <div className="relative">
              <User className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="pl-10 text-lg py-6"
              />
            </div>
            <p className="text-sm text-muted-foreground">This helps responders identify you.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto font-bold text-lg h-12">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
