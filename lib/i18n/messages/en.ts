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
    subheadline: "compare flight prices and find the best time to buy",
    valueProp1: "compare prices across sites and airlines",
    valueProp2: "find the best balance between time and price",
    valueProp3: "track price changes",
    trustRedirect: "we redirect to partners",
    trustBuy: "you buy on official sites or OTAs",
    trustNoFees: "no fees",
    lowestPriceFound: "lowest price found",
    filterDuration3: "3 days",
    filterDuration5: "5 days",
    filterDuration7: "7+ days",
    filterBeach: "beach",
    filterCity: "city",
    filterNature: "nature",
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
    // Decision labels (selos)
    labelBestBalance: "best balance",
    labelCheapest: "cheapest",
    labelFastest: "fastest",
    // Price context
    priceContextBelowAverage: "below average",
    priceContextBelowAverageDetail: "last 30 days",
    priceContextAverage: "average price",
    priceContextAboveAverage: "pricey now",
    // Flight context lines
    contextGoodDuration: "good duration for the price",
    contextDirect: "direct flight",
    contextShortLayover: "short layover",
    contextBestPrice: "lowest price on this route",
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
    editSearch: "edit search",
    // Price comparison
    priceDiffCheaper: "R$ {amount} cheaper",
    priceDiffSame: "same price",
    priceDiffMore: "R$ {amount} more",
    // Official site benefits
    officialBenefit1: "better after-sales support",
    officialBenefit2: "no middlemen",
    // Flight info
    flightInfo: "flight info",
    baggageIncluded: "carry-on included",
    baggageNotIncluded: "checked baggage not included",
    changePolicy: "changes allowed with fee",
    refundPolicy: "partial refund available",
    layoverInfo: "layover",
    layoverDuration: "{duration} in {city}",
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

  // Error Boundary
  error: {
    title: "something went wrong",
    message: "an unexpected error occurred. please try again.",
    supportCode: "support code: {code}",
    noCode: "error without code",
    goHome: "back to home",
    newSearch: "new search",
    globalTitle: "oops, something went wrong",
    globalMessage: "there was a problem loading the page. please try again.",
  },
  
  // FAQ
  faq: {
    title: "frequently asked questions",
    subtitle: "everything you need to know before booking",
    questions: {
      howFindPrices: {
        q: "how does navo find flight prices?",
        a: "we search real-time prices from airlines and partner travel agencies, comparing the best deals for you.",
      },
      doBuyHere: {
        q: "do I buy the ticket through navo?",
        a: "no. navo is a comparison site. you choose the best offer and we redirect you to the partner site to complete your purchase.",
      },
      anyFees: {
        q: "does navo charge any fees?",
        a: "we don't charge any fees. the price you see is the price you pay on the partner site.",
      },
      priceChange: {
        q: "can the price change later?",
        a: "yes. flight prices are dynamic and may vary. always confirm the final price on the partner site before booking.",
      },
      whatIsBestBalance: {
        q: "what is 'best balance'?",
        a: "it's the flight that offers the best value between price and duration. the cheapest isn't always the best when you consider travel time.",
      },
      whatIsPriceAlert: {
        q: "what is a price alert?",
        a: "it's a notification you receive when the price of a route you're monitoring drops. so you don't miss any deals.",
      },
      trustPartners: {
        q: "can I trust the sites I'm redirected to?",
        a: "we only work with official airlines and well-known travel agencies in the market.",
      },
      sellHotels: {
        q: "does navo sell hotels or cars?",
        a: "for now, we focus only on flights. we want to do this really well before expanding.",
      },
      priceUpdateFrequency: {
        q: "how often are prices updated?",
        a: "we search prices in real-time with each search. the data you see is always current.",
      },
    },
  },
} as const;

