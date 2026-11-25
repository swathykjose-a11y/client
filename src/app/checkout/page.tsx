"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { PriceDisplay } from "@/components/ui/price-display";
import { Button } from "@/components/ui/button";
import { STORE_UPI } from "@/lib/store-payment";
import type { Order, ShippingAddress, UpiPaymentInstructions } from "@/types/order";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [upiPayment, setUpiPayment] = useState<UpiPaymentInstructions | null>(null);

  const shippingFee = subtotal >= 999 || items.length === 0 ? 0 : 99;
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (
      !formData.firstName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.addressLine1.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: formData,
        items: items.map((i) => ({
          productId: i.product.id,
          productTitle: i.product.title,
          productHandle: i.product.handle,
          variantId: i.variantId,
          variantTitle: i.variantTitle,
          price: parseFloat(i.price.amount),
          quantity: i.quantity,
          imageUrl: i.product.images?.[0]?.url,
        })),
        subtotal,
        shippingFee,
        total: grandTotal,
        paymentMethod: "upi",
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order.");
      }

      setPlacedOrder(data.order);
      setUpiPayment(data.payment ?? null);
      clearCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Order Placed Confirmation Screen ──────────────────────────────────────
  if (placedOrder) {
    return (
      <section className="py-16 md:py-24 bg-sage-canvas min-h-[80vh]">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-card-white border border-sage-border/60 p-8 sm:p-12 text-center rounded-xs shadow-xs animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sage-border/30 flex items-center justify-center text-charcoal">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span className="text-[10px] font-primary font-medium uppercase tracking-[0.25em] text-sage-muted mb-2 block">
              Pay by UPI
            </span>

            <h1 className="font-secondary text-3xl sm:text-4xl text-charcoal mb-3">
              Complete your payment
            </h1>

            <p className="text-xs sm:text-sm font-primary text-sage-muted leading-relaxed mb-6">
              Order{" "}
              <strong className="text-charcoal font-medium">
                #{placedOrder.orderNumber}
              </strong>{" "}
              is reserved. We dispatch it only after this UPI payment arrives. Cash on delivery is not available.
            </p>

            <div className="bg-sage-canvas/70 border border-sage-border/40 p-4 sm:p-6 text-left mb-8 rounded-xs text-xs font-primary space-y-2">
              <div className="flex justify-between border-b border-sage-border/30 pb-2">
                <span className="text-sage-muted">Recipient:</span>
                <span className="text-charcoal font-medium">
                  {placedOrder.customer.firstName} {placedOrder.customer.lastName}
                </span>
              </div>
              <div className="flex justify-between border-b border-sage-border/30 pb-2">
                <span className="text-sage-muted">Delivery Address:</span>
                <span className="text-charcoal text-right max-w-[60%] font-medium">
                  {placedOrder.customer.addressLine1},{" "}
                  {placedOrder.customer.addressLine2
                    ? `${placedOrder.customer.addressLine2}, `
                    : ""}
                  {placedOrder.customer.city}, {placedOrder.customer.state} -{" "}
                  {placedOrder.customer.postalCode}
                </span>
              </div>
              <div className="flex justify-between border-b border-sage-border/30 pb-2">
                <span className="text-sage-muted">Pay to:</span>
                <span className="text-charcoal text-right font-medium">
                  {upiPayment?.payeeName || STORE_UPI.payeeName}
                </span>
              </div>
              <div className="flex justify-between border-b border-sage-border/30 pb-2">
                <span className="text-sage-muted">UPI ID:</span>
                <span className="text-charcoal text-right font-medium">
                  {upiPayment?.vpa || STORE_UPI.vpa}
                </span>
              </div>
              <div className="flex justify-between border-b border-sage-border/30 pb-2">
                <span className="text-sage-muted">Phone:</span>
                <span className="text-charcoal text-right font-medium">
                  {upiPayment?.phone || STORE_UPI.phone}
                </span>
              </div>
              <div className="flex justify-between border-b border-sage-border/30 pb-2">
                <span className="text-sage-muted">Payment note:</span>
                <span className="text-charcoal text-right font-medium">
                  {upiPayment?.note || `Dainty Dazzle ${placedOrder.orderNumber}`}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-sage-muted">Total Amount:</span>
                <PriceDisplay
                  amount={placedOrder.total.toFixed(0)}
                  currencyCode="INR"
                  className="font-medium text-charcoal text-sm"
                />
              </div>
            </div>

            {upiPayment?.upiUri ? (
              <a
                href={upiPayment.upiUri}
                className="inline-flex mb-6 text-xs font-primary uppercase tracking-wider text-charcoal underline underline-offset-4"
              >
                Open UPI app to pay
              </a>
            ) : null}

            <p className="text-[11px] font-primary text-sage-muted mb-8">
              Use the phone number or UPI ID above. Put the order number in the payment note.
              Estimated delivery after payment is confirmed: 5–7 business days.
            </p>

            <Link href="/products">
              <Button variant="primary" size="lg">
                CONTINUE SHOPPING ↗
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ─── Empty Cart State ──────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <section className="py-20 bg-sage-canvas min-h-[75vh]">
        <div className="w-full max-w-md mx-auto px-4 text-center">
          <h1 className="font-secondary text-3xl text-charcoal mb-4">
            Your shopping bag is empty
          </h1>
          <p className="text-xs sm:text-sm font-primary text-sage-muted mb-8">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link href="/products">
            <Button variant="primary" size="lg">
              EXPLORE JEWELRY ↗
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  // ─── Checkout Form & Order Summary ─────────────────────────────────────────
  return (
    <section className="py-12 md:py-20 bg-sage-canvas min-h-[85vh]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8">
        <div className="mb-8 md:mb-12 border-b border-sage-border/60 pb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-primary font-medium uppercase tracking-[0.25em] text-sage-muted mb-1 block">
              Direct Checkout
            </span>
            <h1 className="font-secondary text-3xl md:text-4xl text-charcoal tracking-tight font-normal">
              Complete Your Order
            </h1>
          </div>
          <Link
            href="/cart"
            className="text-[11px] font-primary font-medium tracking-wider text-charcoal/80 hover:text-charcoal uppercase"
          >
            ← Back to Bag
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-primary rounded-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ─── Left: Shipping & Contact Form ───────────────────────────── */}
            <div className="lg:col-span-7 space-y-8">
              {/* Contact Information */}
              <div className="bg-card-white border border-sage-border/60 p-6 sm:p-8 rounded-xs space-y-4">
                <h2 className="font-secondary text-xl text-charcoal">
                  1. Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card-white border border-sage-border/60 p-6 sm:p-8 rounded-xs space-y-4">
                <h2 className="font-secondary text-xl text-charcoal">
                  2. Delivery Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                    Street Address / House No *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    required
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Flat/House no., Street name"
                    className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                    Apartment, Suite, Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Near city center, Floor 2"
                    className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                      className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card-white border border-sage-border/60 p-6 sm:p-8 rounded-xs space-y-4">
                <h2 className="font-secondary text-xl text-charcoal">
                  3. Payment Method
                </h2>

                <div className="border border-charcoal bg-sage-canvas/30 p-4 rounded-xs space-y-2">
                  <div className="text-xs font-primary font-medium text-charcoal">
                    UPI to {STORE_UPI.payeeName}
                  </div>
                  <p className="text-[11px] font-primary text-sage-muted leading-relaxed">
                    Pay from any UPI app to phone{" "}
                    <span className="text-charcoal font-medium">{STORE_UPI.phone}</span> or UPI ID{" "}
                    <span className="text-charcoal font-medium">{STORE_UPI.vpa}</span>.
                    Cash on delivery is not available. We ship after the payment shows on this number.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Right: Order Summary Sidebar ────────────────────────────── */}
            <div className="lg:col-span-5 bg-card-white border border-sage-border/60 p-6 sm:p-8 rounded-xs space-y-6">
              <h2 className="font-secondary text-xl text-charcoal pb-4 border-b border-sage-border/50">
                Order Summary ({items.length})
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center gap-4 py-2 border-b border-sage-border/30 last:border-none"
                  >
                    <div className="relative w-14 h-16 bg-[#E8E4DF] rounded-xs overflow-hidden shrink-0">
                      {item.product.images?.[0]?.url && (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.title}
                          fill
                          className="object-cover object-center"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-primary font-medium text-charcoal truncate">
                        {item.product.title}
                      </div>
                      <div className="text-[10px] font-primary text-sage-muted">
                        Qty: {item.quantity} • {item.variantTitle}
                      </div>
                    </div>
                    <PriceDisplay
                      amount={(
                        parseFloat(item.price.amount) * item.quantity
                      ).toFixed(0)}
                      currencyCode="INR"
                      className="text-xs font-primary text-charcoal font-medium shrink-0"
                    />
                  </div>
                ))}
              </div>

              {/* Costs Breakdown */}
              <div className="space-y-2 pt-4 border-t border-sage-border/40 text-xs font-primary">
                <div className="flex justify-between text-sage-muted">
                  <span>Subtotal</span>
                  <PriceDisplay
                    amount={subtotal.toFixed(0)}
                    currencyCode="INR"
                    className="text-charcoal font-medium"
                  />
                </div>

                <div className="flex justify-between text-sage-muted">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? "FREE" : "₹99"}</span>
                </div>

                <div className="flex justify-between text-charcoal text-sm font-medium pt-3 border-t border-sage-border/40">
                  <span>Total Amount</span>
                  <PriceDisplay
                    amount={grandTotal.toFixed(0)}
                    currencyCode="INR"
                    className="text-base font-semibold text-charcoal"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "PROCESSING..." : "PLACE ORDER & PAY BY UPI ↗"}
              </Button>

              <p className="text-[10px] font-primary text-center text-sage-muted tracking-wider uppercase">
                Encrypted Checkout • Quality Guaranteed
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
