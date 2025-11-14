# Dodo - UKB Phenotype Network Visualisation

![Dodo Project Banner](https://dodo.biobankly.com/og-image.png)

**Live Application:** [**dodo.biobankly.com**](https://dodo.biobankly.com)

Dodo is a powerful, interactive web application for visualising UK Biobank phenotype networks at scale. Born from research at [Biobankly LTD](https://dodo.biobankly.com), this tool is designed to help researchers and scientists explore real-world phenotype connections, discover patterns, and extract high-impact signals from the UK Biobank cohort.

This repository contains the full source code for the Dodo application.

---

## ✨ Key Features

* **Interactive Tree Visualisations:** Uses **D3.js** to render fast, interactive TidyTree and Radial TidyTree layouts for complex hierarchical data.
* **Advanced Filtering:** Interactively map, filter, and extract high-impact signals.
* **Cluster Navigation:** Seamlessly zoom into and explore specific phenotype groupings to uncover meaningful patterns.
* **Data Export:** Select and export nodes, edges, or entire views for offline analysis.
* **Insight Generation:** View automatically generated summaries to quickly understand group dynamics and outliers.

---

## 💻 Technology Stack

This project is built with a modern, full-stack JavaScript stack:

* **Framework:** [**Next.js (React)**](https://nextjs.org/)
* **Language:** [**TypeScript**](https://www.typescriptlang.org/)
* **Styling:** [**Tailwind CSS**](https://tailwindcss.com/)
* **Data Visualisation:** [**D3.js**](https://d3js.org/)
* **Backend & Database:** [**Supabase**](https://supabase.com/) (Postgres, Auth, Realtime)
* **Deployment:** [**Vercel**](https://vercel.com/) (Frontend) & [**Supabase**](https://supabase.com/) (Backend/DB)
* **Runtime:** [**Node.js**](https://nodejs.org/)

---

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

You will need the following tools installed on your system:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` (comes with Node.js)
* A free [Supabase](https://supabase.com) account to host your own database.

### Installation & Setup

1.  **Clone the repo:**
    ```sh
    git clone [https://github.com/donphi/dodo.git](https://github.com/donphi/dodo.git)
    cd dodo
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Supabase Environment:**
    * Log in to your Supabase account and create a new project.
    * Go to your project's **Settings > API**.
    * Find your **Project URL** and **Project API Keys** (the `public` `anon` key).
    * Create a `.env.local` file in the root of the `dodo` directory by copying the example:
        ```sh
        cp .env.example .env.local
        ```
    * Edit the `.env.local` file and add your Supabase credentials:
        ```env
        NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL_HERE"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY_HERE"
        ```
    * **Note:** You will also need to run the database migrations/seed data to populate your database. (You should add instructions here on how to do that, e.g., `npx supabase db push` or by running a seed script).

### Running Locally

1.  **Start the development server:**
    ```sh
    npm run dev
    ```

2.  Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) in your browser.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## Acknowledgements

* [UK Biobank](https://www.ukbiobank.ac.uk/)
* [Next.js](https://nextjs.org/)
* [D3.js](https://d3js.org/)
* [Supabase](https://supabase.com/)
* [Vercel](https://vercel.com/)
