export interface Messages {
  meta: {
    title: string;
    description: string;
  };
  header: {
    alerts: string;
    howItWorks: string;
  };
  home: {
    headline: string;
    subheadline: string;
  };
  search: {
    tripType: {
      roundtrip: string;
      oneway: string;
    };
    from: string;
    to: string;
    origin: string;
    destination: string;
    departDate: string;
    returnDate: string;
    addDate: string;
    travelers: string;
    adult: string;
    adults: string;
    children: string;
    infants: string;
    cabin: {
      economy: string;
      premium: string;
      business: string;
      first: string;
    };
    apply: string;
    search: string;
    swap: string;
  };
  results: {
    direct: string;
    stop: string;
    stops: string;
    from: string;
    seeDetails: string;
    edit: string;
    flightsTo: string;
    searching: string;
    noResults: string;
    optionsFound: string;
    offer: string;
    offers: string;
    viewOffers: string;
    createAlert: string;
    noFlightsFound: string;
    tryAdjusting: string;
    editSearch: string;
    errorTitle: string;
    errorMessage: string;
    tryAgain: string;
    backToHome: string;
    bestOffer: string;
    bestOfferExplanation: string;
    cheaperThanAverage: string;
    belowAverage: string;
    lowestRecentPrice: string;
    saveSearch: string;
    searchSaved: string;
    removeSearch: string;
    saving: string;
    // Rate limit error
    rateLimitTitle: string;
    rateLimitMessage: string;
    rateLimitRetry: string;
    requestCode: string;
  };
  flightDetails: {
    departure: string;
    arrival: string;
    stops: string;
    stopsPlural: string;
    direct: string;
    from: string;
    compareOnSites: string;
    lowestPrice: string;
    pricesSubjectToChange: string;
    back: string;
    flightNotFound: string;
    contextMissingTitle: string;
    contextMissingMessage: string;
    backToResults: string;
    newSearch: string;
    whereToBook: string;
    officialSite: string;
    goToSite: string;
    comingSoon: string;
    goToAirline: string;
    partnersComingSoon: string;
    partnersDisclaimer: string;
    flightPriceLabel: string;
    errorTitle: string;
    errorMessage: string;
    tryAgain: string;
    flightExpired: string;
  };
  footer: {
    disclaimer: string;
    terms: string;
    privacy: string;
    contact: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  pages: {
    alerts: {
      title: string;
      description: string;
      comingSoon: string;
    };
    howItWorks: {
      title: string;
      description: string;
    };
    terms: {
      title: string;
    };
    privacy: {
      title: string;
    };
  };
  error: {
    title: string;
    message: string;
    supportCode: string;
    noCode: string;
    goHome: string;
    newSearch: string;
    globalTitle: string;
    globalMessage: string;
  };
}

export const pt: Messages = {
  meta: {
    title: "navo — acompanhe preços de passagens",
    description: "preços mudam. a gente acompanha.",
  },
  header: {
    alerts: "alertas",
    howItWorks: "como funciona",
  },
  home: {
    headline: "para onde você quer ir?",
    subheadline: "preços mudam. a gente acompanha.",
  },
  search: {
    tripType: {
      roundtrip: "ida e volta",
      oneway: "só ida",
    },
    from: "de",
    to: "para",
    origin: "origem",
    destination: "destino",
    departDate: "ida",
    returnDate: "volta",
    addDate: "data de partida",
    travelers: "passageiros",
    adult: "adulto",
    adults: "adultos",
    children: "crianças",
    infants: "bebês",
    cabin: {
      economy: "econômica",
      premium: "premium economy",
      business: "executiva",
      first: "primeira classe",
    },
    apply: "aplicar",
    search: "buscar",
    swap: "inverter origem e destino",
  },
  results: {
    direct: "direto",
    stop: "parada",
    stops: "paradas",
    from: "a partir de",
    seeDetails: "ver detalhes",
    edit: "editar",
    flightsTo: "voos para",
    searching: "buscando melhores ofertas...",
    noResults: "nenhum resultado",
    optionsFound: "opções encontradas",
    offer: "oferta",
    offers: "ofertas",
    viewOffers: "ver ofertas",
    createAlert: "criar alerta de preço",
    noFlightsFound: "nenhum voo encontrado",
    tryAdjusting: "tente ajustar as datas ou escolher outros aeroportos para encontrar mais opções",
    editSearch: "editar busca",
    errorTitle: "erro ao buscar voos",
    errorMessage: "não foi possível carregar os resultados. verifique sua conexão e tente novamente.",
    tryAgain: "tentar novamente",
    backToHome: "voltar para home",
    bestOffer: "melhor oferta",
    bestOfferExplanation: "menor preço considerando duração",
    cheaperThanAverage: "R$ {amount} mais barato que a média",
    belowAverage: "R$ {amount} abaixo da média",
    lowestRecentPrice: "menor preço recente",
    saveSearch: "salvar busca",
    searchSaved: "busca salva",
    removeSearch: "remover busca",
    saving: "salvando...",
    // Rate limit error
    rateLimitTitle: "muitas buscas",
    rateLimitMessage: "você fez muitas buscas em pouco tempo. aguarde alguns segundos e tente novamente.",
    rateLimitRetry: "tentar novamente em {seconds}s",
    requestCode: "código: {code}",
  },
  flightDetails: {
    departure: "partida",
    arrival: "chegada",
    stops: "parada",
    stopsPlural: "paradas",
    direct: "direto",
    from: "a partir de",
    compareOnSites: "comparar em {count} sites",
    lowestPrice: "menor preço",
    pricesSubjectToChange: "preços sujeitos a alteração · verifique no site do parceiro",
    back: "voltar",
    flightNotFound: "voo não encontrado",
    contextMissingTitle: "contexto da busca não encontrado",
    contextMissingMessage: "não conseguimos recuperar os detalhes deste voo. por favor, volte para os resultados ou faça uma nova busca.",
    backToResults: "voltar para resultados",
    newSearch: "nova busca",
    whereToBook: "onde comprar",
    officialSite: "site oficial",
    goToSite: "ir para site",
    comingSoon: "em breve",
    goToAirline: "ir para site",
    partnersComingSoon: "comparação de preços em parceiros será adicionada em breve.",
    partnersDisclaimer: "redirecionamos para parceiros. preços podem variar.",
    flightPriceLabel: "preço deste voo",
    errorTitle: "erro ao carregar",
    errorMessage: "não foi possível carregar os detalhes do voo.",
    tryAgain: "tentar novamente",
    flightExpired: "a oferta pode ter expirado. faça uma nova busca.",
  },
  footer: {
    disclaimer: "Preços estimados. Redirecionamos para parceiros.",
    terms: "termos",
    privacy: "privacidade",
    contact: "contato",
  },
  theme: {
    light: "claro",
    dark: "escuro",
    system: "sistema",
  },
  pages: {
    alerts: {
      title: "alertas de preço",
      description: "receba notificações quando o preço da sua viagem cair.",
      comingSoon: "em breve",
    },
    howItWorks: {
      title: "como funciona",
      description: "entenda como o navo encontra os melhores preços.",
    },
    terms: {
      title: "termos de uso",
    },
    privacy: {
      title: "política de privacidade",
    },
  },
  error: {
    title: "algo deu errado",
    message: "ocorreu um erro inesperado. por favor, tente novamente.",
    supportCode: "código de suporte: {code}",
    noCode: "erro sem código",
    goHome: "voltar para home",
    newSearch: "nova busca",
    globalTitle: "ops, algo deu errado",
    globalMessage: "houve um problema ao carregar a página. tente novamente.",
  },
};
