import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from '../components/hero_landing/footer';
import BackButton from '../components/back_button';

const termsMarkdown = `
**Effective Date:** April 26, 2025  

Please read these Terms of Service ("Terms") carefully before using the Dodo (DD) application, provided by Biobankly LTD ("Biobankly", "we", or "us"). These Terms constitute a legally binding agreement between you ("User" or "you") and Biobankly governing your access to and use of the DD service ("Service"). By accessing or using DD, you agree to be bound by these Terms. If you do not agree, you must not use the Service.

DD is an independent application developed by Biobankly LTD. It provides a simplified environment for testing features related to data visualization tools. DD uses **Supabase** for data storage and supports login via **GitHub and Gmail OAuth providers**. You may delete your account at any time, which will erase all login credentials and any data collected during onboarding.

The following sections outline the terms under which we offer this Service.

---

## 1. Use of the Service

### 1.1 Eligibility
You must be 18 years or older (or the age of majority in your jurisdiction) to use DD. By using our Service, you represent that you have the legal capacity to enter into this agreement. The Service is intended for research and informational purposes; it is not intended for personal consumer use of health data.

### 1.2 Account Registration & Authentication
To use DD, you will log in through a third-party identity provider (currently GitHub or Gmail OAuth, managed by Supabase). Biobankly does not provide separate passwords; we rely on Supabase to verify your identity. You agree to provide accurate and complete information during any registration or authentication process. You are responsible for maintaining the confidentiality of your authentication credentials. If you suspect any unauthorized use of your account or the Service, you must promptly notify us. We are not responsible for any downtime or authentication errors arising from Supabase services.

### 1.3 Service Functionality
DD provides tools such as charts, graphs, and statistical summaries based on publicly available biobank developer datasets or schema files. No private or participant-level biobank data is used. We comply with all applicable biobank privacy policies and terms regarding the use of publicly available resources. We do not alter the underlying data; we only present it in different forms. DD does not permanently store raw external data — any data fetched is held temporarily for visualization and then discarded after use.

### 1.4 Updates and Changes
DD is continuously evolving. We may update or modify features of the Service as we refine our product. We will try to inform you of major changes, but minor tweaks may be deployed without notice. All new features are subject to these Terms. If you do not agree with any changes, you should stop using DD. Continued use after changes become effective constitutes acceptance of those changes.

---

## 2. User Conduct and Acceptable Use
You agree not to misuse the Service or help anyone else to do so. In particular, you will:

- **Comply with Laws**: Use DD only in compliance with all applicable laws and regulations.  
- **No Unauthorized Access**: Not attempt to gain unauthorized access to any servers or systems.  
- **No Interference**: Not interfere with or disrupt the Service.  
- **No Illegal or Harmful Activities**: Not use DD for unlawful or harmful purposes.  
- **No Violation of Third-Party Rights**: Not infringe intellectual property or privacy rights.  
- **No Misrepresentation**: Not falsely imply any affiliation with Biobankly or misuse our branding.

Violation of these terms may lead to suspension or termination of your access.

---

## 3. Intellectual Property

### 3.1 Biobankly Intellectual Property
The DD Service (software, code, designs, etc.) is the intellectual property of Biobankly and is protected by copyright, trademark, and other laws. We grant you a limited, non-exclusive, non-transferable, revocable license to use DD solely for your internal purposes in accordance with these Terms. You may **not** copy, modify, distribute, sell, or lease any part of our Service, nor reverse engineer any of our software (except as permitted by law).

### 3.2 Your Data and Outputs
Biobankly does **not** claim ownership of the outputs you create using our tools (graphs, tables, etc.). By using the Service, you grant us permission to **process** your data for the purpose of displaying results to you. We do **not** share your results with others without your consent.

### 3.3 Feedback
Any feedback, suggestions, or ideas you submit to improve DD may be used freely by us without restriction or compensation to you.

---

## 4. Third-Party Services

### 4.1 Integration with Supabase
DD relies on Supabase for authentication and secure data storage. We do not control their availability, security, or functionality. If Supabase experiences downtime or errors, DD may be affected. We are not liable for such issues.

### 4.2 No Endorsement or Partnership
Biobankly is **not** affiliated with or endorsed by Supabase, GitHub, Gmail, or any other OAuth provider. All product and company names mentioned are trademarks of their respective holders. Use of them does not imply endorsement.

### 4.3 Third-Party Content
DD might link to external resources (e.g., GitHub or Gmail OAuth pages). We do not endorse or assume responsibility for these third-party contents, and you access them at your own risk.

---

## 5. Privacy
Your privacy is important to us. Please review our **Privacy Policy** (available on [biobankly.com](https://biobankly.com)) for details on how we collect, use, and protect your information. By using the Service, you agree to our Privacy Policy. If there is any conflict between the Privacy Policy and these Terms regarding personal data, the Privacy Policy will govern.

---

## 6. Disclaimers of Warranty
DD is provided to you **"AS IS" and "AS AVAILABLE"**, without warranties of any kind. We do not guarantee that the Service will be uninterrupted or error-free. Use of DD is at your own risk.

- **No Warranty on Data Accuracy**: We do not warrant that the data or analyses will be error-free.  
- **No Medical or Professional Advice**: DD is **not a medical device** and does not provide medical or professional advice.  
- **General Disclaimers**: To the fullest extent permitted by law, we disclaim all express or implied warranties.

---

## 7. Limitation of Liability
To the maximum extent permitted by law:

1. **No Indirect Damages**: Biobankly will not be liable for any indirect, incidental, special, consequential, or punitive damages.  
2. **Liability Cap**: Our total liability to you is limited to the greater of (a) the amount you paid us in the last six months, or (b) £100 GBP.  
3. **Third-Party Issues**: We are not liable for issues caused by Supabase, GitHub, or Gmail.

Some jurisdictions do not allow certain limitations, so parts of this section may not apply to you.

---

## 8. Indemnification
You agree to **indemnify, defend, and hold harmless** Biobankly, its affiliates, and personnel from and against any claims, liabilities, damages, losses, or expenses (including attorneys' fees) arising out of or related to:

- Your use or misuse of the Service;  
- Your violation of these Terms;  
- Your violation of any applicable law or third-party rights.

---

## 9. Term and Termination

### 9.1 Term
These Terms are effective when you first use the Service and continue until terminated by you or us.

### 9.2 Termination by You
You may stop using DD at any time. If you wish to delete your account and terminate this agreement, contact us or use any self-service deletion feature.

### 9.3 Termination by Us
We may suspend or terminate your access at any time, with or without cause or notice. We may also cooperate with law enforcement if necessary.

### 9.4 Effect of Termination
Upon termination, all rights granted under these Terms end. Sections 3, 6, 7, 8, 9.4, and 10–12 survive termination.

---

## 10. Dispute Resolution

### 10.1 Informal Negotiations
You agree to contact us first to try to resolve disputes informally before filing a formal claim.

### 10.2 Binding Arbitration
If informal resolution fails, disputes will be resolved by **binding arbitration**, unless prohibited by law.

### 10.3 Governing Law
These Terms are governed by the laws of England and Wales, unless otherwise required by law.

### 10.4 Jurisdiction
Any non-arbitrated dispute will be litigated in the courts of England and Wales.

---

## 11. No Waiver; Severability

### 11.1 No Waiver
Our failure to enforce any provision is not a waiver of that provision.

### 11.2 Severability
If any provision is invalid, the rest remain fully enforceable.

---

## 12. Entire Agreement
These Terms (and referenced policies) constitute the entire agreement between you and Biobankly regarding DD.

---

## 13. Changes to Terms
We may revise these Terms. Material changes will be announced in-app or via email. Continued use after changes become effective constitutes acceptance.

---

## 14. Contact Information ✉️

**Biobankly (BBLY) Support / Legal**  
- **Website**: [https://biobankly.com](https://biobankly.com)  
- **Email**: [support@biobankly.com](mailto:support@biobankly.com) / [legal@biobankly.com](mailto:legal@biobankly.com)  
- **Address**: Biobankly LTD, 128 City Road, London, EC1V 2NX, United Kingdom  
- **Attn**: Legal Queries

We will do our best to respond promptly and address your concerns.  
Thank you for using DD responsibly and in accordance with these Terms! 🧬✨

---
`;

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <BackButton />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-3xl mt-24">
          <p className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
            Dodo (DD) by Biobankly
          </p>
          <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Terms of Service
          </h1>
          <div className="mt-24 mx-auto max-w-3xl">
            <div className="prose prose-lg prose-indigo dark:prose-invert dark:prose-headings:text-white dark:prose-strong:text-white dark:text-gray-100 max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{termsMarkdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
