"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphqlClient";
import { CREATE_EVENT_MUTATION } from "@/graphql/mutations";

type EventMode = "ONLINE" | "PHYSICAL";
type EventPricing = "FREE" | "PAID";

type CreateEventResponse = {
  createEvent: {
    id: string;
    title: string;
    slug: string;
    status: string;
  };
};

export default function CreateEventForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
    mode: "PHYSICAL" as EventMode,
    pricing: "FREE" as EventPricing,
    price: "",
    currency: "USD",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    locationName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    onlineLink: "",
    totalSeats: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Event title is required";
    if (!form.category.trim()) return "Category is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.startDate) return "Start date is required";
    if (!form.endDate) return "End date is required";
    if (!form.totalSeats) return "Total seats is required";

    if (Number(form.totalSeats) <= 0) {
      return "Total seats must be greater than 0";
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      return "End date cannot be earlier than start date";
    }

    if (form.mode === "ONLINE" && !form.onlineLink.trim()) {
      return "Online link is required for online events";
    }

    if (form.mode === "PHYSICAL" && !form.locationName.trim()) {
      return "Location name is required for physical events";
    }

    if (form.pricing === "PAID") {
      if (!form.price) return "Price is required for paid events";
      if (Number(form.price) <= 0) return "Price must be greater than 0";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setError("You must be logged in to create an event");
      return;
    }

    const input = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      image: form.image.trim() || null,
      mode: form.mode,
      pricing: form.pricing,
      price: form.pricing === "PAID" ? Number(form.price) : 0,
      currency: form.currency.trim() || "USD",
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      locationName: form.mode === "PHYSICAL" ? form.locationName.trim() : null,
      address: form.mode === "PHYSICAL" ? form.address.trim() || null : null,
      city: form.mode === "PHYSICAL" ? form.city.trim() || null : null,
      state: form.mode === "PHYSICAL" ? form.state.trim() || null : null,
      country: form.mode === "PHYSICAL" ? form.country.trim() || null : null,
      onlineLink: form.mode === "ONLINE" ? form.onlineLink.trim() : null,
      totalSeats: Number(form.totalSeats),
    };

    try {
      setLoading(true);

      await graphqlRequest<CreateEventResponse>({
        query: CREATE_EVENT_MUTATION,
        variables: { input },
        token,
      });

      setSuccess("Event created successfully and sent for approval");

      setForm({
        title: "",
        category: "",
        description: "",
        image: "",
        mode: "PHYSICAL",
        pricing: "FREE",
        price: "",
        currency: "USD",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        locationName: "",
        address: "",
        city: "",
        state: "",
        country: "",
        onlineLink: "",
        totalSeats: "",
      });

      setTimeout(() => {
        router.push("/organizer/my-events");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-8 rounded-2xl shadow"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Event Title
        </label>
        <input
          name="title"
          value={form.title}
          placeholder="Event Title"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg outline-none"
        >
          <option value="">Select Category</option>
          <option value="Tech">Tech</option>
          <option value="Music">Music</option>
          <option value="Business">Business</option>
          <option value="Education">Education</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          placeholder="Event Description"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg outline-none min-h-[120px]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Image URL
        </label>
        <input
          name="image"
          value={form.image}
          placeholder="https://example.com/event-image.jpg"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg outline-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Mode
          </label>
          <select
            name="mode"
            value={form.mode}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none"
          >
            <option value="PHYSICAL">Physical</option>
            <option value="ONLINE">Online</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Pricing
          </label>
          <select
            name="pricing"
            value={form.pricing}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none"
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {form.pricing === "PAID" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              placeholder="Enter price"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Currency
            </label>
            <input
              name="currency"
              value={form.currency}
              placeholder="USD"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none"
            />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            End Time
          </label>
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none"
          />
        </div>
      </div>

      {form.mode === "PHYSICAL" ? (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Location Name
            </label>
            <input
              name="locationName"
              value={form.locationName}
              placeholder="Event venue"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none"
            />
          </div>

          <input
            name="address"
            value={form.address}
            placeholder="Address"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none"
          />

          <div className="grid md:grid-cols-3 gap-4">
            <input
              name="city"
              value={form.city}
              placeholder="City"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none"
            />

            <input
              name="state"
              value={form.state}
              placeholder="State"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none"
            />

            <input
              name="country"
              value={form.country}
              placeholder="Country"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg outline-none"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Online Link
          </label>
          <input
            name="onlineLink"
            value={form.onlineLink}
            placeholder="https://zoom.us/..."
            onChange={handleChange}
            className="w-full p-3 border rounded-lg outline-none"
          />
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Total Seats
        </label>
        <input
          type="number"
          name="totalSeats"
          value={form.totalSeats}
          placeholder="Number of seats"
          onChange={handleChange}
          className="w-full p-3 border rounded-lg outline-none"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish Event"}
      </button>
    </form>
  );
}