# VocabulAI - Cinema-First Vocabulary Learning

VocabulAI is an interactive, premium educational application that transforms vocabulary learning into a cinematic experience. By leveraging generative AI, it defines complex words through the lens of popular TV universes, creating immersive script fragments and visual scenes to make learning memorable.

## ✨ Key Features

*   **Cinematic Definitions:** Learn words through generated scripts featuring characters from suitable TV universes (e.g., *The Big Bang Theory* for science, *Succession* for business).
*   **Visual Scene Generation:** Automatically generates a thematic image representing the word in action using FLUX.1.
*   **Personal Library:** Save words to your history, complete with generated images and contexts.
*   **User Authentication:** Secure login via Google (NextAuth.js) to manage your private collection.
*   **Rich Text Editor:** Built-in TipTap editor for taking notes or expanding on definitions.
*   **"Obsidian & Platinum" Design:** A premium, monochrome aesthetic featuring deep black backgrounds, silver accents, and glassmorphic effects.
*   **Pagination & Performance:** Optimized history view with server-side pagination and skeleton loading states.

## 🛠️ Tech Stack

*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **Database:** MongoDB (via Mongoose)
*   **Authentication:** NextAuth.js (Auth.js) v5
*   **Image Storage:** Cloudinary
*   **UI Components:** Shadcn/UI (Radix Primitives) + Lucide React Icons
*   **Editor:** TipTap
*   **AI Models (via Hugging Face):**
    *   **Text:** `meta-llama/Llama-3.1-8B-Instruct`
    *   **Image:** `black-forest-labs/FLUX.1-schnell`

## 🚀 Getting Started

### Prerequisites

*   Node.js (v20+ recommended)
*   MongoDB Atlas Account (or local MongoDB)
*   Cloudinary Account
*   Google Cloud Console Project (for OAuth)
*   Hugging Face API Token

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/vocab-ai.git
    cd vocab-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    # AI Providers
    HF_TOKEN=your_hugging_face_token

    # Database
    MONGODB_URI=your_mongodb_connection_string

    # Authentication (NextAuth.js)
    AUTH_SECRET=your_generated_secret_key # Run `npx auth secret` to generate
    AUTH_GOOGLE_ID=your_google_client_id
    AUTH_GOOGLE_SECRET=your_google_client_secret

    # Image Storage
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design System

VocabulAI features a custom **"Obsidian & Platinum"** theme:

*   **Background:** Deep obsidian (`oklch(0.05 0 0)`) with white/silver radial spotlights.
*   **Accents:** Platinum (`oklch(0.98 0 0)`) and Silver (`oklch(0.8 0 0)`).
*   **Typography:** `Geist Sans` for headings, `Serif` italic for dialogue.

## 📂 Project Structure

*   `app/page.tsx`: Main search and generation interface.
*   `app/history/`: User's saved vocabulary library (Paginated).
*   `app/word/[word]/`: Detailed view for a specific saved word.
*   `app/api/`: Backend routes for AI generation, DB operations, and Auth.
*   `models/`: Mongoose schemas (User, WordHistory).
*   `components/`: Reusable UI components and specialized features like the `TipTap` editor.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

**VocabulAI** — Master words through the magic of storytelling.
