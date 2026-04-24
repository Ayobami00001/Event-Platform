export const typeDefs = `#graphql

  enum UserRole {
    USER
    ORGANIZER
    ADMIN
  }

  enum EventMode {
    ONLINE
    PHYSICAL
  }

  enum EventPricing {
    FREE
    PAID
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
    savedEvents: [Event!]
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
    currency: String
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
  }

  type Ticket {
    id: ID!
    booking: Booking!
    ticketCode: String!
    qrCode: String
    issuedAt: String!
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
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
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
    currency: String
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
    currency: String
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

  type Query {
    me: User
    getEvents: [Event!]!
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

    createEvent(input: CreateEventInput!): Event!
    updateEvent(eventId: ID!, input: UpdateEventInput!): Event!
    deleteEvent(eventId: ID!): String!

    approveEvent(eventId: ID!): Event!
    rejectEvent(eventId: ID!): Event!

    createBooking(input: CreateBookingInput!): Booking!
    cancelBooking(bookingId: ID!): Booking!

    saveEvent(eventId: ID!): User!
    unsaveEvent(eventId: ID!): User!
  }

`;