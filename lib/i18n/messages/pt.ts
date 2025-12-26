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
    dontWantToCheck: string;
    createAlert: string;
    noFlightsFound: string;
    tryAdjusting: string;
    editSearch: string;
    errorTitle: string;
    errorMessage: string;
    tryAgain: string;
  };
  flightDetails: {
    departure: string;
    arrival: string;
    compareIn: string;
    sites: string;
    lowestPrice: string;
    pricesDisclaimer: string;
    back: string;
    notFound: string;
    backToHome: string;
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
    addDate: "adicionar data",
    travelers: "viajantes",
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
    dontWantToCheck: "não quer verificar todo dia?",
    createAlert: "criar alerta de preço",
    noFlightsFound: "nenhum voo encontrado",
    tryAdjusting: "tente ajustar as datas ou escolher outros aeroportos para encontrar mais opções",
    editSearch: "editar busca",
    errorTitle: "erro ao buscar voos",
    errorMessage: "não foi possível carregar os resultados. verifique sua conexão e tente novamente.",
    tryAgain: "tentar novamente",
  },
  flightDetails: {
    departure: "partida",
    arrival: "chegada",
    compareIn: "comparar em",
    sites: "sites",
    lowestPrice: "menor preço",
    pricesDisclaimer: "preços sujeitos a alteração · verifique no site do parceiro",
    back: "voltar",
    notFound: "voo não encontrado",
    backToHome: "voltar para home",
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
};
