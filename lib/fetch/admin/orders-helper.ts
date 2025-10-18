import { supabase } from "@/lib/supabase/client";
import { Order } from "@/lib/types";
import { toast } from "sonner";

export type FilterType = "all" | "today" | "week" | "month";

// ✅ Fetch orders directly from Supabase
export async function fetchOrdersData(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("orders error:", err);
    throw new Error("Failed to fetch orders");
  }
}

// ✅ Filter orders by time
export function filterOrdersData(orders: Order[], filter: FilterType): Order[] {
  const now = new Date();

  switch (filter) {
    case "today":
      return orders.filter(
        (o) => new Date(o.created_at).toDateString() === now.toDateString()
      );
    case "week":
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return orders.filter((o) => new Date(o.created_at) >= weekAgo);
    case "month":
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return orders.filter((o) => new Date(o.created_at) >= threeMonthsAgo);
    default:
      return orders;
  }
}

// ✅ Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  orders: Order[]
): Promise<Order[]> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) throw error;

    toast.success("Order status updated");
    return orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
  } catch (error: any) {
    toast.error(error.message || "Error updating status");
    return orders;
  }
}

// ✅ Update payment status
export async function updatePaymentStatus(
  orderId: string,
  newStatus: string,
  orders: Order[]
): Promise<Order[]> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus })
      .eq("id", orderId);

    if (error) throw error;

    toast.success("Payment status updated");
    return orders.map((order) =>
      order.id === orderId
        ? { ...order, payment_status: newStatus }
        : order
    );
  } catch (error: any) {
    toast.error(error.message || "Error updating payment status");
    return orders;
  }
}

// ✅ Tailwind status class
export function getStatusClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "cash_on_delivery":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
