"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat,
  Clock,
  Users,
  LogOut,
  Bell
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function KitchenHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userRole, setUserRole] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Get user role
  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      setUserRole(data?.role || "customer");
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleGoToAdmin = () => {
    router.push("/admin");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-26">
          {/* Left side - Logo and title */}
          <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Image
          src="/logos/logo-brown.png"
          alt="Logo"
          width={110}
          height={100}
          className="object-contain mt-4"
          priority
        />
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Kitchen Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Order Management System
          </p>
        </div>
      </div>
    </div>

          {/* Center - Time and status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {user?.email || "Kitchen Staff"}
              </span>
              <Badge variant="secondary" className="text-xs">
                {userRole === "admin" ? "Admin" : "Staff"}
              </Badge>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {userRole === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToAdmin}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Admin Panel
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
