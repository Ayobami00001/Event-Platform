"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { graphqlRequest } from "@/lib/graphqlClient";
import { GET_MY_EVENTS_QUERY } from "@/graphql/queries";
import { UPDATE_EVENT_MUTATION } from "@/graphql/mutations";

type EventMode = "ONLINE" | "PHYSICAL";
type EventPricing = "FREE" | "PAID";

type EventItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  image?: string;
  mode: EventMode;
  pricing: EventPricing;
  price?: number;
  currency?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  onlineLink?: string;
  totalSeats: number;
  status: string;
};

type GetMyEventsResponse = {
  getMyEvents: EventItem[];
};

type UpdateEventResponse = {
  updateEvent: EventItem;
};

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You must be logged in");
          setLoading(false);
          return;
        }

        const data = await graphqlRequest<GetMyEventsResponse>({
          query: GET_MY_EVENTS_QUERY,
          token,
        });

        const event = data.getMyEvents.find((item) => item.id === eventId);

        if (!event) {
          setError("Event not found");
          setLoading(false);
          return;
        }

        setForm({
          title: event.title || "",
          category: event.category || "",
          description: event.description || "",
          image: event.image || "",
          mode: event.mode || "PHYSICAL",
          pricing: event.pricing || "FREE",
          price: event.price ? String(event.price) : "",
          currency: event.currency || "USD",
          startDate: event.startDate || "",
          endDate: event.endDate || "",
          startTime: event.startTime || "",
          endTime: event.endTime || "",
          locationName: event.locationName || "",
          address: event.address || "",
          city: event.city || "",
          state: event.state || "",
          country: event.country || "",
          onlineLink: event.onlineLink || "",
          totalSeats: String(event.totalSeats || ""),
        });
      } catch (err: any) {
        setError(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

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

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in");
      return;
    }

    try {
      setSaving(true);

      await graphqlRequest<UpdateEventResponse>({
        query: UPDATE_EVENT_MUTATION,
        variables: {
          eventId,
          input: {
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
          },
        },
        token,
      });

      setSuccess("Event updated successfully");

      setTimeout(() => {
        router.push("/organizer/my-events");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-slate-50 min-h-screen">
        <Sidebar role="organizer" />
        <Topbar title="Edit Event" />
        <div className="lg:ml-64 pt-24 p-6 md:p-8">Loading event...</div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <Sidebar role="organizer" />
      <Topbar title="Edit Event" />

      <div className="lg:ml-64 pt-24 p-6 md:p-8 max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-6">Edit Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow">
          <input
            name="title"
            value={form.title}
            placeholder="Event Title"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select Category</option>
            <option value="Tech">Tech</option>
            <option value="Music">Music</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
            <option value="Sports">Sports</option>
          </select>

          <textarea
            name="description"
            value={form.description}
            placeholder="Event Description"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg min-h-[120px]"
          />

          <input
            name="image"
            value={form.image}
            placeholder="Image URL"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            >
              <option value="PHYSICAL">Physical</option>
              <option value="ONLINE">Online</option>
            </select>

            <select
              name="pricing"
              value={form.pricing}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            >
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          {form.pricing === "PAID" && (
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="number"
                name="price"
                value={form.price}
                placeholder="Price"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />

              <input
                name="currency"
                value={form.currency}
                placeholder="Currency"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />

            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="p-3 border rounded-lg"
            />
          </div>

          {form.mode === "PHYSICAL" ? (
            <div className="space-y-4">
              <input
                name="locationName"
                value={form.locationName}
                placeholder="Venue Name"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />

              <input
                name="address"
                value={form.address}
                placeholder="Address"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />

              <div className="grid md:grid-cols-3 gap-4">
                <input
                  name="city"
                  value={form.city}
                  placeholder="City"
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />

                <input
                  name="state"
                  value={form.state}
                  placeholder="State"
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />

                <input
                  name="country"
                  value={form.country}
                  placeholder="Country"
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          ) : (
            <input
              name="onlineLink"
              value={form.onlineLink}
              placeholder="Online Event Link"
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          )}

          <input
            type="number"
            name="totalSeats"
            value={form.totalSeats}
            placeholder="Total Seats"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

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
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Event"}
          </button>
        </form>
      </div>
    </main>
  );
}