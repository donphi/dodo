'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TextInput } from '../tempate_components/login/components/text_field';
import { Dropdown } from '../tempate_components/login/components/dropdown';
import { TextArea } from '../tempate_components/login/components/textarea';
import { Switch } from '../tempate_components/login/components/switch';
import { Button } from '../tempate_components/login/components/button';
import BackButton from '../tempate_components/back_button';

const countryOptions = [
  { value: 'US', label: 'US' },
  { value: 'CA', label: 'CA' },
  { value: 'EU', label: 'EU' },
];

export default function ContactUsPage() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="relative isolate bg-white dark:bg-gray-900 px-6 py-24 sm:py-32 lg:px-8 min-h-screen">
      <BackButton />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-300 via-pink-200 to-indigo-500 opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
        />
      </div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Contact Us
        </h2>
        <p className="mt-2 text-lg/8 text-gray-600 dark:text-gray-300">
          Reach out to our team for sales, support, or general inquiries.
        </p>
      </div>
      <form action="#" method="POST" className="mx-auto mt-16 max-w-xl sm:mt-20" autoComplete="off">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <TextInput id="first-name" label="First name" autoComplete="given-name" required />
          <TextInput id="last-name" label="Last name" autoComplete="family-name" required />
          <div className="sm:col-span-2">
            <TextInput id="company" label="Company" autoComplete="organization" />
          </div>
          <div className="sm:col-span-2">
            <TextInput id="email" label="Email" type="email" autoComplete="email" required />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-2">
            <Dropdown id="country" label="Country" options={countryOptions} />
            <TextInput id="phone-number" label="Phone number" autoComplete="tel" type="tel" />
          </div>
          <div className="sm:col-span-2">
            <TextArea id="message" label="Message" rows={4} required />
          </div>
          <div className="sm:col-span-2">
            <Switch
              id="agreement"
              label={
                <>
                  By selecting this, you agree to our{' '}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 underline">
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <Link href="/privacy-policy">privacy policy</Link>
                  </span>
                  .
                </>
              }
              checked={agreed}
              onChange={setAgreed}
            />
          </div>
        </div>
        <div className="mt-10">
          <Button type="submit">Let&apos;s talk</Button>
        </div>
      </form>
    </div>
  );
}
