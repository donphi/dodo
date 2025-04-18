import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../auth/components/button'; // Adjust the import path based on your project structure

/**
 * Contact form component for the contact-us page
 */
const ContactForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log({
      firstName,
      lastName,
      email,
      phone,
      message,
      agreed,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl px-6 py-12 sm:py-16 lg:py-20"
    >
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Contact us
      </h2>
      <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
        We'd love to hear from you. Please fill out this form and we'll get back to you as soon as possible.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="first-name"
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
          >
            First name
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              name="first-name"
              id="first-name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="last-name"
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
          >
            Last name
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              name="last-name"
              id="last-name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="email"
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
          >
            Email
          </label>
          <div className="mt-2.5">
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="phone"
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
          >
            Phone number
          </label>
          <div className="mt-2.5">
            <input
              type="tel"
              name="phone"
              id="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="message"
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
          >
            Message
          </label>
          <div className="mt-2.5">
            <textarea
              name="message"
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-start">
            <input
              id="privacy-policy"
              name="privacy-policy"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-1"
              aria-label="Privacy Policy"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label
              htmlFor="privacy-policy"
              className="ml-3 text-sm leading-6 text-gray-600 dark:text-gray-300"
            >
              By selecting this, you agree to our{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 underline">
                <Link href="/privacy-policy">privacy policy</Link>
              </span>
              .
            </label>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <Button type="submit">Let&apos;s talk</Button>
      </div>
    </form>
  );
};

export default ContactForm;
