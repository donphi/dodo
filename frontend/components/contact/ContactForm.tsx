import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../auth/components/button';
import { supabase } from '../../lib/supabaseClient';
import FeedbackDialog from './sent';

/**
 * Interface for form field validation errors
 */
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  agreed?: string;
  general?: string;
}

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'success' | 'error'>('success');

  /**
   * Validates all form fields and returns true if valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate first name
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Validate last name
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    // Validate phone (optional but if provided must be valid)
    if (phone.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
      if (!phoneRegex.test(phone)) {
        newErrors.phone = 'Please enter a valid phone number';
        isValid = false;
      }
    }

    // Validate message
    if (!message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    }

    // Validate agreement
    if (!agreed) {
      newErrors.agreed = 'You must agree to the privacy policy';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Show feedback dialog with success status initially
      // This ensures users get immediate feedback even if email sending takes time
      setFeedbackStatus('success');
      setShowFeedback(true);
      
      // Store contact form data in Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            message,
            agreed_to_privacy: agreed,
          },
        ]);

      if (error) {
        console.error('Database insertion error:', error);
        setFeedbackStatus('error');
        throw error;
      }

      try {
        // Send email notification using Supabase Edge Functions
        const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
          body: {
            firstName,
            lastName,
            email,
            phone,
            message,
          },
        });

        if (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't change feedback status - data was saved even if email failed
        }
      } catch (emailError) {
        console.error('Email function error:', emailError);
        // Don't change feedback status - data was saved even if email failed
      }
      
      // Reset form on success
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setAgreed(false);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        general: 'An error occurred while submitting the form. Please try again or contact us directly.'
      });
      setFeedbackStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
            First name <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              name="first-name"
              id="first-name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`block w-full rounded-md bg-white dark:bg-gray-800 px-3.5 py-2 text-gray-900 shadow-sm outline outline-1 -outline-offset-1 ${
                errors.firstName ? 'outline-red-500' : 'outline-gray-300 dark:outline-gray-600'
              } placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm sm:leading-6 dark:text-white dark:focus:outline-indigo-500`}
              aria-invalid={errors.firstName ? 'true' : 'false'}
              aria-describedby={errors.firstName ? 'first-name-error' : undefined}
            />
            {errors.firstName && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="first-name-error">
                {errors.firstName}
              </p>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="last-name"
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
          >
            Last name <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="text"
              name="last-name"
              id="last-name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`block w-full rounded-md bg-white dark:bg-gray-800 px-3.5 py-2 text-gray-900 shadow-sm outline outline-1 -outline-offset-1 ${
                errors.lastName ? 'outline-red-500' : 'outline-gray-300 dark:outline-gray-600'
              } placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm sm:leading-6 dark:text-white dark:focus:outline-indigo-500`}
              aria-invalid={errors.lastName ? 'true' : 'false'}
              aria-describedby={errors.lastName ? 'last-name-error' : undefined}
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="last-name-error">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="email"
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full rounded-md bg-white dark:bg-gray-800 px-3.5 py-2 text-gray-900 shadow-sm outline outline-1 -outline-offset-1 ${
                errors.email ? 'outline-red-500' : 'outline-gray-300 dark:outline-gray-600'
              } placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm sm:leading-6 dark:text-white dark:focus:outline-indigo-500`}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="email-error">
                {errors.email}
              </p>
            )}
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
              className={`block w-full rounded-md bg-white dark:bg-gray-800 px-3.5 py-2 text-gray-900 shadow-sm outline outline-1 -outline-offset-1 ${
                errors.phone ? 'outline-red-500' : 'outline-gray-300 dark:outline-gray-600'
              } placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm sm:leading-6 dark:text-white dark:focus:outline-indigo-500`}
              aria-invalid={errors.phone ? 'true' : 'false'}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="phone-error">
                {errors.phone}
              </p>
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="message"
            className="block text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
          >
            Message <span className="text-red-500">*</span>
          </label>
          <div className="mt-2.5">
            <textarea
              name="message"
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`block w-full rounded-md bg-white dark:bg-gray-800 px-3.5 py-2 text-gray-900 shadow-sm outline outline-1 -outline-offset-1 ${
                errors.message ? 'outline-red-500' : 'outline-gray-300 dark:outline-gray-600'
              } placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm sm:leading-6 dark:text-white dark:focus:outline-indigo-500`}
              aria-invalid={errors.message ? 'true' : 'false'}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            {errors.message && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="message-error">
                {errors.message}
              </p>
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-start">
            <input
              id="privacy-policy"
              name="privacy-policy"
              type="checkbox"
              className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 mt-1 ${
                errors.agreed ? 'border-red-500 ring-1 ring-red-500' : ''
              }`}
              aria-label="Privacy Policy"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              aria-invalid={errors.agreed ? 'true' : 'false'}
              aria-describedby={errors.agreed ? 'privacy-policy-error' : undefined}
            />
            <label
              htmlFor="privacy-policy"
              className="ml-3 text-sm leading-6 text-gray-600 dark:text-gray-300"
            >
              By selecting this, you agree to our{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 underline">
                <Link href="/privacy-policy">privacy policy</Link>
              </span>
              . <span className="text-red-500">*</span>
            </label>
          </div>
          {errors.agreed && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="privacy-policy-error">
              {errors.agreed}
            </p>
          )}
        </div>
        </div>
        
        {errors.general && (
          <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{errors.general}</h3>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-10">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Let\'s talk'}
          </Button>
        </div>
      </form>
      
      {/* Feedback dialog */}
      {showFeedback && (
        <FeedbackDialog
          status={feedbackStatus}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
};

export default ContactForm;
