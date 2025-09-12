declare module 'jspdf' {
  interface jsPDF {
    addImage(
      imageData: string | HTMLImageElement | HTMLCanvasElement,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: 'NONE' | 'FAST' | 'MEDIUM' | 'SLOW',
      rotation?: number
    ): jsPDF;
    
    save(filename: string): void;
    
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
  }
  
  interface jsPDFOptions {
    orientation?: 'p' | 'portrait' | 'l' | 'landscape';
    unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc';
    format?: string | number[];
  }
  
  const jsPDF: {
    new (options?: jsPDFOptions): jsPDF;
  };
  
  export = jsPDF;
}
