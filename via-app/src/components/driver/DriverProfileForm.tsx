// src/components/driver/DriverProfileForm.tsx
'use client';

import { useState, type FormEvent } from 'react';

import { transportApi } from '@/lib/api/transport';
import { useToast } from '@/components/ui/Toast';
import { toErrorMessage } from '@/lib/utils/apiError';

const VEHICLE_OPTIONS = [
  { value: 'bike', label: 'Bike' },
  { value: 'ev', label: 'EV' },
  { value: 'car', label: 'Car' },
  { value: 'car_xl', label: 'Car XL' },
] as const;

interface DriverProfileFormProps {
  onCreated: () => void;
}

/** Profile creation with client-side validation and readable server errors. */
export function DriverProfileForm({ onCreated }: DriverProfileFormProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameError = name.trim().length < 3 ? 'Full name must be at least 3 characters.' : null;
  const vehicleError = vehicleType === '' ? 'Select a vehicle type.' : null;
  const numberError = vehicleNumber.trim().length < 4 ? 'Enter a valid vehicle number.' : null;
  const formValid = !nameError && !vehicleError && !numberError;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!formValid) {
      showToast('Please fix the highlighted fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await transportApi.createDriverProfile({
        name: name.trim(),
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
      });
      showToast('Driver profile created — you can now accept rides', 'success');
      onCreated();
    } catch (error) {
      showToast(toErrorMessage(error), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="driver-name" className="mb-2 block text-sm font-semibold text-gray-900">Full Name</label>
        <input
          id="driver-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Salim Reza"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#4DBE55]"
        />
        {submitted && nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
      </div>

      <div>
        <label htmlFor="driver-vehicle" className="mb-2 block text-sm font-semibold text-gray-900">Vehicle Type</label>
        <select
          id="driver-vehicle"
          value={vehicleType}
          onChange={(event) => setVehicleType(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#4DBE55]"
        >
          <option value="" disabled>Select vehicle</option>
          {VEHICLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {submitted && vehicleError && <p className="mt-1 text-xs text-red-500">{vehicleError}</p>}
      </div>

      <div>
        <label htmlFor="driver-number" className="mb-2 block text-sm font-semibold text-gray-900">Vehicle Number</label>
        <input
          id="driver-number"
          value={vehicleNumber}
          onChange={(event) => setVehicleNumber(event.target.value)}
          placeholder="Dhaka Metro Ka 123456"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#4DBE55]"
        />
        {submitted && numberError && <p className="mt-1 text-xs text-red-500">{numberError}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#4DBE55] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3da447] disabled:opacity-60"
      >
        {submitting ? 'Creating…' : 'Create Profile'}
      </button>
    </form>
  );
}