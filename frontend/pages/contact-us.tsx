import React from 'react';
import ContactPageWrapper from '../components/contact/ContactPageWrapper';
import ContactForm from '../components/contact/ContactForm';

/**
 * Main contact page component
 */
const ContactPage: React.FC = () => {
  return (
    <ContactPageWrapper>
      <ContactForm />
    </ContactPageWrapper>
  );
};

export default ContactPage;
