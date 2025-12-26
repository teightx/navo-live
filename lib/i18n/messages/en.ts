import type { Messages } from "./pt";

export const en: Messages = {
  // Meta
  meta: {
    title: "navo — track flight prices",
    description: "prices change. we keep track.",
  },

  // Header
  header: {
    alerts: "alerts",
    howItWorks: "how it works",
  },

  // Home
  home: {
    headline: "where do you want to go?",
    subheadline: "prices change. we keep track.",
  },

  // Search
  search: {
    tripType: {
      roundtrip: "round trip",
      oneway: "one way",
    },
    from: "from",
    to: "to",
    origin: "origin",
    destination: "destination",
    departDate: "depart",
    returnDate: "return",
    addDate: "add date",
    travelers: "travelers",
    adult: "adult",
    adults: "adults",
    children: "children",
    infants: "infants",
    cabin: {
      economy: "economy",
      premium: "premium economy",
      business: "business",
      first: "first class",
    },
    apply: "apply",
    search: "search",
    swap: "swap origin and destination",
  },

  // Results
  results: {
    direct: "direct",
    stop: "stop",
    stops: "stops",
    from: "from",
    seeDetails: "see details",
    edit: "edit",
    flightsTo: "flights to",
    searching: "searching for best offers...",
    noResults: "no results",
    optionsFound: "options found",
    offer: "offer",
    offers: "offers",
    viewOffers: "view offers",
    dontWantToCheck: "don't want to check every day?",
    createAlert: "create price alert",
    noFlightsFound: "no flights found",
    tryAdjusting: "try adjusting dates or choosing other airports to find more options",
  },

  // Flight Details
  flightDetails: {
    departure: "departure",
    arrival: "arrival",
    compareIn: "compare on",
    sites: "sites",
    lowestPrice: "lowest price",
    pricesDisclaimer: "prices subject to change · verify on partner site",
    back: "back",
    notFound: "flight not found",
    backToHome: "back to home",
  },

  // Footer
  footer: {
    disclaimer: "Estimated prices. We redirect to partners.",
    terms: "terms",
    privacy: "privacy",
    contact: "contact",
  },

  // Theme
  theme: {
    light: "light",
    dark: "dark",
    system: "system",
  },

  // Pages
  pages: {
    alerts: {
      title: "price alerts",
      description: "get notified when your trip price drops.",
      comingSoon: "coming soon",
    },
    howItWorks: {
      title: "how it works",
      description: "understand how navo finds the best prices.",
    },
    terms: {
      title: "terms of service",
    },
    privacy: {
      title: "privacy policy",
    },
  },
} as const;

