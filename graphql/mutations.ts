export const CREATE_EVENT_MUTATION = `
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      slug
      status
      totalSeats
      availableSeats
      organizer {
        id
        fullName
        email
      }
    }
  }
`;

export const DELETE_EVENT_MUTATION = `
  mutation DeleteEvent($eventId: ID!) {
    deleteEvent(eventId: $eventId)
  }
`;

export const UPDATE_EVENT_MUTATION = `
  mutation UpdateEvent($eventId: ID!, $input: UpdateEventInput!) {
    updateEvent(eventId: $eventId, input: $input) {
      id
      title
      status
      totalSeats
      availableSeats
      price
      category
      startDate
      endDate
      startTime
      endTime
      locationName
      address
      city
      state
      country
      onlineLink
      image
      mode
      pricing
      currency
    }
  }
`;