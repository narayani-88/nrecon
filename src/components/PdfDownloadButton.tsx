'use client';

import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PdfDownloadButtonProps {
  elementId: string;
  fileName?: string;
  buttonText?: string;
  className?: string;
}

export function PdfDownloadButton({
  elementId,
  fileName = 'report',
  buttonText = 'Download PDF',
  className = '',
}: PdfDownloadButtonProps) {
  const downloadPdf = async () => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error('Element not found');
        return;
      }

      // Add a small delay to ensure the content is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert the element to a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Increase for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Create a new PDF with the canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate the ratio to fit the content on the page
      const imgWidth = pageWidth - 20; // Add margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Button 
      onClick={downloadPdf}
      variant="outline"
      className={`gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      {buttonText}
    </Button>
  );
}
