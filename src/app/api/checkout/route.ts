import { NextResponse } from "next/server";
import { createOrder } from "@/lib/api";
import type { CreateOrderPayload } from "@/types/order";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // If client submits a full dropshipping order
    if (body.customer && body.items) {
      const payload: CreateOrderPayload = body;
      const result = await createOrder(payload);
      return NextResponse.json(result);
    }

    // If called with just cart items to get checkout URL
    if (body.items && Array.isArray(body.items)) {
      return NextResponse.json({ checkoutUrl: "/checkout" });
    }

    return NextResponse.json(
      { error: "Invalid checkout request format" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 },
    );
  }
}
