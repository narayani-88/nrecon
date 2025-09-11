# Nrecon: Ethical Reconnaissance Lab

Nrecon is a web-based, ethical reconnaissance and security scanning tool designed to help security professionals and developers assess the security posture of a given target. It combines passive data gathering with active probes and leverages AI to provide a clear risk assessment and actionable remediation advice.

Built with a modern tech stack including Next.js, Genkit, and ShadCN UI, Nrecon provides a seamless and intuitive user experience.

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
