export type User = {
  id: number;
  name?: string | null;
  surname?: string | null;
  username: string;
  role: string;
};

export type Article = {
  id: number;
  name: string;
  description?: string | null;
};

export type WorkOrder = {
  id: number;
  name: string;
  description?: string | null;
};

export type OrderPriority = "LOW" | "STANDARD" | "HIGH";
export type OrderStatus = "DRAFT" | "PROCESSING" | "COMPLETED" | "SHIPPED";

export type WarehouseOrder = {
  id: number;
  workOrderId: number;
  name: string;
  date: string;
  priority: OrderPriority;
  status: OrderStatus;
};
