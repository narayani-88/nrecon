at    ```bash
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
