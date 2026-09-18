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
export type OrderStatus = "PROCESSING" | "COMPLETED" | "CANCELED";
export type OrderDetailStatus =
  | "TO_PICK"
  | "COMPLETED"
  | "TO_PURCHASE"
  | "CANCELED"
  | "REPLACED";
export type OrderCategory =
  | "HYDRAULIC"
  | "ELECTRICAL"
  | "CONSTRUCTION_CARPENTRY"
  | "HARDWARE_MISC"
  | "CLOTHING";

export type WarehouseOrder = {
  id: number;
  workOrderId: number;
  name: string;
  date: string;
  priority: OrderPriority;
  status: OrderStatus;
  category?: OrderCategory | null;
  assignedWarehouseId?: number | null;
  assignedWarehouseName?: string | null;
  takenInChargeAt?: string | null;
  notes?: string | null;
  netTotal?: number | string | null;
  details?: WarehouseOrderDetail[];
};

export type WarehouseOrderDetail = {
  id: number;
  articleId: number;
  articleSku: string;
  articleDescription: string;
  quantity: number;
  status: OrderDetailStatus;
  pickedQuantity: number;
  remainingQuantity: number;
  unitPrice?: number | string | null;
  subtotal?: number | string | null;
};
