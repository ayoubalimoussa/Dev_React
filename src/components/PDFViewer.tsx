import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Play, Pause, StopCircle, Globe } from 'lucide-react';
import 'pdfjs-dist/build/pdf.worker.entry';
import { detect } from 'langdetect';
import ISO6391 from 'iso-639-1';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  onTextSelect: (text: string, language: string) => void;
}

export default function PDFViewer({ onTextSelect }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [file, setFile] = useState<string | null>(null);
  const [pageText, setPageText] = useState<string>('');
  const [isReading, setIsReading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  async function onPageLoadSuccess(page: any) {
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    setPageText(text);
    
    try {
      const detectedLang = detect(text);
      if (detectedLang && detectedLang[0]) {
        setDetectedLanguage(detectedLang[0].lang);
      }
    } catch (error) {
      console.error('Language detection failed:', error);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setFile(URL.createObjectURL(file));
      stopReading();
    }
  }

  function handleTextSelection() {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      onTextSelect(selectedText, detectedLanguage);
    }
  }

  function startReading() {
    if (pageText) {
      stopReading();
      utteranceRef.current = new SpeechSynthesisUtterance(pageText);
      utteranceRef.current.lang = detectedLanguage;
      
      const voices = speechSynthesis.getVoices();
      const languageVoice = voices.find(voice => voice.lang.startsWith(detectedLanguage));
      if (languageVoice) {
        utteranceRef.current.voice = languageVoice;
      }
      
      utteranceRef.current.onend = () => setIsReading(false);
      speechSynthesis.speak(utteranceRef.current);
      setIsReading(true);
    }
  }

  function pauseReading() {
    speechSynthesis.pause();
    setIsReading(false);
  }

  function resumeReading() {
    speechSynthesis.resume();
    setIsReading(true);
  }

  function stopReading() {
    speechSynthesis.cancel();
    setIsReading(false);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {detectedLanguage && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="w-4 h-4" />
                <span>{ISO6391.getName(detectedLanguage)}</span>
              </div>
            )}
          </div>
          {file && (
            <div className="flex gap-2">
              {!isReading ? (
                <button
                  onClick={startReading}
                  className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Read</span>
                </button>
              ) : (
                <button
                  onClick={pauseReading}
                  className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={stopReading}
                className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-2"
              >
                <StopCircle className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4" onMouseUp={handleTextSelection}>
        {file ? (
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              onLoadSuccess={onPageLoadSuccess}
            />
          </Document>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Please select a PDF file to view
          </div>
        )}
      </div>

      {file && (
        <div className="bg-white p-4 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setPageNumber(page => Math.max(page - 1, 1));
              stopReading();
            }}
            disabled={pageNumber <= 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => {
              setPageNumber(page => Math.min(page + 1, numPages));
              stopReading();
            }}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}