import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import Ticket from "@/models/Ticket";

type JwtUser = {
  id: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
};

type GraphQLContext = {
  user: JwtUser | null;
};

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  role?: "USER" | "ORGANIZER" | "ADMIN";
};

type LoginInput = {
  email: string;
  password: string;
};

type CreateEventInput = {
  title: string;
  description: string;
  category: string;
  image?: string;
  mode: "ONLINE" | "PHYSICAL";
  pricing: "FREE" | "PAID";
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
  latitude?: number;
  longitude?: number;
  onlineLink?: string;
  totalSeats: number;
};

type UpdateEventInput = Partial<CreateEventInput> & {
  status?:
    | "DRAFT"
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "UPCOMING"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED"
    | "SOLD_OUT";
};

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please add JWT_SECRET to .env.local");
}

function generateTicketCode(): string {
  return `EVT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) return null;
      await connectDB();
      return await User.findById(context.user.id).populate("savedEvents");
    },

    getEvents: async () => {
      await connectDB();
      return await Event.find({
        status: { $in: ["APPROVED", "UPCOMING"] },
      }).populate("organizer");
    },

    getEventBySlug: async (
      _parent: unknown,
      args: { slug: string }
    ) => {
      await connectDB();
      return await Event.findOne({ slug: args.slug }).populate("organizer");
    },

    getMyBookings: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      return await Booking.find({ user: context.user.id })
        .populate("user")
        .populate("event");
    },

    getMySavedEvents: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const user = await User.findById(context.user.id).populate("savedEvents");
      return user?.savedEvents || [];
    },

    getMyEvents: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      return await Event.find({ organizer: context.user.id }).populate(
        "organizer"
      );
    },

    getPendingEvents: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      return await Event.find({ status: "PENDING" }).populate("organizer");
    },

    getEventAttendees: async (
      _parent: unknown,
      args: { eventId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const event = await Event.findById(args.eventId);
      if (!event) throw new Error("Event not found");

      if (
        context.user.role !== "ADMIN" &&
        event.organizer.toString() !== context.user.id
      ) {
        throw new Error("Unauthorized");
      }

      return await Booking.find({ event: args.eventId })
        .populate("user")
        .populate("event");
    },

    getAllUsers: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      return await User.find();
    },

    getAllBookings: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      return await Booking.find().populate("user").populate("event");
    },
  },

  Mutation: {
    register: async (
  _parent: unknown,
  args: { input: RegisterInput }
) => {
  const { fullName, email, password, role } = args.input;

  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: role || "USER",
  });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, user };
},

    login: async (
      _parent: unknown,
      args: { input: LoginInput }
    ) => {
      const { email, password } = args.input;

      await connectDB();

      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid email or password");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid email or password");

      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return { token, user };
    },

    createEvent: async (
      _parent: unknown,
      args: { input: CreateEventInput },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      if (!["ORGANIZER", "ADMIN"].includes(context.user.role)) {
        throw new Error("Only organizers or admins can create events");
      }

      const input = args.input;

      await connectDB();

      if (input.mode === "ONLINE" && !input.onlineLink) {
        throw new Error("Online events must include an online link");
      }

      if (input.mode === "PHYSICAL" && !input.locationName) {
        throw new Error("Physical events must include a location");
      }

      if (input.pricing === "PAID" && (!input.price || input.price <= 0)) {
        throw new Error("Paid events must have a valid price");
      }

      const slug =
        slugify(input.title, { lower: true, strict: true }) + "-" + Date.now();

      const event = await Event.create({
        ...input,
        price: input.pricing === "FREE" ? 0 : input.price,
        currency: input.currency || "USD",
        slug,
        bookedSeats: 0,
        availableSeats: input.totalSeats,
        organizer: context.user.id,
        status: "PENDING",
      });

      return await Event.findById(event._id).populate("organizer");
    },

    updateEvent: async (
      _parent: unknown,
      args: { eventId: string; input: UpdateEventInput },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const event = await Event.findById(args.eventId);
      if (!event) throw new Error("Event not found");

      const isOwner = event.organizer.toString() === context.user.id;
      const isAdmin = context.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new Error("Unauthorized");
      }

      Object.assign(event, args.input);

      if (event.pricing === "FREE") {
        event.price = 0;
      }

      if (event.totalSeats < event.bookedSeats) {
        throw new Error("Total seats cannot be less than booked seats");
      }

      event.availableSeats = event.totalSeats - event.bookedSeats;

      await event.save();

      return await Event.findById(event._id).populate("organizer");
    },

    deleteEvent: async (
      _parent: unknown,
      args: { eventId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const event = await Event.findById(args.eventId);
      if (!event) throw new Error("Event not found");

      const isOwner = event.organizer.toString() === context.user.id;
      const isAdmin = context.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new Error("Unauthorized");
      }

      await Event.findByIdAndDelete(args.eventId);

      return "Event deleted successfully";
    },

    approveEvent: async (
      _parent: unknown,
      args: { eventId: string },
      context: GraphQLContext
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      const event = await Event.findById(args.eventId);
      if (!event) throw new Error("Event not found");

      event.status = "APPROVED";
      await event.save();

      return await Event.findById(event._id).populate("organizer");
    },

    rejectEvent: async (
      _parent: unknown,
      args: { eventId: string },
      context: GraphQLContext
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      const event = await Event.findById(args.eventId);
      if (!event) throw new Error("Event not found");

      event.status = "REJECTED";
      await event.save();

      return await Event.findById(event._id).populate("organizer");
    },

    createBooking: async (
      _parent: unknown,
      args: { input: { eventId: string; quantity: number } },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      const { eventId, quantity } = args.input;

      await connectDB();

      const event = await Event.findById(eventId);
      if (!event) throw new Error("Event not found");

      if (!["APPROVED", "UPCOMING"].includes(event.status)) {
        throw new Error("This event is not available for booking");
      }

      if (quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      if (event.availableSeats < quantity) {
        throw new Error("Not enough seats available");
      }

      const totalPrice =
        event.pricing === "PAID" ? (event.price || 0) * quantity : 0;

      const booking = await Booking.create({
        user: context.user.id,
        event: eventId,
        quantity,
        totalPrice,
        bookingStatus: event.pricing === "FREE" ? "CONFIRMED" : "PENDING",
        paymentStatus: event.pricing === "FREE" ? "PAID" : "UNPAID",
      });

      event.bookedSeats += quantity;
      event.availableSeats -= quantity;

      if (event.availableSeats === 0) {
        event.status = "SOLD_OUT";
      }

      await event.save();

      if (event.pricing === "FREE") {
        await Ticket.create({
          booking: booking._id,
          ticketCode: generateTicketCode(),
        });
      }

      return await Booking.findById(booking._id)
        .populate("user")
        .populate("event");
    },

    cancelBooking: async (
      _parent: unknown,
      args: { bookingId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const booking = await Booking.findById(args.bookingId).populate("event");
      if (!booking) throw new Error("Booking not found");

      const isOwner = booking.user.toString() === context.user.id;
      const isAdmin = context.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new Error("Unauthorized");
      }

      if (booking.bookingStatus === "CANCELLED") {
        throw new Error("Booking already cancelled");
      }

      booking.bookingStatus = "CANCELLED";
      await booking.save();

      const event = await Event.findById(booking.event._id);
      if (event) {
        event.bookedSeats -= booking.quantity;
        event.availableSeats += booking.quantity;

        if (event.status === "SOLD_OUT" && event.availableSeats > 0) {
          event.status = "APPROVED";
        }

        await event.save();
      }

      return await Booking.findById(booking._id)
        .populate("user")
        .populate("event");
    },

    saveEvent: async (
      _parent: unknown,
      args: { eventId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const user = await User.findById(context.user.id);
      if (!user) throw new Error("User not found");

      const alreadySaved = user.savedEvents.some(
        (id) => id.toString() === args.eventId
      );

      if (!alreadySaved) {
        user.savedEvents.push(args.eventId as never);
        await user.save();
      }

      return await User.findById(user._id).populate("savedEvents");
    },

    unsaveEvent: async (
      _parent: unknown,
      args: { eventId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const user = await User.findById(context.user.id);
      if (!user) throw new Error("User not found");

      user.savedEvents = user.savedEvents.filter(
        (id) => id.toString() !== args.eventId
      ) as typeof user.savedEvents;

      await user.save();

      return await User.findById(user._id).populate("savedEvents");
    },
  },

  Booking: {
    ticket: async (parent: { _id: string }) => {
      await connectDB();
      return await Ticket.findOne({ booking: parent._id }).populate({
        path: "booking",
        populate: [{ path: "user" }, { path: "event" }],
      });
    },
  },
};