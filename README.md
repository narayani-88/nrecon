# Nrecon: Ethical Reconnaissance Lab

Nrecon is a web-based, ethical reconnaissance and security scanning tool designed to help security professionals and developers assess the security posture of a given target. It combines passive data gathering with active probes and leverages AI to provide a clear risk assessment and actionable remediation advice.

Built with a modern tech stack including Next.js, Genkit, and ShadCN UI, Nrecon provides a seamless and intuitive user experience.

## Getting Started

To get the application running on your local machine, follow these steps:

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1.  Clone the repository or download the source code.
2.  Open your terminal in the project directory.
3.  Install the required dependencies:
    ```bash
    npm install
    ```

### Running the Development Servers

This project requires two processes to run concurrently for development: the Next.js frontend and the Genkit AI server.

1.  **Start the Genkit AI Server**:
    In your terminal, run the following command to start the Genkit development server, which will watch for changes in your AI flows.
    ```bash
    npm run genkit:watch
    ```

2.  **Start the Next.js Frontend**:
    In a **new, separate terminal window**, run the following command to start the Next.js development server.
    ```bash
    npm run dev
    ```

3.  **Open the App**:
    Once both servers are running, open your web browser and navigate to `http://localhost:9002` (or the URL provided by the `npm run dev` command).

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
