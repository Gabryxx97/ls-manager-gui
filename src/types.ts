export type User = {
  id: number;
  name?: string | null;
  surname?: string | null;
  username: string;
  role: string;
};

export type Article = {
  id: number;
  sku: string;
  description: string;
  category?: string | null;
  costCenter?: string | null;
  unitOfMeasure?: string | null;
  location?: string | null;
  stockQuantity?: number | string | null;
  unitPrice?: number | string | null;
};

export type WorkOrder = {
  id: number;
  name: string;
  description?: string | null;
};

export type OrderPriority = "LOW" | "STANDARD" | "HIGH";
export type OrderStatus = "DRAFT" | "PROCESSING" | "COMPLETED" | "SHIPPED";
export type OrderCategory = "HYDRAULIC_HVAC" | "CONSUMABLE" | "SITE_SUPPLY" | "REPAIR_EMERGENCY";

export type WarehouseOrder = {
  id: number;
  workOrderId: number;
  name: string;
  date: string;
  priority: OrderPriority;
  status: OrderStatus;
  category?: OrderCategory | null;
};
