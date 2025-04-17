import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from '../tempate_components/hero_landing/footer';
import BackButton from '../tempate_components/back_button';

const termsMarkdown = `
**Effective Date:** February 14, 2025  

Please read these Terms of Service ("Terms") carefully before using the Biobankly application or website. These Terms constitute a legally binding agreement between you ("User" or "you") and **Biobankly ("Company", "we", or "us")** governing your access to and use of the Biobankly service ("Service"). By accessing or using Biobankly, you agree to be bound by these Terms. If you do not agree, you must not use the Service.

Biobankly is a platform that provides visualization, statistical analysis, and data exploration tools for biobank data. We want to clarify our role: **Biobankly does not host, control, or own the biobank datasets** you may access through our tool – those remain on their respective platforms (such as DNAnexus or the biobank's servers). Biobankly simply connects to those sources with your permission to fetch data for visualization. Additionally, Biobankly uses **DNAnexus's OpenID Connect (OIDC)** for user authentication (bridged through **Supabase OAuth**) but is not operated by or affiliated with DNAnexus, Supabase, or any biobank. By using Biobankly, you also agree to any relevant terms of these third-party services that you use to log in or access data, though Biobankly itself is a separate entity.

Think of Biobankly as **a set of binoculars**: we help you see and analyze biobank data that you have permission to access, but we don't hold the data ourselves. The following sections outline the terms under which we offer our Service.

---

## 1. Use of the Service

### 1.1 Eligibility
You must be 18 years or older (or the age of majority in your jurisdiction) to use Biobankly. By using our Service, you represent that you have the legal capacity to enter into this agreement. The Service is intended for use by researchers or authorized users of biobank data; it is not intended for personal consumer use of health data.

### 1.2 Account Registration & Authentication
To use Biobankly, you will log in through a third-party identity provider (currently **DNAnexus OIDC**, bridged by **Supabase OAuth**). Biobankly does not provide separate passwords; we rely on DNAnexus and Supabase to verify your identity. You agree to provide accurate and complete information during any registration or authentication process. You are responsible for maintaining the confidentiality of your DNAnexus account credentials. If you suspect any unauthorized use of your account or the Biobankly Service, you must promptly notify us and DNAnexus (and/or Supabase, if applicable). We are not responsible for any downtime or authentication errors arising from DNAnexus or Supabase services.

### 1.3 Authorization to Access Biobank Data
By logging in and using Biobankly, you authorize us to access and visualize data that you have permission to access on the connected biobank platform. You are solely responsible for ensuring you have the right to access and use that data. Biobankly does not verify your data permissions; we assume that if your login allows you to query the data, you have the necessary rights. You agree to abide by any terms of the data source (e.g., the biobank's user agreement or DNAnexus's terms). We expressly disclaim any liability for your misuse of third-party data – see Section 6 (Disclaimers) and Section 8 (Indemnification).

### 1.4 Service Functionality
Biobankly provides tools such as charts, graphs, and statistical summaries. We do not alter the underlying data; we only present it in different forms. Biobankly does not **permanently store** the raw biobank data you retrieve – any data fetched is held temporarily in memory for visualization and then discarded after use. We also do not guarantee any particular data's availability at all times (e.g., if the source removes data, that will affect Biobankly).

### 1.5 Updates and Changes
Biobankly is continuously evolving. We may update or modify features of the Service as we refine our product. We will try to inform you of major changes, but minor tweaks may be deployed without notice. All new features are subject to these Terms. If you do not agree with any changes, you should stop using Biobankly. Continued use after changes become effective constitutes acceptance of those changes.

---

## 2. User Conduct and Acceptable Use
You agree not to misuse the Service or help anyone else to do so. In particular, you will:

- **Comply with Laws**: Use Biobankly only in compliance with all applicable laws and regulations (including data protection laws, intellectual property laws, export controls, etc.).  
- **No Unauthorized Access**: Not attempt to gain unauthorized access to any servers or systems of Biobankly, DNAnexus, Supabase, or biobank platforms.  
- **No Interference**: Not interfere with or disrupt the Service (e.g., DDoS attacks, spamming queries, or uploading malicious code).  
- **No Illegal or Harmful Activities**: Not use Biobankly for unlawful or harmful purposes (e.g., defamation, discriminatory practices, or re-identification of anonymized data).  
- **No Violation of Third-Party Rights**: Not infringe any intellectual property rights or privacy rights through your use of Biobankly.  
- **No Misrepresentation**: Not falsely imply any affiliation with Biobankly or misuse our name/branding.

Violation of these terms may lead to suspension or termination of your access (see Section 9).

---

## 3. Intellectual Property

### 3.1 Biobankly Intellectual Property
The Biobankly Service (software, code, designs, etc.) is the intellectual property of Biobankly and is protected by copyright, trademark, and other laws. We grant you a limited, non-exclusive, non-transferable, revocable license to use Biobankly solely for your internal purposes in accordance with these Terms. You may **not** copy, modify, distribute, sell, or lease any part of our Service, nor reverse engineer any of our software (except as permitted by law).

### 3.2 Your Data and Outputs
Biobankly does **not** claim ownership of any third-party data you access from biobank sources. That data is owned by the biobank or study participants. Biobankly also does **not** claim ownership of the outputs you create using our tools (graphs, tables, etc.). By using the Service, you grant us permission to **process** that data for the purpose of displaying results to you. We do **not** share your results with others without your consent.

### 3.3 Feedback
Any feedback, suggestions, or ideas you submit to improve Biobankly may be used freely by us without restriction or compensation to you.

---

## 4. Third-Party Services and No Affiliation

### 4.1 Integration with DNAnexus, Supabase, and Biobanks
Biobankly relies on third-party platforms like DNAnexus (for authentication and as a data provider hosting multiple biobank repositories) and **Supabase** (for bridging OAuth to DNAnexus OIDC). We do not control their availability, security, or functionality. If DNAnexus or Supabase experiences downtime or errors, Biobankly may be affected. We are not liable for such issues.

### 4.2 No Endorsement or Partnership
Biobankly is **not** affiliated with or endorsed by DNAnexus, Supabase, or any biobank. All product and company names mentioned are trademarks of their respective holders. Use of them does not imply any endorsement or partnership. You must also abide by any agreement you have with these third parties.

### 4.3 Third-Party Content
Biobankly might display or link to external resources for convenience (e.g., DNAnexus documentation). We do not endorse or assume responsibility for these third-party contents, and you access them at your own risk.

---

## 5. Privacy
Your privacy is important to us. Please review our **Privacy Policy** (above or on [biobankly.com](https://biobankly.com)) for details on how we collect, use, and protect your information. By using the Service, you agree to our Privacy Policy. If there is any conflict between the Privacy Policy and these Terms regarding personal data, the Privacy Policy will govern.

---

## 6. Disclaimers of Warranty
Biobankly is provided to you **"AS IS" and "AS AVAILABLE"**, without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or free of harmful components. Use of Biobankly is at your own risk.

- **No Warranty on Data Accuracy**: Biobankly's results depend on the data from third parties and standard statistical methods. We do not warrant that the data (or our analyses) will be error-free.  
- **No Medical or Professional Advice**: Biobankly is **not a medical device**. We do not provide medical, genetic, or professional advice. The Service is for research and informational purposes only.  
- **General Disclaimers**: To the fullest extent permitted by law, we disclaim all express or implied warranties (including merchantability, fitness for a particular purpose, and non-infringement).

---

## 7. Limitation of Liability
To the maximum extent permitted by law:

1. **No Indirect Damages**: Biobankly will not be liable for any indirect, incidental, special, consequential, or punitive damages (e.g., lost profits, lost data, or business interruption).  
2. **Liability Cap**: Our total liability to you for any claim under these Terms is limited to the greater of (a) the total amount (if any) you have paid us in the last six months or (b) £100 GBP.  
3. **Data Accuracy and Use**: We are not liable for outcomes based on your reliance on data or results from Biobankly.  
4. **Third-Party Issues**: We are not liable for issues caused by DNAnexus, Supabase, or any biobank provider.

Some jurisdictions do not allow certain limitations, so parts of this section may not apply to you.

---

## 8. Indemnification
You agree to **indemnify, defend, and hold harmless** Biobankly, its affiliates, and personnel from and against any claims, liabilities, damages, losses, or expenses (including attorneys' fees) arising out of or related to:

- Your use or misuse of the Service;  
- Your violation of these Terms;  
- Your violation of any applicable law or third-party rights;  
- Any data you input or generate through the Service (including claims of infringement or privacy violation).

We reserve the right to assume exclusive defense of any matter subject to indemnification by you.

---

## 9. Term and Termination

### 9.1 Term
These Terms are effective when you first use the Service and continue until terminated by you or us.

### 9.2 Termination by You
You may stop using Biobankly at any time. If you wish to delete your account and terminate this agreement, contact us or use any self-service account deletion feature.

### 9.3 Termination by Us
We may suspend or terminate your access at any time, with or without cause or notice (e.g., if you violate these Terms or if required by law). We may also cooperate with law enforcement where necessary.

### 9.4 Effect of Termination
Upon termination, all rights granted under these Terms end. We may delete your data as described in our Privacy Policy. Sections 3, 6, 7, 8, 9.4, and 10–12 survive termination.

---

## 10. Dispute Resolution
We aim for fair, efficient dispute resolution:

### 10.1 Informal Negotiations
You agree to contact us first to try to resolve disputes informally. Neither party will file a formal claim for at least 30 days after notifying the other of a dispute.

### 10.2 Binding Arbitration
If informal resolution fails, and unless prohibited by law, disputes will be resolved by **binding arbitration** rather than in court. This means you waive the right to a jury trial or class action. The arbitration will be conducted by a recognized provider (e.g., AAA) and may be done via phone, online, or written submissions.

### 10.3 Exceptions
Either party may bring an individual action in small claims court if it qualifies, or seek injunctive relief in court for intellectual property violations or misuse of confidential information.

### 10.4 Governing Law
These Terms and any dispute will be governed by the laws of England and Wales (or, for US users, the laws of Delaware), unless otherwise required by consumer protection laws in your country of residence.

### 10.5 Jurisdiction for Litigation
If a dispute is not subject to arbitration, it will be litigated in the courts of England and Wales (for UK/EU) or Delaware (for US). You and Biobankly consent to personal jurisdiction there.

### 10.6 Time Limit
Any claim must be filed within one year of the event giving rise to it, unless prohibited by law.

---

## 11. No Waiver; Severability

### 11.1 No Waiver
Our failure to enforce any provision is not a waiver of that provision. A waiver must be in writing and signed by an authorized representative.

### 11.2 Severability
If any provision is found invalid or unenforceable, the remaining provisions will remain in full force and effect. The invalid part will be modified to the least degree necessary to make it valid, reflecting the original intent.

---

## 12. Entire Agreement
These Terms (and referenced documents like the Privacy Policy) are the entire agreement between you and Biobankly regarding your use of the Service, superseding all prior agreements. No oral or written information not included in these Terms creates additional obligations.

---

## 13. Changes to Terms
We may revise these Terms from time to time. If we make material changes, we will notify you (e.g., via an in-app notice). By continuing to use Biobankly after updated Terms take effect, you agree to be bound by them. If you do not agree, you must stop using the Service.

---

## 14. Contact Information ✉️
If you have any questions or need to contact us:

**Biobankly (BBLY) Support / Legal**  
- **Website**: [https://biobankly.com](https://biobankly.com)  
- **Email**: [support@biobankly.com](mailto:support@biobankly.com) (for general queries) / [legal@biobankly.com](mailto:legal@biobankly.com) (for legal notices)  
- **Address**: Biobankly LTD, 128 City Road, London, EC1V 2NX, United Kingdom
- **Attn**: Legal Queries

We will do our best to respond promptly and address your concerns.  
**Thank you for using Biobankly responsibly** and in accordance with these Terms. Enjoy exploring data! 🧬✨

---
`;

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <BackButton />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-3xl">
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
