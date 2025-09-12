# **App Name**: Reconnaissance Lab

## Core Features:

- Target Input & Consent: Accepts target IP/hostname input and requires explicit user consent via checkbox before initiating any scans.
- Passive Data Gathering: Collects passive data such as DNS records (A, AAAA, MX, NS), reverse DNS, WHOIS lookup, and GeoIP information. Use a tool to validate if the host responds to pings.
- Active Probes: Performs TCP connect scans on a configurable set of common ports (e.g., 22, 80, 443, 3306, 3389) and grabs banners, HTTP headers and response statuses where available.
- Risk Assessment and Reporting: Analyzes scan results, assesses risk level per finding, and generates a concise report.
- Results Dashboard: Displays scan results in a consolidated dashboard with sections for each type of information.
- Scan History: Logs all scan actions, including timestamps and user information, for audit purposes.
- Terms Check: Clear terms checkbox that validates permission to scan target. Logs all actions and can perform rate-limiting to prevent abuse.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) to evoke a sense of security and control.
- Background color: Light grey (#F5F5F5), creating a clean and non-distracting backdrop.
- Accent color: Teal (#009688) to highlight important elements and CTAs, offering a visual contrast.
- Body and headline font: 'Inter' sans-serif, offering a modern, machined and neutral look that’s perfect for headlines or body text.
- Simple and consistent icons to represent different scan types and results, following a flat design style.
- Dashboard layout with a left column for quick summary and right column for detailed sections.
- Subtle transitions and animations for loading data and displaying results.