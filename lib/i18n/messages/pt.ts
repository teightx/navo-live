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
    valueProp1: string;
    valueProp2: string;
    valueProp3: string;
    trustRedirect: string;
    trustBuy: string;
    trustNoFees: string;
    lowestPriceFound: string;
    filterDuration3: string;
    filterDuration5: string;
    filterDuration7: string;
    filterBeach: string;
    filterCity: string;
    filterNature: string;
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
    // Decision labels (selos)
    labelBestBalance: string;
    labelCheapest: string;
    labelFastest: string;
    // Price context
    priceContextBelowAverage: string;
    priceContextBelowAverageDetail: string;
    priceContextAverage: string;
    priceContextAboveAverage: string;
    // Flight context lines
    contextGoodDuration: string;
    contextDirect: string;
    contextShortLayover: string;
    contextBestPrice: string;
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
    editSearch: string;
    // Comparação de preços
    priceDiffCheaper: string;
    priceDiffSame: string;
    priceDiffMore: string;
    // Explicação site oficial
    officialBenefit1: string;
    officialBenefit2: string;
    // Informações úteis
    flightInfo: string;
    baggageIncluded: string;
    baggageNotIncluded: string;
    changePolicy: string;
    refundPolicy: string;
    layoverInfo: string;
    layoverDuration: string;
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
  faq: {
    title: string;
    subtitle: string;
    questions: {
      howFindPrices: { q: string; a: string };
      doBuyHere: { q: string; a: string };
      anyFees: { q: string; a: string };
      priceChange: { q: string; a: string };
      whatIsBestBalance: { q: string; a: string };
      whatIsPriceAlert: { q: string; a: string };
      trustPartners: { q: string; a: string };
      sellHotels: { q: string; a: string };
      priceUpdateFrequency: { q: string; a: string };
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
    subheadline: "compare passagens aéreas e encontre o melhor momento para comprar",
    valueProp1: "compare preços entre sites e companhias",
    valueProp2: "encontre o melhor equilíbrio entre tempo e preço",
    valueProp3: "acompanhe variações de preço",
    trustRedirect: "redirecionamos para parceiros",
    trustBuy: "você compra no site oficial ou OTA",
    trustNoFees: "sem taxas",
    lowestPriceFound: "menor preço encontrado",
    filterDuration3: "3 dias",
    filterDuration5: "5 dias",
    filterDuration7: "7+ dias",
    filterBeach: "praia",
    filterCity: "cidade",
    filterNature: "natureza",
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
    // Decision labels (selos)
    labelBestBalance: "melhor equilíbrio",
    labelCheapest: "mais barato",
    labelFastest: "mais rápido",
    // Price context
    priceContextBelowAverage: "abaixo do normal",
    priceContextBelowAverageDetail: "últimos 30 dias",
    priceContextAverage: "na média",
    priceContextAboveAverage: "caro agora",
    // Flight context lines
    contextGoodDuration: "boa duração para o preço",
    contextDirect: "voo direto",
    contextShortLayover: "escala curta",
    contextBestPrice: "menor preço desta rota",
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
    editSearch: "editar busca",
    // Comparação de preços
    priceDiffCheaper: "R$ {amount} mais barato",
    priceDiffSame: "mesmo preço",
    priceDiffMore: "R$ {amount} a mais",
    // Explicação site oficial
    officialBenefit1: "melhor suporte pós-venda",
    officialBenefit2: "sem intermediários",
    // Informações úteis
    flightInfo: "informações do voo",
    baggageIncluded: "bagagem de mão incluída",
    baggageNotIncluded: "bagagem despachada não incluída",
    changePolicy: "alteração permitida com taxa",
    refundPolicy: "reembolso parcial disponível",
    layoverInfo: "escala",
    layoverDuration: "{duration} em {city}",
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
  faq: {
    title: "perguntas frequentes",
    subtitle: "tudo o que você precisa saber antes de comprar",
    questions: {
      howFindPrices: {
        q: "como o navo encontra os preços das passagens?",
        a: "buscamos preços em tempo real de companhias aéreas e agências de viagem parceiras, comparando as melhores ofertas para você.",
      },
      doBuyHere: {
        q: "eu compro a passagem pelo navo?",
        a: "não. o navo é um comparador. você escolhe a melhor oferta e te redirecionamos para o site do parceiro para finalizar a compra.",
      },
      anyFees: {
        q: "o navo cobra alguma taxa?",
        a: "não cobramos nenhuma taxa. o preço que você vê é o preço que você paga no site do parceiro.",
      },
      priceChange: {
        q: "o preço pode mudar depois?",
        a: "sim. preços de passagens são dinâmicos e podem variar. sempre confirme o valor final no site do parceiro antes de comprar.",
      },
      whatIsBestBalance: {
        q: "o que é o 'melhor equilíbrio'?",
        a: "é o voo que oferece a melhor relação entre preço e duração. nem sempre o mais barato é o melhor quando consideramos o tempo de viagem.",
      },
      whatIsPriceAlert: {
        q: "o que é um alerta de preço?",
        a: "é uma notificação que você recebe quando o preço de uma rota que você está monitorando cair. assim você não perde promoções.",
      },
      trustPartners: {
        q: "posso confiar nos sites para onde sou redirecionado?",
        a: "trabalhamos apenas com companhias aéreas oficiais e agências de viagem conhecidas no mercado.",
      },
      sellHotels: {
        q: "o navo vende hotéis ou carros?",
        a: "por enquanto, focamos apenas em passagens aéreas. queremos fazer isso muito bem antes de expandir.",
      },
      priceUpdateFrequency: {
        q: "com que frequência os preços são atualizados?",
        a: "buscamos preços em tempo real a cada pesquisa. os dados que você vê são sempre atuais.",
      },
    },
  },
};
