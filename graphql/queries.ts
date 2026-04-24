export const GET_MY_EVENTS_QUERY = `
  query GetMyEvents {
    getMyEvents {
      id
      title
      slug
      category
      startDate
      endDate
      startTime
      status
      totalSeats
      availableSeats
      bookedSeats
      price
      image
      locationName
    }
  }
`;

export const GET_EVENT_BY_SLUG_QUERY = `
  query GetEventBySlug($slug: String!) {
    getEventBySlug(slug: $slug) {
      id
      title
      slug
      description
      category
      image
      mode
      pricing
      price
      currency
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
      totalSeats
      bookedSeats
      availableSeats
      status
      organizer {
        id
        fullName
        email
      }
    }
  }
`;