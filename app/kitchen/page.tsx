"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Order } from "@/lib/types";
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card";
import { KitchenHeader } from "@/components/kitchen/kitchen-header";
import Loader from "@/components/ui/loader";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // All useEffect hooks must come before any early returns
  // Redirect if not authenticated (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signin?redirect=/kitchen");
    }
  }, [user, authLoading, router]);

  // Fetch kitchen orders - only once on mount
  useEffect(() => {
    if (!user || authLoading) return;
    
    const fetchKitchenOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .in("status", ["accepted", "processing", "cooking", "ready"])
          .order("created_at", { ascending: true });

        if (error) throw error;
        const ordersData = data || [];
        setAllOrders(ordersData);
        setOrders(ordersData);
        console.log("Kitchen orders fetched:", data);
      } catch (err) {
        console.error("Error fetching kitchen orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchKitchenOrders();
  }, [user, authLoading]); // Only depend on user and authLoading

  // Filter orders when selectedStatus changes
  useEffect(() => {
    if (selectedStatus === "all") {
      setOrders(allOrders);
    } else {
      setOrders(allOrders.filter(order => order.status === selectedStatus));
    }
  }, [selectedStatus, allOrders]);

  // Real-time updates for order changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("kitchen_orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Kitchen order update:", payload);
          
          // Update orders by fetching only new data
          const updateOrders = async () => {
            try {
              const { data, error } = await supabase
                .from("orders")
                .select("*")
                .in("status", ["accepted", "processing", "cooking", "ready"])
                .order("created_at", { ascending: true });

              if (error) throw error;
              const ordersData = data || [];
              setAllOrders(ordersData);
              
              // Apply current filter
              if (selectedStatus === "all") {
                setOrders(ordersData);
              } else {
                setOrders(ordersData.filter(order => order.status === selectedStatus));
              }
            } catch (err) {
              console.error("Error updating orders:", err);
            }
          };
          
          updateOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedStatus]);

  // Don't render anything while auth is loading
  if (authLoading) {
    return <Loader />;
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null;
  }

  const fetchHistoryOrders = async () => {
    try {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["completed", "cancelled"])
        .order("created_at", { ascending: false }); // Newest first

      if (error) throw error;
      setHistoryOrders(data || []);
    } catch (err) {
      console.error("Error fetching history orders:", err);
      toast.error("Failed to load order history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Show success message
      const statusMessages = {
        cooking: "Order started cooking!",
        ready: "Order is ready! Admin has been notified.",
      };
      
      if (statusMessages[newStatus as keyof typeof statusMessages]) {
        toast.success(statusMessages[newStatus as keyof typeof statusMessages]);
      }

      // Real-time subscription will handle the update
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Order cancelled");
      // Real-time subscription will handle the update
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Failed to cancel order");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <KitchenHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kitchen Dashboard
          </h1> */}
          <p className="text-gray-600">
            Manage orders and view order history
          </p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="history" onClick={fetchHistoryOrders}>
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {/* Status Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === "all"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({allOrders.length})
              </button>
              <button
                onClick={() => setSelectedStatus("accepted")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === "accepted"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Accepted ({allOrders.filter(o => o.status === "accepted").length})
              </button>
              <button
                onClick={() => setSelectedStatus("processing")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === "processing"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Processing ({allOrders.filter(o => o.status === "processing").length})
              </button>
              <button
                onClick={() => setSelectedStatus("cooking")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === "cooking"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Cooking ({allOrders.filter(o => o.status === "cooking").length})
              </button>
              <button
                onClick={() => setSelectedStatus("ready")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedStatus === "ready"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Ready ({allOrders.filter(o => o.status === "ready").length})
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Active Orders
                </h3>
                <p className="text-gray-500">
                  Orders will appear here when they are ready for preparation
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={updateOrderStatus}
                    onCancel={cancelOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {historyLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : historyOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Order History
                </h3>
                <p className="text-gray-500">
                  Completed and cancelled orders will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {historyOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={() => {}} // No actions for history
                    onCancel={() => {}} // No actions for history
                    isHistory={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}