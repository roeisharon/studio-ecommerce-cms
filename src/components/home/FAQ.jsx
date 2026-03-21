import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Are your ceramics dishwasher and microwave safe?',
    answer: 'Most of our pieces are dishwasher and microwave safe. However, we recommend hand washing to preserve the beauty and longevity of your ceramics. Specific care instructions are provided with each product.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'We carefully package and ship orders within 3-5 business days. Domestic shipping typically takes 5-7 business days. International orders may take 2-3 weeks depending on your location.'
  },
  {
    question: 'Do you accept custom orders?',
    answer: 'Yes! We love creating custom pieces. Visit our Custom Order page to submit your request. We\'ll review your vision and provide a quote within 5-7 business days.'
  },
  {
    question: 'What if my item arrives damaged?',
    answer: 'We package every piece with utmost care, but accidents happen. If your item arrives damaged, please contact us within 48 hours with photos. We\'ll arrange a replacement or full refund immediately.'
  },
  {
    question: 'Can I visit your studio?',
    answer: 'Absolutely! We welcome studio visits by appointment. Located in Timmorim, Israel, our space is open for tours and workshops. Contact us to schedule your visit.'
  },
  {
    question: 'What makes your ceramics unique?',
    answer: 'Each piece is entirely handmade using traditional techniques. The natural variations in glaze and form make every item one-of-a-kind. We use sustainable practices and locally-sourced materials whenever possible.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#C4785A] text-sm tracking-[0.3em] uppercase font-medium">
            Questions & Answers
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-serif text-[#2D2D2D]">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between bg-white transition-colors text-left"
              >
                <span className="font-medium text-[#2D2D2D] pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#C4785A] flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-[#5A5A5A] leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}