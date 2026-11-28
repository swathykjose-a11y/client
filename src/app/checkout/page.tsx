"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useCart } from "@/components/providers/cart-provider";
import { PriceDisplay } from "@/components/ui/price-display";
import { Button } from "@/components/ui/button";
import { STORE_UPI, buildUpiUri } from "@/lib/store-payment";
import { getShippingSettings } from "@/lib/api";
import type { Order, ShippingAddress } from "@/types/order";

type CheckoutStep = "address" | "payment" | "confirmed";

const SAVED_CUSTOMER_KEY = "dd_checkout_customer_v1";
const SAVED_CHECKOUT_DRAFT_KEY = "dd_checkout_draft_v1";
const EMPTY_SHIPPING: ShippingAddress = {
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
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [formData, setFormData] = useState<ShippingAddress>(EMPTY_SHIPPING);
  const [hasSavedDetails, setHasSavedDetails] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  // Load saved customer details & checkout step draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_CUSTOMER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ShippingAddress>;
        if (parsed && typeof parsed === "object") {
          setFormData((prev) => ({ ...prev, ...parsed }));
          setHasSavedDetails(
            Boolean(parsed.email || parsed.phone || parsed.addressLine1),
          );
        }
      }
      const draftRaw = localStorage.getItem(SAVED_CHECKOUT_DRAFT_KEY);
      if (draftRaw) {
        const draft = JSON.parse(draftRaw) as {
          step?: CheckoutStep;
          transactionId?: string;
          idempotencyKey?: string;
        };
        if (draft.step === "payment") {
          setStep("payment");
        }
        if (draft.transactionId) {
          setTransactionId(draft.transactionId);
        }
        setIdempotencyKey(draft.idempotencyKey || crypto.randomUUID());
      } else {
        setIdempotencyKey(crypto.randomUUID());
      }
    } catch {
      setIdempotencyKey(crypto.randomUUID());
    }
  }, []);

  // Persist current checkout step, transactionId & idempotencyKey across page refreshes
  useEffect(() => {
    if (step === "confirmed") return;
    try {
      localStorage.setItem(
        SAVED_CHECKOUT_DRAFT_KEY,
        JSON.stringify({ step, transactionId, idempotencyKey }),
      );
    } catch {
      // ignore
    }
  }, [step, transactionId, idempotencyKey]);

  const [copiedField, setCopiedField] = useState<"vpa" | "phone" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [confirmedTxnId, setConfirmedTxnId] = useState("");
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(299);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(99);

  useEffect(() => {
    getShippingSettings().then((s) => {
      setFreeDeliveryAbove(s.freeDeliveryAbove);
      setBaseDeliveryFee(s.deliveryFee);
    });
  }, []);

  const shippingFee = subtotal > freeDeliveryAbove || items.length === 0 ? 0 : baseDeliveryFee;
  const grandTotal = subtotal + shippingFee;
  const upiQrValue = buildUpiUri(grandTotal, "Dainty Dazzle Order");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      try {
        localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(next));
        setHasSavedDetails(true);
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  const handleClearSavedDetails = () => {
    setFormData(EMPTY_SHIPPING);
    setHasSavedDetails(false);
    try {
      localStorage.removeItem(SAVED_CUSTOMER_KEY);
    } catch {
      // ignore
    }
  };

  const handleCopy = (value: string, field: "vpa" | "phone") => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Step 1 -> Step 2: Validate address locally & show QR code (no order created yet)
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 -> Step 3: Submit transaction ID (UTR), create order & notify admin
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanedTxnId = transactionId.trim();
    if (cleanedTxnId.length < 6) {
      setErrorMessage("Please enter a valid UPI Transaction ID / UTR (at least 6 characters).");
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
        transactionId: cleanedTxnId,
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
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

      setConfirmedTxnId(cleanedTxnId);
      setPlacedOrder(data.order);
      setStep("confirmed");
      try {
        localStorage.removeItem(SAVED_CHECKOUT_DRAFT_KEY);
      } catch {
        // ignore
      }
      clearCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Step 3: Order Confirmed Screen ────────────────────────────────────────
  if (step === "confirmed" && placedOrder) {
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
              Order Received
            </span>

            <h1 className="font-secondary text-3xl sm:text-4xl text-charcoal mb-3">
              Thank you for your order
            </h1>

            <p className="text-xs sm:text-sm font-primary text-sage-muted leading-relaxed mb-6">
              Order{" "}
              <strong className="text-charcoal font-medium">
                #{placedOrder.orderNumber}
              </strong>{" "}
              has been placed. We are verifying your UPI payment and will dispatch your jewelry shortly.
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
                <span className="text-sage-muted">UPI Transaction ID / UTR:</span>
                <span className="text-charcoal text-right font-mono font-medium">
                  {confirmedTxnId}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-sage-muted">Total Paid:</span>
                <PriceDisplay
                  amount={placedOrder.total.toFixed(0)}
                  currencyCode="INR"
                  className="font-medium text-charcoal text-sm"
                />
              </div>
            </div>

            <p className="text-[11px] font-primary text-sage-muted mb-8">
              Estimated delivery after payment verification: 5–7 business days.
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

  // ─── Step 2: UPI QR Code & Transaction ID Submission ───────────────────────
  if (step === "payment") {
    return (
      <section className="py-12 md:py-20 bg-sage-canvas min-h-[85vh]">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
          <div className="mb-8 border-b border-sage-border/60 pb-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-primary font-medium uppercase tracking-[0.25em] text-sage-muted mb-1 block">
                Step 2 of 2 • UPI Payment
              </span>
              <h1 className="font-secondary text-3xl text-charcoal tracking-tight font-normal">
                Scan &amp; Pay
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setStep("address");
              }}
              className="text-[11px] font-primary font-medium tracking-wider text-charcoal/80 hover:text-charcoal uppercase cursor-pointer"
            >
              ← Edit Address
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-primary rounded-xs">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleConfirmPayment}
            className="bg-card-white border border-sage-border/60 p-6 sm:p-10 rounded-xs space-y-6"
          >
            {/* Dynamic QR Code for exact cart value */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-3 border border-sage-border/60 rounded-xs">
                <QRCodeSVG
                  value={upiQrValue}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div>
                <p className="text-[11px] font-primary uppercase tracking-[0.16em] text-sage-muted">
                  Amount to Pay
                </p>
                <PriceDisplay
                  amount={grandTotal.toFixed(0)}
                  currencyCode="INR"
                  className="text-2xl font-secondary text-charcoal mt-0.5 block"
                />
              </div>
              <p className="text-xs font-primary text-sage-muted max-w-sm">
                Scan this QR code with Google Pay, PhonePe, Paytm, or any UPI app. The exact amount is pre-filled.
              </p>
            </div>

            {/* Store UPI ID & Phone Number */}
            <div className="bg-sage-canvas/60 border border-sage-border/40 p-4 sm:p-5 rounded-xs space-y-3 text-xs font-primary">
              <div className="flex items-center justify-between gap-2 border-b border-sage-border/30 pb-2.5">
                <span className="text-sage-muted">Payee Name</span>
                <span className="text-charcoal font-medium">{STORE_UPI.payeeName}</span>
              </div>

              <div className="flex items-center justify-between gap-2 border-b border-sage-border/30 pb-2.5">
                <span className="text-sage-muted">UPI ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-charcoal font-mono font-medium">{STORE_UPI.vpa}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(STORE_UPI.vpa, "vpa")}
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-sage-border hover:border-charcoal text-charcoal rounded-xs cursor-pointer"
                  >
                    {copiedField === "vpa" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-sage-muted">Phone Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-charcoal font-mono font-medium">+91 {STORE_UPI.phone}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(STORE_UPI.phone, "phone")}
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-sage-border hover:border-charcoal text-charcoal rounded-xs cursor-pointer"
                  >
                    {copiedField === "phone" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction ID / UTR Input */}
            <div className="space-y-2 pt-2 border-t border-sage-border/40">
              <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal">
                UPI Transaction ID / UTR Number *
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 412345678901 (12-digit UTR from your UPI app)"
                className="w-full px-3.5 py-3 text-xs font-mono bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
              />
              <p className="text-[11px] font-primary text-sage-muted">
                After completing payment, enter the Transaction ID / UTR shown in your UPI app to confirm your order.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "CONFIRMING ORDER..." : "CONFIRM PAYMENT & PLACE ORDER ↗"}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  // ─── Step 1: Checkout Address Form & Order Summary ─────────────────────────
  return (
    <section className="py-12 md:py-20 bg-sage-canvas min-h-[85vh]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8">
        <div className="mb-8 md:mb-12 border-b border-sage-border/60 pb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-primary font-medium uppercase tracking-[0.25em] text-sage-muted mb-1 block">
              Step 1 of 2 • Direct Checkout
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

        <form onSubmit={handleProceedToPayment}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ─── Left: Shipping & Contact Form ───────────────────────────── */}
            <div className="lg:col-span-7 space-y-8">
              {/* Contact Information */}
              <div className="bg-card-white border border-sage-border/60 p-6 sm:p-8 rounded-xs space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-secondary text-xl text-charcoal">
                    1. Contact Information
                  </h2>
                  {hasSavedDetails && (
                    <button
                      type="button"
                      onClick={handleClearSavedDetails}
                      className="text-[10px] font-primary uppercase tracking-wider text-sage-muted hover:text-charcoal underline underline-offset-4 cursor-pointer"
                    >
                      Clear saved details
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-primary uppercase tracking-wider text-charcoal mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
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
                      autoComplete="tel"
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
                      autoComplete="given-name"
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
                      autoComplete="family-name"
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
                    autoComplete="address-line1"
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
                    autoComplete="address-line2"
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
                      autoComplete="address-level2"
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
                      autoComplete="address-level1"
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
                      autoComplete="postal-code"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      className="w-full px-3 py-2.5 text-xs font-primary bg-sage-canvas/40 border border-sage-border focus:border-charcoal focus:outline-none rounded-xs"
                    />
                  </div>
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
                  <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
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

              {/* Continue CTA */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-full"
              >
                CONTINUE TO PAYMENT ↗
              </Button>

              <p className="text-[10px] font-primary text-center text-sage-muted tracking-wider uppercase">
                Pay by UPI • Cash on Delivery Unavailable
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
