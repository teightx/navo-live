"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

// ============================================================================
// Chevron Icon
// ============================================================================

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
// FAQ Item Component
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
      className="border-b transition-colors"
      style={{ borderColor: "var(--card-border)" }}
    >
      <button
        onClick={onClick}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <span className="text-sm font-medium text-ink group-hover:text-blue transition-colors pr-4">
          {question}
        </span>
        <ChevronIcon className="text-ink-muted flex-shrink-0" isOpen={isOpen} />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-40 pb-4" : "max-h-0"
        }`}
      >
        <p className="text-sm text-ink-muted leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Main FAQ Component
// ============================================================================

export function HomeFAQ() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const questions = [
    t.faq.questions.howFindPrices,
    t.faq.questions.doBuyHere,
    t.faq.questions.anyFees,
    t.faq.questions.priceChange,
    t.faq.questions.whatIsBestBalance,
    t.faq.questions.whatIsPriceAlert,
    t.faq.questions.trustPartners,
    t.faq.questions.sellHotels,
    t.faq.questions.priceUpdateFrequency,
  ];

  function handleToggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="px-4 sm:px-6 py-16 md:py-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-medium text-ink mb-2 lowercase">
            {t.faq.title}
          </h2>
          <p className="text-ink-muted text-sm sm:text-base">
            {t.faq.subtitle}
          </p>
        </div>

        {/* FAQ List */}
        <div 
          className="rounded-2xl px-6"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          {questions.map((item, index) => (
            <FAQItem
              key={index}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

