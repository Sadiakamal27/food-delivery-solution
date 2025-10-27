"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types";
import { 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  X, 
  ChefHat,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface KitchenOrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onCancel: (orderId: string) => void;
  isHistory?: boolean;
}

export function KitchenOrderCard({ 
  order, 
  onStatusUpdate, 
  onCancel,
  isHistory = false
}: KitchenOrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      await onCancel(order.id);
    }
  };

  const getStatusInfo = () => {
    switch (order.status) {
      case "accepted":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="h-4 w-4" />,
          text: "Accepted",
          nextAction: "Start Preparing",
          nextStatus: "cooking"
        };
      case "processing":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Clock className="h-4 w-4" />,
          text: "Processing",
          nextAction: "Start Preparing",
          nextStatus: "cooking"
        };
      case "cooking":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: <ChefHat className="h-4 w-4" />,
          text: "Cooking",
          nextAction: "Mark Ready",
          nextStatus: "ready"
        };
      case "ready":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-4 w-4" />,
          text: "Ready",
          nextAction: null,
          nextStatus: null
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <AlertCircle className="h-4 w-4" />,
          text: order.status,
          nextAction: null,
          nextStatus: null
        };
    }
  };

  const statusInfo = getStatusInfo();
  const orderItems = order.metadata || [];

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Order #{order.id.slice(-6)}</h3>
            <Badge className={statusInfo.color}>
              {statusInfo.icon}
              {statusInfo.text}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

       <CardContent className="space-y-4">
         {/* Customer Info - Only Name */}
         <div className="flex items-center gap-2 text-sm">
           <User className="h-4 w-4 text-gray-500" />
           <span className="font-medium">{order.full_name || "Guest"}</span>
         </div>

        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Items:</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {orderItems.map((item: any, index: number) => (
              <div key={index} className="space-y-1 text-sm border-b pb-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  <span className="text-gray-600 ml-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                {/* Display sauce if available */}
                {item.options?.selectedSauce && (
                  <div className="text-xs text-gray-500 ml-2">
                    🍯 Sauce: {item.options.selectedSauce.name}
                  </div>
                )}
                {/* Display addons if available */}
                {item.options?.selectedAddons && item.options.selectedAddons.length > 0 && (
                  <div className="text-xs text-gray-500 ml-2">
                    ➕ Addons: {item.options.selectedAddons.map((addon: any) => addon.name).join(', ')}
                  </div>
                )}
                {/* Display meal options if available */}
                {item.options?.selectedMealOptions && item.options.selectedMealOptions.length > 0 && (
                  <div className="text-xs text-gray-500 ml-2">
                    🍽️ Meal: {item.options.selectedMealOptions.map((option: any) => option.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Total */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">${order.order_total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Button - Only show for active orders */}
        {!isHistory && statusInfo.nextAction && (
          <Button
            onClick={() => handleStatusUpdate(statusInfo.nextStatus!)}
            disabled={isUpdating}
            className={`w-full ${
              order.status === "accepted" || order.status === "processing"
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : order.status === "cooking"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
          >
            {isUpdating ? "Updating..." : statusInfo.nextAction}
          </Button>
        )}


        {/* Order Time */}
        <div className="text-xs text-gray-500 text-center">
          {new Date(order.created_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
