# VocabAI 2.0 - Cinema-First Vocabulary Learning

VocabAI 2.0 is an interactive, premium educational application that transforms vocabulary learning into a cinematic experience. By leveraging generative AI, it defines complex words through the lens of popular TV universes, creating immersive script fragments and visual scenes to make learning memorable.

## ✨ Key Features

*   **Cinematic Definitions:** Learn words through generated scripts featuring characters from suitable TV universes (e.g., *The Big Bang Theory* for science, *Succession* for business).
*   **Visual Scene Generation:** Automatically generates a thematic image representing the word in action using FLUX.1.
*   **"Obsidian & Platinum" Design:** A premium, monochrome aesthetic featuring deep black backgrounds, silver accents, and glassmorphic effects.
*   **Script Fragment View:** Displays dialogue in a professional screenplay format.
*   **Data HUD:** A futuristic card layout for synonyms, antonyms, and context, designed for clarity and style.

## 🛠️ Tech Stack

*   **Framework:** Next.js 16 (App Router)
*   **Styling:** Tailwind CSS v4
*   **UI Components:** Shadcn/UI (Radix Primitives) + Lucide React Icons
*   **AI Models (via Hugging Face):**
    *   **Text:** `meta-llama/Llama-3.1-8B-Instruct`
    *   **Image:** `black-forest-labs/FLUX.1-schnell`
*   **Language:** TypeScript

## 🚀 Getting Started

### Prerequisites

*   Node.js (v20+ recommended)
*   A Hugging Face API Token (Free tier works)

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
    Create a `.env.local` file in the root directory:
    ```env
    HF_TOKEN=your_hugging_face_token_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design System

VocabAI 2.0 features a custom **"Obsidian & Platinum"** theme:

*   **Background:** Deep obsidian (`oklch(0.05 0 0)`) with white/silver radial spotlights.
*   **Accents:** Platinum (`oklch(0.98 0 0)`) and Silver (`oklch(0.8 0 0)`).
*   **Visual Cues:**
    *   Synonyms: Subtle **Emerald** tint.
    *   Antonyms: Subtle **Rose** tint.
*   **Typography:**
    *   Headings: `Geist Sans` (Modern, geometric).
    *   Scripts: `Serif` italic for dialogue, `Mono` uppercase for character names.

## 📂 Project Structure

*   `app/page.tsx`: The main application logic and UI.
*   `app/globals.css`: Global styles, theme variables, and background gradients.
*   `app/api/generate/route.ts`: API route for text/script generation (Llama 3.1).
*   `app/api/image/route.ts`: API route for scene generation (FLUX.1).
*   `components/ui/`: Reusable Shadcn UI components.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

**VocabAI 2.0** — Master words through the magic of storytelling.

**Deploying in Vercel**