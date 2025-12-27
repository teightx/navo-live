"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

// ============================================================================
// Icons
// ============================================================================

function BellIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 6C17.373 6 12 11.373 12 18V26L8 32V34H40V32L36 26V18C36 11.373 30.627 6 24 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 34V36C20 38.209 21.791 40 24 40C26.209 40 28 38.209 28 36V34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ className = "", isOpen = false }: { className?: string; isOpen?: boolean }) {
  return (
    <svg 
      className={`${className} transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none"
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ============================================================================
// FAQ Item
// ============================================================================

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      <button
        onClick={onClick}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-ink">{question}</span>
        <ChevronIcon className="text-ink-muted flex-shrink-0" isOpen={isOpen} />
      </button>
      {isOpen && (
        <div 
          className="px-4 pb-3 pt-0 text-sm text-ink-muted border-t"
          style={{ borderColor: "var(--cream-dark)" }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function AlertasPage() {
  const { locale } = useI18n();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const content = {
    pt: {
      title: "alertas de preço",
      subtitle: "acompanhe um trecho e receba aviso quando o preço cair",
      description: "cadastre seu email e seja o primeiro a saber quando encontrarmos promoções para as rotas que você quer viajar.",
      emailPlaceholder: "seu@email.com",
      buttonText: "entrar na lista",
      submittedTitle: "você está na lista",
      submittedText: "avisaremos quando os alertas estiverem disponíveis.",
      comingSoonBadge: "em breve",
      faqTitle: "perguntas frequentes",
      faqs: [
        {
          question: "com que frequência vocês avisam?",
          answer: "quando detectarmos uma queda significativa no preço, você receberá um email. não enviamos spam.",
        },
        {
          question: "posso cancelar a qualquer momento?",
          answer: "sim. cada email terá um link para cancelar. você também pode gerenciar seus alertas na sua conta.",
        },
        {
          question: "quais rotas funcionam?",
          answer: "inicialmente, as principais rotas domésticas e internacionais do brasil. estamos expandindo constantemente.",
        },
      ],
    },
    en: {
      title: "price alerts",
      subtitle: "track a route and get notified when the price drops",
      description: "sign up and be the first to know when we find deals on the routes you want to fly.",
      emailPlaceholder: "your@email.com",
      buttonText: "join waitlist",
      submittedTitle: "you're on the list",
      submittedText: "we'll let you know when alerts are available.",
      comingSoonBadge: "coming soon",
      faqTitle: "frequently asked questions",
      faqs: [
        {
          question: "how often will you notify me?",
          answer: "when we detect a significant price drop, you'll receive an email. no spam.",
        },
        {
          question: "can I cancel anytime?",
          answer: "yes. every email has an unsubscribe link. you can also manage alerts in your account.",
        },
        {
          question: "which routes are supported?",
          answer: "initially, main domestic and international routes from brazil. we're constantly expanding.",
        },
      ],
    },
  };

  const t = content[locale as "pt" | "en"] || content.pt;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      // TODO: Integrar com backend
      setIsSubmitted(true);
    }
  }

  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className="flex-1 px-4 sm:px-6 pt-28 pb-16">
          <div className="max-w-lg mx-auto">
            {/* Hero Card */}
            <div 
              className="rounded-2xl p-8 text-center mb-8"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Icon */}
              <div 
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: "var(--blue)", color: "var(--cream-soft)" }}
              >
                <BellIcon />
              </div>

              {/* Coming Soon Badge */}
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                style={{ background: "var(--accent)", color: "var(--cream-soft)", opacity: 0.9 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cream-soft animate-pulse" />
                {t.comingSoonBadge}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-medium text-ink mb-2 lowercase">
                {t.title}
              </h1>
              
              <p className="text-lg text-ink-muted mb-2">
                {t.subtitle}
              </p>
              
              <p className="text-sm text-ink-muted mb-6">
                {t.description}
              </p>

              {/* Form */}
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue/50"
                    style={{
                      background: "var(--cream-dark)",
                      border: "1px solid var(--card-border)",
                      color: "var(--ink)",
                    }}
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-90"
                    style={{ 
                      background: "var(--blue)", 
                      color: "var(--cream-soft)" 
                    }}
                  >
                    {t.buttonText}
                  </button>
                </form>
              ) : (
                <div 
                  className="rounded-xl p-4"
                  style={{ background: "var(--sage)", opacity: 0.15 }}
                >
                  <div className="flex items-center justify-center gap-2 text-sage">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-medium">{t.submittedTitle}</span>
                  </div>
                  <p className="text-sm text-ink-muted mt-1">{t.submittedText}</p>
                </div>
              )}
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-4 text-center">
                {t.faqTitle}
              </h2>
              
              <div className="space-y-2">
                {t.faqs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === index}
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
