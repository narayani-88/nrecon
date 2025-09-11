# Nrecon - Ethical Reconnaissance Tool

Nrecon is a web-based, ethical reconnaissance and security scanning tool designed for security professionals, developers, and pentesters. It combines essential data gathering techniques with AI-powered risk analysis to provide a comprehensive overview of a target's public-facing security posture.

## How to Run Locally

Running this project requires starting two separate processes: one for the Next.js frontend and another for the Genkit AI server.

1.  **Set up Environment Variables**:
    *   This project uses the Google Gemini API. You will need an API key to run the AI-powered analysis.
    *   Get a free API key from **[Google AI Studio](https://aistudio.google.com/)**.
    *   In the root of the project, create a new file named `.env`.
    *   Add your API key to the `.env` file like this:
        ```
        GEMINI_API_KEY=YOUR_API_KEY_HERE
        ```

2.  **Install Dependencies**:
    Open a terminal and run `npm install` to get all the necessary packages.
    ```bash
    npm install
    ```

3.  **Run Genkit AI Server**:
    In one terminal, start the Genkit server. This powers the AI analysis.
    ```bash
    npm run genkit:watch
    ```

4.  **Run the Web App**:
    In a second terminal, start the Next.js development server.
    ```bash
    npm run dev
    ```

5.  **Access the App**:
    Open your browser and navigate to `http://localhost:9002`.

## How to Deploy

The best way to deploy Nrecon is by using Firebase App Hosting.

1.  **Login to Firebase**:
    ```bash
    firebase login
    ```

2.  **Initialize Firebase in your project**:
    This will connect your local code to a Firebase project.
    ```bash
    firebase init apphosting
    ```

3.  **Deploy the application**:
    ```bash
    firebase deploy
    ```
    After the command completes, you will get a public URL for your live application.

## Key Features

*   **Ethical Scanning by Design**: A mandatory consent checkbox ensures that users have explicit permission to scan the target, promoting responsible use.
*   **AI-Powered Risk Analysis**: Utilizes Google's Gemini model via Genkit to analyze scan results, assess risk levels for each finding, and provide concise, actionable remediation suggestions.
*   **Comprehensive Data Gathering**:
    *   **Passive Recon**: Performs DNS lookups (A, AAAA, MX, NS), WHOIS queries, and GeoIP location.
    *   **Active Probes**: Conducts TCP connect scans on common ports to identify open services and grab banners.
*   **Interactive Dashboard**: Presents scan results in a clean, tabbed interface, separating the AI Risk Report, Port Scan details, DNS records, and WHOIS information.
*   **Client-Side Scan History**: Keeps a log of your recent scans in your browser's local storage, allowing you to quickly review past results without re-scanning.
*   **PDF Report Export**: Generate and download a professional PDF summary of the scan results with a single click.
*   **Modern, Responsive UI**: Built with ShadCN UI and Tailwind CSS for a sleek, responsive, and dark-mode-ready interface.
