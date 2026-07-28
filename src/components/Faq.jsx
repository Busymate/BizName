import { useState } from 'react';
import '../styles/Faq.css';

const FAQ_ITEMS = [
  {
    q: 'Is BizName really free to use?',
    a: 'Yes. Every calculator, generator and template on BizName is 100% free, with no hidden fees and no sign-up required to try them out.',
  },
  {
    q: 'Do I need to create an account?',
    a: "No account is needed to use most tools. Creating a free account lets you save your work, track saved items, and access your dashboard across devices.",
  },
  {
    q: 'What does the AI Business Assistant do?',
    a: 'It answers practical business questions — pricing, cash flow, invoicing, growth strategy — in plain language, using the same data as your dashboard.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex((cur) => (cur === i ? -1 : i));

  return (
    <div className="bn-faq-list">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div className={`bn-faq-item ${isOpen ? 'is-open' : ''}`} key={item.q}>
            <button
              type="button"
              className="bn-faq-question"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              aria-controls={`bn-faq-panel-${i}`}
              id={`bn-faq-trigger-${i}`}
            >
              <span>{item.q}</span>
              <i className="fa-solid fa-chevron-down bn-faq-icon" />
            </button>
            <div
              className="bn-faq-answer"
              id={`bn-faq-panel-${i}`}
              role="region"
              aria-labelledby={`bn-faq-trigger-${i}`}
            >
              <div className="bn-faq-answer-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
