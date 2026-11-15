export const typeDefs = `#graphql

  enum UserRole {
    USER
    ORGANIZER
    ADMIN
  }

  enum UserStatus {
  ACTIVE
  BLOCKED
}

  enum EventMode {
    ONLINE
    PHYSICAL
  }

  enum EventPricing {
    FREE
    PAID
  }

 enum Currency {
  NGN
  USD
  EUR
}

  enum EventStatus {
    DRAFT
    PENDING
    APPROVED
    REJECTED
    UPCOMING
    ONGOING
    COMPLETED
    CANCELLED
    SOLD_OUT
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
  }

  enum PaymentStatus {
    UNPAID
    PAID
    FAILED
    REFUNDED
  }

 

type User {
  id: ID!
  fullName: String!
  email: String!
  role: UserRole!
  avatar: String
  phone: String
  country: String
  state: String
  city: String
  address: String
  organizationName: String
  organizationDescription: String
  organizationLogo: String
  organizationWebsite: String
  organizerBio: String
  status: UserStatus!
  createdAt: String!
  updatedAt: String!
  savedEvents: [Event!]
}

input UpdateOrganizerProfileInput {
  fullName: String
  phone: String
  avatar: String

  country: String
  state: String
  city: String
  address: String

  organizationName: String
  organizationDescription: String
  organizationLogo: String
  organizationWebsite: String
  organizerBio: String
}

  type Event {
  id: ID!
  title: String!
  slug: String!
  description: String!
  category: String!
  image: String
  mode: EventMode!
  pricing: EventPricing!
  price: Float
  currency: Currency
  startDate: String!
  endDate: String!
  startTime: String
  endTime: String
  locationName: String
  address: String
  city: String
  state: String
  country: String
  latitude: Float
  longitude: Float
  onlineLink: String
  totalSeats: Int!
  bookedSeats: Int!
  availableSeats: Int!
  status: EventStatus!
  isFeatured: Boolean
  organizer: User!

  createdAt: String!
  updatedAt: String!
}

  type Ticket {
    id: ID!
    booking: Booking!
    ticketCode: String!
    qrCode: String
    issuedAt: String!
    checkedInAt: String
  }

  type Booking {
    id: ID!
    user: User!
    event: Event!
    quantity: Int!
    totalPrice: Float!
    bookingStatus: BookingStatus!
    paymentStatus: PaymentStatus!
    paymentReference: String
    ticket: Ticket
    tickets: [Ticket!]!

    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type OrganizerDashboard {
  totalEvents: Int!
  totalTicketsSold: Int!
  totalRevenue: Float!

  liveEvents: [OrganizerLiveEvent!]!
}

type OrganizerLiveEvent {
  id: ID!
  title: String!
  status: String!
  availableSeats: Int!
  totalTickets: Int!
}

  input RegisterInput {
    fullName: String!
    email: String!
    password: String!
    role: UserRole
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateEventInput {
    title: String!
    description: String!
    category: String!
    image: String
    mode: EventMode!
    pricing: EventPricing!
    price: Float
    currency: Currency
    startDate: String!
    endDate: String!
    startTime: String
    endTime: String
    locationName: String
    address: String
    city: String
    state: String
    country: String
    latitude: Float
    longitude: Float
    onlineLink: String
    totalSeats: Int!
  }

  input UpdateEventInput {
    title: String
    description: String
    category: String
    image: String
    mode: EventMode
    pricing: EventPricing
    price: Float
    currency: Currency
    startDate: String
    endDate: String
    startTime: String
    endTime: String
    locationName: String
    address: String
    city: String
    state: String
    country: String
    latitude: Float
    longitude: Float
    onlineLink: String
    totalSeats: Int
    status: EventStatus
  }

  input CreateBookingInput {
    eventId: ID!
    quantity: Int!
  }
    
  input UpdateUserInput {
  fullName: String
  email: String
  phone: String
  avatar: String
  role: UserRole
  status: UserStatus
}

input UpdateProfileInput {
  fullName: String
  phone: String
  avatar: String
  country: String
  state: String
  city: String
  address: String
}

  type PublicOrganizerEvent {
  id: ID!
  slug: String!
  title: String!
  description: String
  image: String
  startDate: String
  city: String
  country: String
  mode: EventMode!
  pricing: EventPricing!
  price: Float
  currency: Currency
}

type PublicOrganizerProfile {
  id: ID!
  fullName: String!
  avatar: String
  organizationName: String
  organizationLogo: String
  organizationDescription: String
  organizationWebsite: String
  organizerBio: String
  city: String
  state: String
  country: String
  createdAt: String
  followerCount: Int!
  isFollowing: Boolean!
  events: [PublicOrganizerEvent!]!
}

type PaystackCheckout {
  authorizationUrl: String!
  reference: String!
}

  type Query {
    me: User
    getOrganizerDashboard: OrganizerDashboard!

    getEventById(eventId: ID!): Event
    
    getAllEvents: [Event!]!

    getUserById(userId: ID!): User!

    devCheckResetEmail(email: String!): Boolean!

    myOrganizerFollowers: [User!]!

    getMyFollowedOrganizers: [User!]!

    publicOrganizerProfile(organizerId: ID!): PublicOrganizerProfile!

    getEvents(
  search: String
  category: String
  location: String
  date: String
  price: String
  sort: String
  page: Int
  limit: Int
): [Event!]!
    getUpcomingEvents(limit: Int): [Event!]!
    getTodayEvents(limit: Int): [Event!]!
    getOnlineEvents(limit: Int): [Event!]!
    getEventBySlug(slug: String!): Event
    getMyBookings: [Booking!]!
    getMySavedEvents: [Event!]!
    getMyEvents: [Event!]!
    getPendingEvents: [Event!]!
    getEventAttendees(eventId: ID!): [Booking!]!
    getAllUsers: [User!]!
    getAllBookings: [Booking!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    devResetPassword(email: String!, newPassword: String!): String!

    toggleUserStatus(userId: ID!): User!
    updateUser(userId: ID!, input: UpdateUserInput!): User!
    updateMyProfile(input: UpdateProfileInput!): User!
    updateOrganizerProfile(input: UpdateOrganizerProfileInput!): User!

    followOrganizer(organizerId: ID!): Boolean!
unfollowOrganizer(organizerId: ID!): Boolean!

changeMyPassword(
  currentPassword: String!
  newPassword: String!
): String!

    createEvent(input: CreateEventInput!): Event!
    updateEvent(eventId: ID!, input: UpdateEventInput!): Event!
    deleteEvent(eventId: ID!): String!

    approveEvent(eventId: ID!): Event!
    rejectEvent(eventId: ID!): Event!

    createBooking(input: CreateBookingInput!): Booking!
    cancelBooking(bookingId: ID!): Booking!

    verifyPayment(reference: String!): Booking!
    initializePaystackPayment(bookingId: ID!): PaystackCheckout!

    saveEvent(eventId: ID!): User!
    unsaveEvent(eventId: ID!): User!

    checkInTicket(ticketCode: String!): Ticket!

  }

`;
