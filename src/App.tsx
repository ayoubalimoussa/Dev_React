import React, { useState } from 'react';
import PDFViewer from './components/PDFViewer';
import Dictionary from './components/Dictionary';
import { BookOpen } from 'lucide-react';

function App() {
  const [selectedWord, setSelectedWord] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                PDF Dictionary
              </h1>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {isSidebarOpen ? 'Hide Dictionary' : 'Show Dictionary'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm">
          <div className={`flex-1 ${isSidebarOpen ? 'border-r' : ''}`}>
            <PDFViewer onTextSelect={setSelectedWord} />
          </div>
          
          {isSidebarOpen && (
            <div className="w-96 overflow-y-auto">
              <Dictionary word={selectedWord} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;