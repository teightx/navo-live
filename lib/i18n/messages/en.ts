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
    addDate: "departure date",
    travelers: "passengers",
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
    createAlert: "create price alert",
    noFlightsFound: "no flights found",
    tryAdjusting: "try adjusting dates or choosing other airports to find more options",
    editSearch: "edit search",
    errorTitle: "error searching flights",
    errorMessage: "could not load results. check your connection and try again.",
    tryAgain: "try again",
    backToHome: "back to home",
    bestOffer: "best offer",
    bestOfferExplanation: "lowest price considering duration",
    cheaperThanAverage: "R$ {amount} cheaper than average",
    belowAverage: "R$ {amount} below average",
    lowestRecentPrice: "lowest recent price",
    saveSearch: "save search",
    searchSaved: "search saved",
    removeSearch: "remove search",
    saving: "saving...",
    // Rate limit error
    rateLimitTitle: "too many searches",
    rateLimitMessage: "you've made too many searches in a short time. please wait a few seconds and try again.",
    rateLimitRetry: "try again in {seconds}s",
    requestCode: "code: {code}",
  },

  // Flight Details
  flightDetails: {
    departure: "departure",
    arrival: "arrival",
    stops: "stop",
    stopsPlural: "stops",
    direct: "direct",
    from: "from",
    compareOnSites: "compare on {count} sites",
    lowestPrice: "lowest price",
    pricesSubjectToChange: "prices subject to change · check on partner website",
    back: "back",
    flightNotFound: "flight not found",
    contextMissingTitle: "search context not found",
    contextMissingMessage: "we couldn't retrieve the details for this flight. please go back to results or start a new search.",
    backToResults: "back to results",
    newSearch: "new search",
    whereToBook: "where to book",
    officialSite: "official site",
    goToSite: "go to site",
    comingSoon: "coming soon",
    goToAirline: "go to site",
    partnersComingSoon: "partner price comparison coming soon.",
    partnersDisclaimer: "we redirect to partners. prices may vary.",
    flightPriceLabel: "this flight's price",
    errorTitle: "error loading",
    errorMessage: "could not load flight details.",
    tryAgain: "try again",
    flightExpired: "the offer may have expired. please start a new search.",
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

