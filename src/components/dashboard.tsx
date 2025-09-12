import { Button } from '@/components/ui/button';

export function Dashboard({ data }: DashboardProps) {
  const handleDownloadReport = async () => {
    try {
      // Fetch the report from the API endpoint
      const response = await fetch('/api/downloadReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send the scan data to the API
      });

      if (response.ok) {
        // Get the report file from the response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan-report-${data.scanData.target}.pdf`; // Set the filename
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download report:', response.statusText);
        // Handle the error (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      // Handle the error
    }
  };

  return (
    <>
      {/* ... your dashboard content ... */}
      <Button onClick={handleDownloadReport}>Download Report</Button>
    </>
  );
}