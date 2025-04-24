import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    "question": "What is Dodo?",
    "answer": "Dodo is an experimental platform that allows anyone, not just researchers, to explore and interact with open-access biobank data. It uses visual tools like sunburst charts, tidy trees, and 3D clusters to help you understand health and phenotype data in a simple, intuitive way. Dodo is also a space to test new ideas and features, where users can vote on what they find most useful, helping shape what may become part of the Biobankly platform. If you're serious about contributing or collaborating, feel free to reach out."
  },
  {
    "question": "What is Biobankly?",
    "answer": "Biobankly is a secure platform built for approved data scientists and healthcare professionals. It connects users to multiple biobank repositories and simplifies complex datasets using AI, smart interfaces, and clean design methods to make advanced research more efficient and insightful. Access is limited to users who already have approval to access biobank data. The platform has not yet launched, but you can sign up for notifications at https://biobankly.com."
  },
  {
    "question": "Why are Dodo and Biobankly separate platforms?",
    "answer": "Dodo is open and experimental, anyone can use it to explore publicly available data. Biobankly, on the other hand, is a professional-grade platform that requires approval to access sensitive and private biobank data. Each serves a different purpose, but both are part of the same ecosystem: Dodo gathers public feedback and feature validation, while Biobankly delivers secure, scalable data tools to professionals. If you're exploring either side seriously, you're welcome to get in touch."
  },
  {
    "question": "Who created Dodo and Biobankly?",
    "answer": "Dodo and Biobankly were created by a designer and health researcher during their postgraduate studies. With a background in design methodologies, coding, databases, and user experience, the goal was to develop tools that simplify how we interact with health data, making it easier for both professionals and the public to engage with complex information. If you're aligned with this mission and want to get involved, we're open to meaningful partnerships."
  },
  {
    "question": "Where does the data come from?",
    "answer": "Dodo uses publicly available data provided by biobank developers, including schema files and documentation. This requires deep understanding and careful work to structure and visualise the data properly. In Biobankly, data is pulled in real-time from multiple approved sources, but no raw data is stored — it is analysed and then deleted, in line with the data handling policies of most biobank repositories. You can read our privacy policy and terms and conditions at either dodo.biobankly.com or biobankly.com. For example, we currently use schema files from the UK Biobank, available at https://biobank.ndph.ox.ac.uk/ukb/download.cgi."
  },
  {
    "question": "Where can I find more information about biobanks?",
    "answer": "Here are some leading sources for biobank-related research and data: Genomics England: https://www.genomicsengland.co.uk, UK Biobank: https://www.ukbiobank.ac.uk, All of Us (US NIH): https://www.joinallofus.org, FinnGen: https://www.finngen.fi/en, International HundredK+ Cohorts Consortium: https://ihccglobal.org, European Genome-phenome Archive (EGA): https://ega-archive.org"
  },
  {
    "question": "Can I contribute ideas or get involved?",
    "answer": "Yes, absolutely. Dodo is built to be collaborative. If you have suggestions, want to vote on features, or contribute ideas, whether you work in healthcare, design, or data science, we want your input. Feedback helps improve Biobankly and shape the tools of tomorrow. If you're seriously interested in collaborating, just reach out through the site."
  }
];

export function FAQ(): React.ReactElement {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Frequently asked questions</h2>
          <dl className="mt-16 divide-y divide-gray-200 dark:divide-white/10">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} as="div" className="py-6 first:pt-0 last:pb-0">
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left">
                    <span className="text-base/7 font-semibold text-gray-900 dark:text-white group-data-[open]:text-indigo-600 group-data-[open]:dark:text-indigo-400">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <PlusSmallIcon aria-hidden="true" className="size-6 text-gray-900 dark:text-white group-data-[open]:hidden" />
                      <MinusSmallIcon aria-hidden="true" className="size-6 text-gray-900 dark:text-white group-[&:not([data-open])]:hidden" />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-2 pr-12">
                  <p className="text-base/7 text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
