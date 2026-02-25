"use client";
import { useState } from "react";
import { useForm } from "@/context/FormContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Button from "@/components/ui/Button";

export default function ShippingScreen() {
  const { nextStep, setField, data } = useForm();
  const [address, setAddress] = useState(data.address);
  const [city, setCity] = useState(data.city);
  const [state, setState] = useState(data.state);
  const [zip, setZip] = useState(data.zip);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!address.trim()) {
      setError("Please enter an address");
      return;
    }
    if (!city.trim()) {
      setError("Please enter a city");
      return;
    }
    if (!state.trim()) {
      setError("Please enter a state");
      return;
    }
    if (!zip.trim()) {
      setError("Please enter a ZIP code");
      return;
    }
    setField("address", address.trim());
    setField("city", city.trim());
    setField("state", state.trim());
    setField("zip", zip.trim());
    nextStep();
  };

  const inputClass =
    "w-full px-4 py-3 text-lg border-2 border-neffy-200 rounded-xl focus:border-neffy-500 focus:ring-2 focus:ring-neffy-200 outline-none transition-all bg-white";

  return (
    <ScreenWrapper title="Shipping Address">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            Street Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => { setAddress(e.target.value); setError(""); }}
            className={inputClass}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => { setCity(e.target.value); setError(""); }}
            className={inputClass}
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => { setState(e.target.value.toUpperCase()); setError(""); }}
              placeholder="CA"
              maxLength={2}
              className={inputClass}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              ZIP Code
            </label>
            <input
              type="text"
              value={zip}
              onChange={(e) => { setZip(e.target.value.replace(/\D/g, "")); setError(""); }}
              placeholder="90210"
              maxLength={5}
              className={inputClass}
              dir="ltr"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <Button onClick={handleContinue} disabled={!address || !city || !state || !zip}>
          Continue
        </Button>
      </div>
    </ScreenWrapper>
  );
}
