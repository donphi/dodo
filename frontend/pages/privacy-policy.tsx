import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from '../components/hero_landing/footer';
import BackButton from '../components/back_button';

const privacyMarkdown = `
**Effective Date:** February 14, 2025  
**Last Updated:** February 14, 2025  

## Introduction 🧬
Welcome to **Biobankly (BBLY)**! We are committed to protecting your privacy and ensuring the security of your data. This Privacy Policy explains what information Biobankly (referred to as "we" or "us") collects, how we use and store it, and your rights regarding your information. Biobankly is a UK-based service providing visualization, statistics, and analysis on biobank data, and we comply with the EU/UK General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable global privacy laws.

We do not collect any personal health or genetic data through our app, and we strive to only process the minimal data necessary to operate our service in a privacy-preserving way. By using Biobankly, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use the service.

---

## Data We Collect and Use

### 1. No Personal Health Information
Biobankly does not collect or store any personal health information or biobank participant data. We purposely avoid handling any sensitive health or genetic data about individuals. Our app deals only with **publicly available schema** or structural information (e.g., data dictionaries or XML schema definitions) of biobank databases, and aggregated statistical results. This means **no individual-level patient data** is ever collected or processed by Biobankly.

### 2. Personal Data You Provide
The only personal data we collect from you is what's necessary for **account creation and login**. 

When you sign up or log in via the **DNAnexus OpenID Connect (OIDC)** authentication (using **Supabase's OAuth** layer to bridge to DNAnexus's OIDC), we may receive basic identifiers such as:

- **Account Identifiers**: e.g., your user ID, username, or email address associated with your DNAnexus/biobank account (as provided through the OIDC login).  
- **Authentication Tokens**: a token or credential from DNAnexus (through Supabase) to verify your identity and allow access (we do not see your password; DNAnexus handles the login process).  
- **Profile Information**: if DNAnexus provides any profile info (like name) to our app through the login process, we may temporarily use it to identify your session. (We do not require or store profile details beyond what is needed for your account functionality.)

We collect this information directly from you (through the login flow which you initiate). We do not collect personal data from any other sources. In particular, we **do not collect any data from the biobank itself** about you – we only get authentication confirmation from DNAnexus (and the bridging via Supabase).

### 3. Usage Data (Aggregated Analytics)
When you use Biobankly, we may collect certain usage information to help us improve the service. This includes things like what features you use, general usage frequency, and error logs – **all in aggregate form only**. For instance, we might track total users per week, average queries made, or the range of data values viewed. These statistics contain **no personally identifiable information** – they are aggregated across all users. We do not log individual viewing habits or specific biobank records tied to you. The purpose of collecting usage data is solely to understand overall app performance and user engagement so we can enhance Biobankly.

### 4. Financial Information
Not applicable. Biobankly does not involve any payment processing at this time and therefore does not collect financial information. If this changes (e.g., if a paid subscription is introduced), we will update this Policy accordingly.

### 5. Children's Data
Biobankly is **not intended for use by children under the age of 16**. We do not knowingly collect personal data from anyone under 16. If we learn that we have inadvertently collected information from a child, we will delete it. If you are a parent or guardian and believe your child has provided personal information to us, please contact us immediately (see **Contact Us** below).

---

## How We Use Your Data

1. **To Provide and Maintain the Service**  
   We use your login credentials (OIDC token or user ID) to authenticate you and allow you to access Biobankly's features. This is necessary to perform our contract with you – i.e., to let you use the app securely with your biobank data. We also use your data to maintain your session, keep you logged in securely, and to respond to your requests within the app.

2. **Statistical Analysis and Improvements**  
   Aggregated usage data is analyzed to understand how Biobankly is performing and how users interact with it. For example, we might look at the average number of visualizations generated per user or which features are most popular, but only in aggregate. This helps us improve features, fix bugs, and enhance user experience.

3. **Customer Support**  
   If you contact us with an issue or question and provide us with contact information (like an email), we will use that information to respond to you and resolve your issue.

4. **Compliance and Protection**  
   We may process personal data as required to comply with applicable laws, regulations, and legal obligations (e.g., verifying user identity if needed for security, or retaining certain logs as required by law). If necessary, we will also use data to investigate and prevent security incidents or abuse of our service, and to protect the rights and safety of Biobankly, our users, or others.

We do **not** use your data for advertising, marketing, or profiling purposes, and we do **not** make any automated decisions that produce legal or significant effects on you.

---

## Legal Bases for Processing (GDPR Compliance)
If you are located in the UK, EU, or another jurisdiction with similar laws, we process your personal data under the following legal bases:

- **Performance of a Contract**: Using your login credentials to authenticate you and provide the requested visualizations and analyses (Article 6(1)(b) GDPR).  
- **Legitimate Interests**: Processing aggregated usage data and limited account information to improve our product and ensure security (Article 6(1)(f) GDPR).  
- **Legal Obligation**: In rare cases, we may need to process or retain data to comply with a legal obligation (Article 6(1)(c) GDPR).  
- **Consent**: As of now, we do not rely on consent for any data processing. If we ever seek to collect additional information not covered by the above, we will obtain your consent where required.

---

## Data Storage and International Transfers
All personal data we collect (primarily your account/login data and aggregated usage statistics) is stored on secure servers in the **United Kingdom** by default. Storing data in the UK means it falls under the UK GDPR and Data Protection Act. If you are an EU/EEA user, the European Commission has determined the UK offers an adequate level of data protection, allowing for seamless data transfer in compliance with GDPR.

We do not routinely transfer or access your personal data outside of the UK. In the event we need to process or access data from another country (e.g., if our team uses a secure cloud backup), we will ensure that appropriate safeguards are in place (e.g., adequacy decisions or EU Standard Contractual Clauses). Our service may be accessed by users around the world, but regardless of your location we apply the same high standards of privacy protection.

---

## Data Retention
We only retain personal data for as long as necessary to fulfill the purposes described in this Policy, unless a longer retention period is required by law.

- **Account Information**: Kept as long as you maintain an account with Biobankly. If you delete your account, we will remove your personal details from our systems.  
- **Aggregated Data**: Aggregated, non-identifiable data may be retained indefinitely.  
- **Support Communications**: If you contact us and provide personal data, we may keep that correspondence for a period necessary to assist you and improve our services.  
- **Legal Requirements**: Any data required by law (e.g., certain server logs) will be kept for the legally mandated period, then deleted.

---

## Data Sharing and Disclosure

1. **No Selling of Data**  
   We do not sell your personal information to third parties, and we have not done so in the past 12 months. We also do not share personal data for third-party marketing or advertising purposes.

2. **No Third-Party Developer Access**  
   Currently, there is no third-party developer access to Biobankly data. Your data is accessible only to Biobankly and its necessary service providers.

3. **Service Providers**  
   We may share information with trusted third-party providers who perform functions on our behalf (e.g., cloud hosting, authentication, analytics). They are bound by contractual obligations to keep personal data confidential and to use it only for our instructed purposes.

   - **DNAnexus**: When you log in via DNAnexus OIDC, you are also subject to DNAnexus's privacy policy and terms as a user of their authentication and data-provider services. DNAnexus hosts many biobank repositories for users to access. Biobankly itself does not give DNAnexus any new personal data about you beyond what is necessary for the login.  
   - **Supabase**: We rely on **Supabase's OAuth** functionality to bridge user authentication with DNAnexus OIDC. By using Biobankly, you also agree to [Supabase's Terms of Service](https://supabase.com/terms) and [Privacy Policy](https://supabase.com/privacy).  

4. **Legal Compliance**  
   We may disclose your personal information if required to do so by law or in response to valid requests by public authorities.

5. **Business Transfers**  
   If Biobankly is involved in a merger, acquisition, or sale of assets, your data may be transferred as part of that deal, under the same level of protection described here.

6. **Public Data**  
   Biobankly uses publicly available schema and data structure information from biobank sources. This data is not about individuals and is already public.

---

## Your Rights and Choices
Depending on applicable laws (GDPR, CCPA, and others), you have rights to **access**, **rectify**, **erase**, **restrict**, **object**, **port**, and more:

- **Right to Access / Rectification / Erasure**  
- **Right to Restrict Processing / Object**  
- **Right to Data Portability**  
- **Right to Withdraw Consent** (if we rely on it in the future)  
- **Right to Non-Discrimination (CCPA)**  
- **Other Jurisdictions**: We will honor similar rights if applicable in your region.

To exercise these rights, please contact us (see **Contact Us**). We may need to verify your identity before acting on your request.

---

## Security Measures
We take data security seriously. Biobankly implements appropriate technical and organizational measures to protect your data (encryption in transit, secure storage of tokens, etc.). However, no system is 100% secure, and we cannot guarantee absolute protection. You should protect your login credentials and notify us if you suspect any breach.

---

## Cookies and Tracking
If Biobankly is accessed via the web, we may use cookies or similar technologies for functionality (e.g., session cookies for login) and internal analytics (aggregated usage). We do not use third-party advertising or social media tracking cookies. You can control or delete cookies through your browser settings, but disabling them may affect service functionality.

---

## Third-Party Links
Biobankly may provide links to external sites (e.g., DNAnexus documentation). We do not control these third-party sites or their privacy practices. We encourage you to review the privacy policies of any site you visit.

---

## Changes to This Privacy Policy
We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes (e.g., via an in-app notice or email) before they become effective. The "Last Updated" date at the top will indicate the most recent changes. Your continued use of Biobankly after any changes means you accept the revised policy.

---

## Contact Us 📧
If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:

**Biobankly**  
**Website**: [https://biobankly.com](https://biobankly.com)  
**Email**: [privacy@biobankly.com](mailto:privacy@biobankly.com)  
**Address**: Biobankly LTD, 128 City Road, London, EC1V 2NX, United Kingdom

We are here to help and will respond as promptly as we can (generally within 30 days for privacy requests). Thank you for trusting Biobankly with your data. We are dedicated to keeping that trust by protecting your privacy every step of the way. 🏅  

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
