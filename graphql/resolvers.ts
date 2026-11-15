import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import slugify from "slugify";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import Booking from "@/models/Booking";
import Ticket from "@/models/Ticket";
import { randomUUID } from "crypto";
import { confirmPaystackBooking } from "@/lib/payments/confirmPaystackBooking";

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

type UpdateProfileInput = {
  fullName?: string;
  phone?: string;
  avatar?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
};

type UpdateOrganizerProfileInput = {
  fullName?: string;
  phone?: string;
  avatar?: string;

  country?: string;
  state?: string;
  city?: string;
  address?: string;

  organizationName?: string;
  organizationDescription?: string;
  organizationLogo?: string;
  organizationWebsite?: string;
  organizerBio?: string;
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

// Event dates and times are stored in Nigeria time (UTC+1).
function getEventEndTime(event: {
  endDate: string;
  endTime?: string | null;
}): number {
  const date = String(event.endDate).slice(0, 10);
  const time = event.endTime || "23:59";

  const timestamp = Date.parse(`${date}T${time}:00+01:00`);

  if (Number.isNaN(timestamp)) {
    throw new Error("Invalid event ending date or time.");
  }

  return timestamp;
}

// Hide events from public listings 48 hours after they end.
function publicEventVisibilityFilter() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const nigeriaTime = new Date(cutoff.getTime() + 60 * 60 * 1000);

  const cutoffDate = nigeriaTime.toISOString().slice(0, 10);
  const cutoffTime = nigeriaTime.toISOString().slice(11, 16);

  return {
    $or: [
      { endDate: { $gt: cutoffDate } },
      {
        endDate: cutoffDate,
        $or: [
          { endTime: { $gt: cutoffTime } },
          { endTime: null },
          { endTime: "" },
        ],
      },
    ],
  };
}

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) return null;
      await connectDB();
      return await User.findById(context.user.id).populate("savedEvents");
    },

    getOrganizerDashboard: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      await connectDB();

      const events = await Event.find({
        organizer: context.user.id,
      });

      const totalEvents = events.length;

      const totalTicketsSold = events.reduce(
        (sum, event) => sum + event.bookedSeats,
        0,
      );

      const totalRevenue = events.reduce(
        (sum, event) => sum + event.bookedSeats * (event.price || 0),
        0,
      );

      return {
        totalEvents,
        totalTicketsSold,
        totalRevenue,

        liveEvents: events.map((event) => ({
          id: event.id,
          title: event.title,
          status: event.status,
          availableSeats: event.availableSeats,
          totalTickets: event.totalSeats,
        })),
      };
    },

    getEvents: async (
      _: unknown,
      args: {
        search?: string;
        category?: string;
        location?: string;
        date?: string;
        price?: string;
        sort?: string;
        page?: number;
        limit?: number;
      },
    ) => {
      await connectDB();

      const query: any = {
        status: "APPROVED",
        ...publicEventVisibilityFilter(),
      };

      if (args.search) {
        query.title = {
          $regex: args.search,
          $options: "i",
        };
      }

      if (args.category) {
        query.category = args.category;
      }

      if (args.location) {
        query.locationName = {
          $regex: args.location,
          $options: "i",
        };
      }

      if (args.location) {
        query.locationName = {
          $regex: args.location,
          $options: "i",
        };
      }

      const now = new Date();

      if (args.date === "Today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        query.startDate = {
          $gte: start.toISOString(),
          $lte: end.toISOString(),
        };
      }

      if (args.date === "This Week") {
        const start = new Date();

        const end = new Date();
        end.setDate(now.getDate() + 7);

        query.startDate = {
          $gte: start.toISOString(),
          $lte: end.toISOString(),
        };
      }

      if (args.date === "This Weekend") {
        const start = new Date();

        const end = new Date();
        end.setDate(now.getDate() + 2);

        query.startDate = {
          $gte: start.toISOString(),
          $lte: end.toISOString(),
        };
      }

      if (args.date === "Next Month") {
        const start = new Date();

        const end = new Date();
        end.setMonth(now.getMonth() + 1);

        query.startDate = {
          $gte: start.toISOString(),
          $lte: end.toISOString(),
        };
      }

      if (args.price) {
        query.price = {
          $lte: Number(args.price),
        };
      }

      let sortOption: any = { createdAt: -1 };

      if (args.sort === "latest") {
        sortOption = { createdAt: -1 };
      }

      if (args.sort === "oldest") {
        sortOption = { createdAt: 1 };
      }

      if (args.sort === "price-low") {
        sortOption = { price: 1 };
      }

      if (args.sort === "price-high") {
        sortOption = { price: -1 };
      }

      const page = args.page || 1;
      const limit = args.limit || 9;

      const skip = (page - 1) * limit;

      return await Event.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate("organizer");
    },

    getAllEvents: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      return await Event.find().sort({ createdAt: -1 }).populate("organizer");
    },

    getEventBySlug: async (_parent: unknown, args: { slug: string }) => {
      await connectDB();

      return await Event.findOne({
        slug: args.slug,
        status: "APPROVED",
        ...publicEventVisibilityFilter(),
      }).populate("organizer");
    },

    getEventById: async (_parent: unknown, args: { eventId: string }) => {
      await connectDB();

      return await Event.findById(args.eventId).populate("organizer");
    },

    getUserById: async (
      _parent: unknown,
      { userId }: { userId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },

    myOrganizerFollowers: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Authentication required.");
      }

      await connectDB();

      const organizer = await User.findById(context.user.id);

      if (
        !organizer ||
        organizer.role !== "ORGANIZER" ||
        organizer.status !== "ACTIVE"
      ) {
        throw new Error("Organizer access required.");
      }

      return User.find({
        role: "USER",
        status: "ACTIVE",
        followingOrganizers: organizer._id,
      })
        .select("fullName avatar createdAt")
        .sort({ createdAt: -1 });
    },

    getMyFollowedOrganizers: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Please log in to view followed organizers.");
      }

      await connectDB();

      const user = await User.findById(context.user.id).select(
        "followingOrganizers role status",
      );

      if (!user || user.role !== "USER" || user.status !== "ACTIVE") {
        throw new Error("Active user account required.");
      }

      const organizers = await User.find({
        _id: { $in: user.followingOrganizers || [] },
        role: "ORGANIZER",
        status: "ACTIVE",
      }).select(
        "fullName avatar role organizationName organizationLogo organizationDescription organizerBio city state country",
      );

      return organizers;
    },

    getMyBookings: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
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
      context: GraphQLContext,
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const user = await User.findById(context.user.id).populate("savedEvents");
      return user?.savedEvents || [];
    },

    getMyEvents: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      return await Event.find({ organizer: context.user.id }).populate(
        "organizer",
      );
    },

    getPendingEvents: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
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
      context: GraphQLContext,
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const event = await Event.findById(args.eventId);
      if (!event) throw new Error("Event not found");

      const organizerId = String(event.organizer._id ?? event.organizer);

      if (context.user.role !== "ADMIN" && organizerId !== context.user.id) {
        console.error("Attendee access denied:", {
          organizerId,
          loggedInUserId: context.user.id,
          eventId: String(event._id),
        });

        throw new Error("Unauthorized");
      }

      if (context.user.role !== "ADMIN" && organizerId !== context.user.id) {
        throw new Error("Unauthorized");
      }

      return await Booking.find({ event: args.eventId })
        .populate("user")
        .populate("event");
    },

    getAllUsers: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
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
      context: GraphQLContext,
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      return await Booking.find().populate("user").populate("event");
    },

    getUpcomingEvents: async (_parent: unknown, args: { limit?: number }) => {
      await connectDB();

      const now = new Date().toISOString();
      const limit = args.limit ?? 6;

      return await Event.find({
        status: "APPROVED",
        ...publicEventVisibilityFilter(),
        startDate: { $gt: now },
      })
        .sort({ startDate: 1 })
        .limit(limit)
        .populate("organizer");
    },

    getTodayEvents: async (_parent: unknown, args: { limit?: number }) => {
      await connectDB();

      const today = new Date();

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const limit = args.limit ?? 4;

      return await Event.find({
        status: "APPROVED",
        ...publicEventVisibilityFilter(),
        startDate: {
          $gte: startOfDay.toISOString(),
          $lte: endOfDay.toISOString(),
        },
      })
        .sort({ startDate: 1 })
        .limit(limit)
        .populate("organizer");
    },

    getOnlineEvents: async (_parent: unknown, args: { limit?: number }) => {
      await connectDB();

      const limit = args.limit ?? 3;

      return await Event.find({
        status: "APPROVED",
        mode: "ONLINE",
        ...publicEventVisibilityFilter(),
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("organizer");
    },

    devCheckResetEmail: async (_parent: unknown, args: { email: string }) => {
      if (process.env.NODE_ENV !== "development") {
        throw new Error("Development password recovery is unavailable.");
      }

      await connectDB();

      const email = args.email.trim().toLowerCase();

      if (!email) {
        throw new Error("Please enter your email address.");
      }

      const user = await User.findOne({ email });

      return Boolean(user);
    },

    publicOrganizerProfile: async (
      _parent: unknown,
      args: { organizerId: string },
      context: GraphQLContext,
    ) => {
      await connectDB();

      // Never return an inactive user or a non-organizer as a public organizer.
      if (!/^[0-9a-fA-F]{24}$/.test(args.organizerId)) {
        throw new Error("Organizer not found.");
      }

      const organizer = await User.findOne({
        _id: args.organizerId,
        role: "ORGANIZER",
        status: "ACTIVE",
      });

      if (!organizer) {
        throw new Error("Organizer not found.");
      }

      const [followerCount, publishedEvents] = await Promise.all([
        User.countDocuments({
          role: "USER",
          status: "ACTIVE",
          followingOrganizers: organizer._id,
        }),
        Event.find({
          "organizer.id": organizer.id,
          status: {
            $in: ["APPROVED", "UPCOMING", "ONGOING", "COMPLETED", "SOLD_OUT"],
          },
          ...publicEventVisibilityFilter(),
        })
          .sort({ startDate: 1 })
          .select(
            "title slug description image startDate city country mode pricing price currency",
          )
          .lean(),
      ]);

      // Login is optional. Derive the viewer ID from the verified JWT context,
      // never from an ID supplied by the browser.
      const viewer = context.user
        ? await User.findOne({
            _id: context.user.id,
            role: "USER",
            status: "ACTIVE",
          }).select("followingOrganizers")
        : null;

      const isFollowing = Boolean(
        viewer?.followingOrganizers?.some((id) => String(id) === organizer.id),
      );

      return {
        id: organizer.id,
        fullName: organizer.fullName,
        avatar: organizer.avatar ?? null,
        organizationName: organizer.organizationName ?? null,
        organizationLogo: organizer.organizationLogo ?? null,
        organizationDescription: organizer.organizationDescription ?? null,
        organizationWebsite: organizer.organizationWebsite ?? null,
        organizerBio: organizer.organizerBio ?? null,
        city: organizer.city ?? null,
        state: organizer.state ?? null,
        country: organizer.country ?? null,
        createdAt: organizer.createdAt?.toISOString?.() ?? null,
        followerCount,
        isFollowing,
        events: publishedEvents.map((event) => ({
          id: String(event._id),
          slug: event.slug,
          title: event.title,
          description: event.description ?? null,
          image: event.image ?? null,
          startDate: event.startDate
            ? new Date(event.startDate).toISOString()
            : null,
          city: event.city ?? null,
          country: event.country ?? null,
          mode: event.mode,
          pricing: event.pricing,
          price: event.price ?? null,
          currency: event.currency ?? null,
        })),
      };
    },
  },

  Mutation: {
    register: async (_parent: unknown, args: { input: RegisterInput }) => {
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
        { expiresIn: "7d" },
      );

      return { token, user };
    },

    login: async (_parent: unknown, args: { input: LoginInput }) => {
      const { email, password } = args.input;

      await connectDB();

      const user = await User.findOne({ email });
      if (!user) throw new Error("Invalid email or password");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid email or password");

      const token = jwt.sign(
        { id: user._id.toString(), role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      return { token, user };
    },

    devResetPassword: async (
      _parent: unknown,
      args: { email: string; newPassword: string },
    ) => {
      // Never allow this feature in production.
      if (process.env.NODE_ENV !== "development") {
        throw new Error("Password reset is unavailable.");
      }

      // Restrict this temporary feature to the local development server.
      // NODE_ENV alone is not sufficient because a development server
      // can also be exposed over a network.

      await connectDB();

      const { email, newPassword } = args;

      if (newPassword.length < 8) {
        throw new Error("Password must contain at least 8 characters.");
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      });

      if (!user) {
        throw new Error("User does not exist.");
      }

      if (user.status !== "ACTIVE") {
        throw new Error("Account is blocked.");
      }

      user.password = await bcrypt.hash(newPassword, 12);

      await user.save();

      return "Password reset successfully.";
    },

    toggleUserStatus: async (
      _parent: unknown,
      { userId }: { userId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      user.status = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

      await user.save();

      return user;
    },

    updateUser: async (
      _parent: unknown,
      {
        userId,
        input,
      }: {
        userId: string;
        input: {
          fullName?: string;
          email?: string;
          phone?: string;
          avatar?: string;
          role?: "USER" | "ORGANIZER" | "ADMIN";
          status?: "ACTIVE" | "BLOCKED";
        };
      },
      context: GraphQLContext,
    ) => {
      if (!context.user || context.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      await connectDB();

      const user = await User.findByIdAndUpdate(userId, input, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },

    updateMyProfile: async (
      _parent: unknown,
      args: { input: UpdateProfileInput },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Unauthorized. Please login.");
      }

      await connectDB();

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.status !== "ACTIVE") {
        throw new Error("Your account is blocked");
      }

      const { fullName, phone, avatar, country, state, city, address } =
        args.input;

      if (fullName !== undefined) {
        if (!fullName.trim()) {
          throw new Error("Full name cannot be empty");
        }

        user.fullName = fullName.trim();
      }

      if (phone !== undefined) {
        user.phone = phone.trim();
      }

      if (country !== undefined) {
        user.country = country.trim();
      }

      if (state !== undefined) {
        user.state = state.trim();
      }

      if (city !== undefined) {
        user.city = city.trim();
      }

      if (address !== undefined) {
        user.address = address.trim();
      }

      if (avatar !== undefined) {
        user.avatar = avatar.trim();
      }

      await user.save();

      return await User.findById(user._id).populate("savedEvents");
    },

    updateOrganizerProfile: async (
      _parent: unknown,
      args: { input: UpdateOrganizerProfileInput },
      context: GraphQLContext,
    ) => {
      // Only organizers can update their organizer profile
      if (!context.user || context.user.role !== "ORGANIZER") {
        throw new Error("Only organizers can update this profile.");
      }

      await connectDB();

      const user = await User.findById(context.user.id);

      if (!user) {
        throw new Error("Organizer not found.");
      }

      // Verify the current database role and status
      if (user.role !== "ORGANIZER" || user.status !== "ACTIVE") {
        throw new Error("Organizer account is not active.");
      }

      const allowedFields: (keyof UpdateOrganizerProfileInput)[] = [
        "fullName",
        "phone",
        "avatar",
        "country",
        "state",
        "city",
        "address",
        "organizationName",
        "organizationDescription",
        "organizationLogo",
        "organizationWebsite",
        "organizerBio",
      ];

      for (const field of allowedFields) {
        const value = args.input[field];

        if (value !== undefined && value !== null) {
          const trimmed = value.trim();

          if (field === "fullName" && !trimmed) {
            throw new Error("Full name cannot be empty.");
          }

          user.set(field, trimmed);
        }
      }

      await user.save();

      return user;
    },

    followOrganizer: async (
      _parent: unknown,
      args: { organizerId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Please log in to follow organizers.");
      }

      await connectDB();

      const user = await User.findById(context.user.id);

      if (!user || user.role !== "USER" || user.status !== "ACTIVE") {
        throw new Error("Only active users can follow organizers.");
      }

      const organizer = await User.findById(args.organizerId);

      if (
        !organizer ||
        organizer.role !== "ORGANIZER" ||
        organizer.status !== "ACTIVE"
      ) {
        throw new Error("Organizer not found.");
      }

      await User.updateOne(
        { _id: user._id },
        { $addToSet: { followingOrganizers: organizer._id } },
      );

      return true;
    },

    unfollowOrganizer: async (
      _parent: unknown,
      args: { organizerId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Authentication required.");
      }

      await connectDB();

      const user = await User.findById(context.user.id);

      if (!user || user.role !== "USER" || user.status !== "ACTIVE") {
        throw new Error("Only active users can unfollow organizers.");
      }

      await User.updateOne(
        { _id: user._id },
        { $pull: { followingOrganizers: args.organizerId } },
      );

      return true;
    },

    changeMyPassword: async (
      _parent: unknown,
      args: {
        currentPassword: string;
        newPassword: string;
      },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Authentication required.");
      }

      await connectDB();

      const user = await User.findById(context.user.id);

      if (!user || user.status !== "ACTIVE") {
        throw new Error("Account not found or inactive.");
      }

      const isCorrect = await bcrypt.compare(
        args.currentPassword,
        user.password,
      );

      if (!isCorrect) {
        throw new Error("Current password is incorrect.");
      }

      if (args.newPassword.length < 8) {
        throw new Error("New password must contain at least 8 characters.");
      }

      if (await bcrypt.compare(args.newPassword, user.password)) {
        throw new Error(
          "New password must be different from the current password.",
        );
      }

      user.password = await bcrypt.hash(args.newPassword, 12);

      await user.save();

      return "Password updated successfully.";
    },

    createEvent: async (
      _parent: unknown,
      args: { input: CreateEventInput },
      context: GraphQLContext,
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
        currency: "NGN",
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
      context: GraphQLContext,
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

      const { currency: _ignoredCurrency, ...updates } = args.input;

      Object.assign(event, updates);

      event.currency = "NGN";

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
      context: GraphQLContext,
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
      context: GraphQLContext,
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
      context: GraphQLContext,
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
      context: GraphQLContext,
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      const { eventId, quantity } = args.input;

      if (quantity < 1) {
        throw new Error("Quantity must be at least 1");
      }

      await connectDB();

      const event = await Event.findById(eventId);
      if (!event) throw new Error("Event not found");

      if (Date.now() >= getEventEndTime(event)) {
        throw new Error(
          "This event has ended. Tickets are no longer available.",
        );
      }

      if (!["APPROVED", "UPCOMING"].includes(event.status)) {
        throw new Error("This event is not available for booking");
      }

      // 🔥 ATOMIC UPDATE (critical fix)
      const updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          status: { $in: ["APPROVED", "UPCOMING"] },
          availableSeats: { $gte: quantity },
        },
        {
          $inc: {
            bookedSeats: quantity,
            availableSeats: -quantity,
          },
        },
        { new: true },
      );

      if (!updatedEvent) {
        throw new Error("Not enough seats available");
      }

      const totalPrice =
        updatedEvent.pricing === "PAID"
          ? (updatedEvent.price || 0) * quantity
          : 0;

      const booking = await Booking.create({
        user: context.user.id,
        event: eventId,
        quantity,
        totalPrice,

        currency: updatedEvent.currency,

        reservationExpiresAt:
          updatedEvent.pricing === "PAID"
            ? new Date(Date.now() + 15 * 60 * 1000)
            : undefined,

        bookingStatus:
          updatedEvent.pricing === "FREE" ? "CONFIRMED" : "PENDING",

        paymentStatus: updatedEvent.pricing === "FREE" ? "PAID" : "UNPAID",
      });

      // 🔥 Handle sold out after update
      if (updatedEvent.availableSeats === 0) {
        updatedEvent.status = "SOLD_OUT";
        await updatedEvent.save();
      }

      // 🔥 Ticket only for free events
      if (updatedEvent.pricing === "FREE") {
        for (let index = 1; index <= quantity; index++) {
          await Ticket.updateOne(
            {
              ticketCode: `CNCG-${booking._id}-${index}`,
            },
            {
              $setOnInsert: {
                booking: booking._id,
                ticketCode: `CNCG-${booking._id}-${index}`,
              },
            },
            { upsert: true },
          );
        }
      }

      return await Booking.findById(booking._id)
        .populate("user")
        .populate("event");
    },

    initializePaystackPayment: async (
      _parent: unknown,
      args: { bookingId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || context.user.role !== "USER") {
        throw new Error("Please log in as a user.");
      }

      if (!process.env.PAYSTACK_SECRET_KEY) {
        throw new Error("Paystack is not configured.");
      }

      await connectDB();

      const booking = await Booking.findById(args.bookingId);

      if (!booking) {
        throw new Error("Booking not found.");
      }

      if (booking.user.toString() !== context.user.id) {
        throw new Error("Unauthorized booking.");
      }

      if (
        booking.bookingStatus !== "PENDING" ||
        booking.paymentStatus !== "UNPAID"
      ) {
        throw new Error("This booking cannot be paid.");
      }

      if (
        !booking.reservationExpiresAt ||
        booking.reservationExpiresAt.getTime() <= Date.now()
      ) {
        throw new Error("Your reservation has expired.");
      }

      if (booking.paymentReference) {
        throw new Error("Payment has already been initialized.");
      }

      if (booking.currency !== "NGN") {
        throw new Error("Only NGN payments are enabled for now.");
      }

      const amount = Math.round(booking.totalPrice * 100);

      if (!Number.isSafeInteger(amount) || amount <= 0) {
        throw new Error("Invalid payment amount.");
      }

      const user = await User.findById(context.user.id);

      if (!user || user.status !== "ACTIVE") {
        throw new Error("Active customer account required.");
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      if (!appUrl) {
        throw new Error("Application URL is not configured.");
      }

      const reference = `CNCG-${randomUUID()}`;

      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            amount: String(amount),
            currency: "NGN",
            reference,
            callback_url: `${appUrl.replace(/\/$/, "")}/checkout/payment-success`,
            metadata: {
              bookingId: booking.id,
              userId: user.id,
            },
          }),
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.status ||
        !result.data?.authorization_url ||
        result.data?.reference !== reference
      ) {
        throw new Error(result.message || "Unable to initialize payment.");
      }

      booking.paymentReference = reference;

      await booking.save();

      return {
        authorizationUrl: result.data.authorization_url,
        reference,
      };
    },

   verifyPayment: async (
  _parent: unknown,
  args: { reference: string },
  context: GraphQLContext,
) => {
  if (!context.user || context.user.role !== "USER") {
    throw new Error("Please log in to verify your payment.");
  }

  const reference = args.reference.trim();

  if (!/^CNCG-[a-zA-Z0-9-]+$/.test(reference)) {
    throw new Error("Invalid payment reference.");
  }

  await connectDB();

  const booking = await Booking.findOne({
    paymentReference: reference,
    user: context.user.id,
  });

  if (!booking) {
    throw new Error("Booking not found for this customer.");
  }

  await confirmPaystackBooking(reference);

  return await Booking.findById(booking._id)
    .populate("user")
    .populate("event");
},

    cancelBooking: async (
      _parent: unknown,
      args: { bookingId: string },
      context: GraphQLContext,
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
      context: GraphQLContext,
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const user = await User.findById(context.user.id);
      if (!user) throw new Error("User not found");

      const alreadySaved = user.savedEvents.some(
        (id) => id.toString() === args.eventId,
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
      context: GraphQLContext,
    ) => {
      if (!context.user) throw new Error("Unauthorized");

      await connectDB();

      const user = await User.findById(context.user.id);
      if (!user) throw new Error("User not found");

      user.savedEvents = user.savedEvents.filter(
        (id) => id.toString() !== args.eventId,
      ) as typeof user.savedEvents;

      await user.save();

      return await User.findById(user._id).populate("savedEvents");
    },

    checkInTicket: async (
      _parent: unknown,
      args: { ticketCode: string },
      context: GraphQLContext,
    ) => {
      if (
        !context.user ||
        !["ORGANIZER", "ADMIN"].includes(context.user.role)
      ) {
        throw new Error("Only organizers or admins can check in tickets.");
      }

      await connectDB();

      const ticketCode = args.ticketCode.trim();

      if (!ticketCode) {
        throw new Error("Ticket code is required.");
      }

      const ticket = await Ticket.findOne({ ticketCode });

      if (!ticket) {
        throw new Error("Invalid ticket. Ticket not found.");
      }

      const booking = await Booking.findById(ticket.booking);

      if (!booking) {
        throw new Error("Ticket booking not found.");
      }

      if (
        booking.bookingStatus !== "CONFIRMED" ||
        booking.paymentStatus !== "PAID"
      ) {
        throw new Error("This ticket does not have a valid confirmed booking.");
      }

      const event = await Event.findById(booking.event);

      if (!event) {
        throw new Error("Ticket event not found.");
      }

      if (
        context.user.role === "ORGANIZER" &&
        event.organizer.toString() !== context.user.id
      ) {
        throw new Error("You cannot check in tickets for another organizer.");
      }

      if (ticket.checkedInAt) {
        throw new Error("Ticket Already Used.");
      }

      // Atomic update prevents the same ticket from being checked in twice.
      const updatedTicket = await Ticket.findOneAndUpdate(
        {
          _id: ticket._id,
          checkedInAt: null,
        },
        {
          $set: {
            checkedInAt: new Date(),
            checkedInBy: context.user.id,
          },
        },
        { new: true },
      );

      if (!updatedTicket) {
        throw new Error("Ticket Already Used.");
      }

      return updatedTicket;
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

    tickets: async (
      parent: { _id: string },
      _args: unknown,
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Authentication required.");
      }

      await connectDB();

      const booking = await Booking.findById(parent._id);

      if (!booking) {
        throw new Error("Booking not found.");
      }

      const isOwner = booking.user.toString() === context.user.id;

      const isAdmin = context.user.role === "ADMIN";

      // Check whether the logged-in organizer owns this event.
      let isEventOrganizer = false;

      if (context.user.role === "ORGANIZER") {
        const event = await Event.findById(booking.event);

        if (event) {
          isEventOrganizer =
            String(event.organizer._id ?? event.organizer) === context.user.id;
        }
      }

      // Only the customer, event organizer, or admin can view tickets.
      if (!isOwner && !isAdmin && !isEventOrganizer) {
        throw new Error("Unauthorized.");
      }

      if (
        booking.bookingStatus !== "CONFIRMED" ||
        (booking.paymentStatus !== "PAID" && booking.totalPrice !== 0)
      ) {
        return [];
      }

      return Ticket.find({ booking: booking._id }).sort({ issuedAt: 1 });
    },
  },
};
