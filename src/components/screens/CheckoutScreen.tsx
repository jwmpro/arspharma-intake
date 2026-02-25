"use client";
import { useState } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";
import { CONSULTATION_FEE, SHIPPING_FEE } from "@/config/medications";

export default function CheckoutScreen() {
  const { data, setField } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nameOnCard: `${data.firstName} ${data.lastName}`,
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/25",
    cvv: "123",
  });

  const drugPrice = 199;
  const consultationFee = CONSULTATION_FEE;
  const shippingFee = SHIPPING_FEE;
  const total = drugPrice + consultationFee + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing delay
    setTimeout(() => {
      setField("paymentIntentId", "demo_payment_" + Date.now());
      setField("paymentComplete", true);
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center py-12 space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Order Placed Successfully!</h2>
        <p className="text-gray-500 text-center text-lg">
          This is a demo. Your neffy® order has been confirmed.
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-3xl">⭐</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScreenWrapper title="Checkout">
      {/* Order summary */}
      <div className="mb-6 p-5 bg-neffy-50 rounded-2xl border-2 border-neffy-100">
        <h3 className="font-bold text-neffy-500 mb-4 text-sm uppercase tracking-wide">
          Order Summary
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>neffy® (epinephrine nasal spray) 2mg × 2</span>
            <span className="font-semibold">${drugPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Provider consultation fee</span>
            <span className="font-semibold">${consultationFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Shipping</span>
            <span className="font-semibold text-green-600">FREE</span>
          </div>
        </div>

        <hr className="border-neffy-200 my-4" />

        <div className="flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-xl text-neffy-500">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name on Card
          </label>
          <input
            type="text"
            value={formData.nameOnCard}
            onChange={(e) => setFormData({ ...formData, nameOnCard: e.target.value })}
            className="w-full px-4 py-3 border-2 border-neffy-200 rounded-xl focus:border-neffy-500 focus:ring-2 focus:ring-neffy-400 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number (Demo)
          </label>
          <input
            type="text"
            value={formData.cardNumber}
            disabled
            className="w-full px-4 py-3 border-2 border-neffy-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry (Demo)
            </label>
            <input
              type="text"
              value={formData.expiry}
              disabled
              className="w-full px-4 py-3 border-2 border-neffy-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV (Demo)
            </label>
            <input
              type="text"
              value={formData.cvv}
              disabled
              className="w-full px-4 py-3 border-2 border-neffy-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} size="lg">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            "Place Order (Demo)"
          )}
        </Button>
      </form>

      <p className="text-xs text-gray-400 text-center">
        This is a demo checkout. No real payment will be processed.
      </p>
    </ScreenWrapper>
  );
}
