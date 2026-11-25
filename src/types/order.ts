export interface CheckoutItem {
  variantId: string;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = "upi";

export interface UpiPaymentInstructions {
  payeeName: string;
  vpa: string;
  phone: string;
  amount: number;
  currency: "INR";
  note: string;
  upiUri: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ordered_from_supplier"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  productTitle: string;
  productHandle: string;
  variantId: string;
  variantTitle: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CreateOrderPayload {
  customer: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Order extends CreateOrderPayload {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  supplierDetails?: {
    supplierUrl?: string;
    supplierOrderId?: string;
    supplierCost?: number;
    supplierNotes?: string;
  };
}
