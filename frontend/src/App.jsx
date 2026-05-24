import React, { useState } from 'react';
import { usePayloadSubmit } from './hooks/usePayloadSubmit';
import Editor from './components/Editor';
import Results from './components/Results';

export default function App() {
  const [inputJson, setInputJson] = useState('');
  const [flatten, setFlatten] = useState(false);
  const [preserveArrayNulls, setPreserveArrayNulls] = useState(false);
  const { submitPayload, result, error, loading } = usePayloadSubmit();

  const handleProcess = (e) => {
    e.preventDefault();
    submitPayload(inputJson, { flatten, preserveArrayNulls });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <span className="logo-icon">🧼</span>
          <div className="logo-text">
            <h1>Payload Sanitizer</h1>
            <span className="logo-tag">Pipeline stage buffer</span>
          </div>
        </div>
        <p className="app-subtitle">
          Strips empty strings, nulls, and undefined parameters to protect Make.com, Zapier, and database pipelines from ingestion crashes.
        </p>
      </header>

      <main className="app-main">
        <Editor
          inputJson={inputJson}
          setInputJson={setInputJson}
          flatten={flatten}
          setFlatten={setFlatten}
          preserveArrayNulls={preserveArrayNulls}
          setPreserveArrayNulls={setPreserveArrayNulls}
          loading={loading}
          onSubmit={handleProcess}
        />
        
        <Results
          result={result}
          error={error}
          loading={loading}
          inputJson={inputJson}
        />
      </main>

      <footer className="app-footer">
        <p>Deterministic recursive sanitization buffer. Pure functional utility engine.</p>
      </footer>
    </div>
  );
}
