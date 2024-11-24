import React, { useState, useEffect } from 'react';
import { Book, Globe } from 'lucide-react';
import ISO6391 from 'iso-639-1';

interface DictionaryProps {
  word: string;
  language: string;
}

interface WordDefinition {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export default function Dictionary({ word, language }: DictionaryProps) {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDefinition() {
      if (!word) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Use different dictionary APIs based on the detected language
        let apiUrl = '';
        
        if (language === 'fr') {
          // French dictionary API
          apiUrl = `https://fr.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
        } else {
          // Default to English dictionary API
          apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(word)}`;
        }
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Word not found');
        }
        
        const data = await response.json();
        setDefinition(language === 'fr' ? formatFrenchDefinition(data) : data[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch definition');
        setDefinition(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDefinition();
  }, [word, language]);

  // Format French dictionary response to match our WordDefinition interface
  function formatFrenchDefinition(data: any): WordDefinition {
    return {
      word: data.title,
      meanings: data.definitions.map((def: any) => ({
        partOfSpeech: def.partOfSpeech,
        definitions: def.definitions.map((d: any) => ({
          definition: d.definition,
          example: d.examples?.[0]
        }))
      }))
    };
  }

  if (!word) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <Book className="w-12 h-12 mb-4" />
        <p>Select text from the PDF to look up its definition</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{word}</h2>
        <div className="flex items-center gap-2 text-gray-600">
          <Globe className="w-4 h-4" />
          <span>{ISO6391.getName(language)}</span>
        </div>
      </div>
      
      {loading && (
        <div className="text-gray-500">Loading...</div>
      )}
      
      {error && (
        <div className="text-red-500">{error}</div>
      )}
      
      {definition && (
        <div className="space-y-6">
          {definition.phonetic && (
            <div className="text-gray-600">{definition.phonetic}</div>
          )}
          
          {definition.meanings.map((meaning, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-600">
                {meaning.partOfSpeech}
              </h3>
              
              <ol className="list-decimal list-inside space-y-2">
                {meaning.definitions.map((def, defIndex) => (
                  <li key={defIndex} className="text-gray-700">
                    <span>{def.definition}</span>
                    {def.example && (
                      <p className="ml-6 mt-1 text-gray-500 italic">
                        "{def.example}"
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}