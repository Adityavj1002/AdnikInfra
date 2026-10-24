import { site } from '@/config/site'
import type { FaqGroup } from '../types'

const { corridors, towns } = site.serviceArea

/**
 * Site-wide FAQ (the /faq page and its FAQPage JSON-LD). Answers describe process, never
 * figures that change (stamp duty rates) or promises we cannot verify. Review before launch.
 */
export const faqGroups: readonly FaqGroup[] = [
  {
    slug: 'buying',
    title: 'Buying a home, plot or flat',
    faqs: [
      {
        question: 'Are your projects registered with Rajasthan RERA?',
        answer:
          'Every project we sell has to be registered with the Rajasthan Real Estate Regulatory Authority before it is advertised for sale. The registration number appears on the project page once it is issued, and you can check it yourself on the Rajasthan RERA website. Where a page says the registration is pending, we take enquiries but no bookings.',
      },
      {
        question: 'What does the price include?',
        answer:
          'The listed price is the basic price of the home or plot. Registration, stamp duty, GST where it applies, and any maintenance deposit, parking or club charges are extra. Before you book we give you a written, itemised cost sheet, so there are no surprises.',
      },
      {
        question: 'How much are stamp duty and registration charges in Jaipur?',
        answer:
          'The Government of Rajasthan sets stamp duty and registration fees, including any concessions for women buyers, and revises them from time to time. Your cost sheet shows the rates current on the day, and you can confirm them with the Registration and Stamps Department of Rajasthan.',
      },
      {
        question: 'Can I get a home loan?',
        answer:
          'Yes. Banks and housing finance companies lend on approved projects and on most resale homes. We give your lender the documents it asks for and can introduce you to lenders we have worked with. The loan decision is always the bank’s.',
      },
      {
        question: 'Do you sell resale property as well as your own projects?',
        answer:
          'Yes. Besides our own projects, we list resale flats, villas, plots, commercial spaces and agricultural land. We visit each one and check the paperwork before it is listed.',
      },
    ],
  },
  {
    slug: 'site-visits',
    title: 'Site visits',
    faqs: [
      {
        question: 'Is a site visit free?',
        answer: `Yes, and there is no obligation to book. Choose a date on our contact form, or call or WhatsApp us. Visits run ${site.contact.hours}.`,
      },
      {
        question: 'Can I visit a site that is still under construction?',
        answer:
          'Yes. One of our engineers will walk you through it and explain what has been built so far. We provide safety helmets, and children must stay with an adult at all times.',
      },
    ],
  },
  {
    slug: 'construction',
    title: 'Building on your own plot',
    faqs: [
      {
        question: 'How much does it cost to build a house in Jaipur?',
        answer:
          'It depends mainly on the built-up area, the number of floors and the specification you choose. Our construction packages are priced per square foot of built-up area. Use the cost estimator on our Home construction page for an indicative figure, then ask us for a written quote.',
      },
      {
        question: 'Do you handle the building-plan approval?',
        answer:
          'Yes. We prepare the architectural and structural drawings and file the building-plan approval with the authority for your plot: the Jaipur Development Authority, the municipal corporation or the local body, depending on where it is.',
      },
      {
        question: 'How long does construction take?',
        answer:
          'It depends on the size and design of the home and how long approvals take. Your quote comes with a written, stage-wise schedule. Modular and prefab-assisted options can shorten the build.',
      },
      {
        question: 'How do payments work?',
        answer:
          'Payments are stage-wise and tied to work completed, such as the foundation, each slab and the finishes. The schedule is written into your contract, and you get photos and a site report at each stage.',
      },
    ],
  },
  {
    slug: 'land',
    title: 'Agricultural land and areas around Jaipur',
    faqs: [
      {
        question: 'Do you work outside Jaipur city?',
        answer: `Yes. We build and sell along ${corridors.join(', ')}, and in nearby towns such as ${towns.join(', ')}.`,
      },
      {
        question: 'Can I build a house or farmhouse on agricultural land?',
        answer:
          'Usually only after the land’s use has been converted. In Rajasthan, agricultural land is converted for residential or commercial use under Section 90-A of the Rajasthan Land Revenue Act, 1956, and what is allowed depends on the land and its location. We check the records and explain what applies before you pay anything.',
      },
      {
        question: 'Which documents should I check before buying land?',
        answer:
          'At a minimum: the jamabandi (record of rights), the khasra map, the mutation (namantaran) entries, proof of road access and any conversion orders. We share copies of these before any token payment, and we encourage you to have your own lawyer review them.',
      },
    ],
  },
  {
    slug: 'after-you-buy',
    title: 'After you move in',
    faqs: [
      {
        question: 'What happens if something needs fixing after handover?',
        answer:
          'A dedicated after-handover team handles snags and maintenance requests. Structural defects are covered for the period set out in your agreement and under RERA.',
      },
      {
        question: 'How do I reach you?',
        answer: `Email ${site.contact.email ?? 'us through the contact page'} or use the form on our contact page. ${site.contact.responseTime}`,
      },
    ],
  },
]
