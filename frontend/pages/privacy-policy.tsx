import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from '../components/hero_landing/footer';
import BackButton from '../components/back_button';

const privacyMarkdown = `
**Effective Date:** April 18, 2025  
**Last Updated:** April 26, 2025  

## Introduction 🧬
Welcome to **Dodo (DD)** by **Biobankly**! We are committed to protecting your privacy and ensuring the security of your data. This Privacy Policy explains what information Biobankly (referred to as "we" or "us") collects, how we use and store it, and your rights regarding your information. Biobankly is a UK-based service providing visualization, statistics, and analysis tools, and we comply with the EU/UK General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable global privacy laws.

We do not collect any personal health or genetic data through our app, and we strive to only process the minimal data necessary to operate our service in a privacy-preserving way. By using **DD**, an independent application by Biobankly LTD, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use the service.

---

## Data We Collect and Use

### 1. No Personal Health Information
DD does not collect or store any personal health or genetic data. It operates independently from biobank repositories. There is no access to individual-level health information or biobank participant data.

### 2. Personal Data You Provide
The only personal data collected is necessary for **account login via Supabase OAuth**, using GitHub or Gmail as identity providers. We may receive:

- **Basic Identifiers**: your GitHub or Gmail-linked email address or user ID  
- **Authentication Tokens**: login tokens to authenticate you (we do not store your passwords)  
- **Onboarding Data**: responses to any onboarding questions you answer within the app, stored securely in Supabase

All data is collected directly through your interaction with the app. You can delete your account at any time, which will permanently remove your login data and onboarding responses.

### 3. Usage Data (Aggregated Analytics)
We may collect anonymized usage data to understand how DD is used. This may include feature usage patterns, app errors, or engagement levels, all **without personal identifiers**.

### 4. Financial Information
Not applicable. DD does not collect any payment or financial information.

### 5. Children's Data
DD is **not intended for children under 16**, and we do not knowingly collect data from them.

---

## How We Use Your Data

- To authenticate your login and provide access to DD  
- To store and display your onboarding responses  
- To monitor aggregated usage and improve functionality  
- To respond to your support requests  
- To comply with legal requirements or protect our services

We do **not** use your data for marketing or automated profiling.

---

## Legal Bases for Processing (GDPR)
We rely on:

- **Performance of a contract**: to let you log in and use the service  
- **Legitimate interests**: to improve the app and ensure security  
- **Legal obligations**: if we are required to retain or disclose data

---

## Data Storage and Transfers
All data is securely stored using **Supabase**, with hosting primarily in the **United Kingdom**. If transferred or accessed elsewhere, we implement appropriate safeguards such as EU Standard Contractual Clauses.

---

## Data Retention
- **Login & onboarding data**: deleted upon account deletion  
- **Usage data**: anonymized and may be retained indefinitely  
- **Support messages**: stored only as long as needed  
- **Legal logs**: retained as required by law

---

## Data Sharing and Disclosure

- **No sale of data**  
- **No third-party marketing or developer access**  
- **Supabase**: provides authentication and secure database services  
- **GitHub/Gmail**: used for login; subject to their privacy policies  
- **Legal authorities**: only if required by law  
- **Business transfers**: your data would remain protected under the same standards

---

## Your Rights

Under GDPR, CCPA, or similar laws, you may:

- Access, rectify, or erase your data  
- Object to or restrict processing  
- Export your data  
- Withdraw consent (if applicable)  
- File a complaint with your local authority

To make a request, contact us (see below).

---

## Security Measures
We use encryption, secure APIs, and Supabase’s privacy tools to protect your data. While we take security seriously, no system is immune to breach. Please safeguard your login credentials.

---

## Cookies and Tracking
DD may use minimal cookies for login/session purposes. No third-party ads or trackers are used.

---

## Third-Party Links
We may link to external resources (e.g., GitHub, Gmail OAuth pages). Their privacy practices are separate, and we recommend reviewing their policies.

---

## Changes to This Policy
We may update this policy. Significant changes will be announced in-app or via email. The most recent version is always effective based on the “Last Updated” date.

---

## Contact Us 📧

**Biobankly**  
**Website**: [https://biobankly.com](https://biobankly.com)  
**Email**: [privacy@biobankly.com](mailto:privacy@biobankly.com)  
**Address**: Biobankly LTD, 128 City Road, London, EC1V 2NX, United Kingdom

We take privacy seriously and are here to support your rights and protect your trust.

---
`;

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <BackButton />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-3xl mt-24">
          <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
            Dodo (DD) by Biobankly
          </p>
          <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <div className="mt-24 mx-auto max-w-3xl">
            <div className="prose prose-lg prose-indigo dark:prose-invert dark:prose-headings:text-white dark:prose-strong:text-white dark:text-gray-100 max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{privacyMarkdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
