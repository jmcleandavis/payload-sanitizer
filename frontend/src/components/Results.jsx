import React, { useState, useEffect } from 'react';

// Utility to recursively count the total keys/values in an object
function countKeys(obj) {
  if (typeof obj !== 'object' || obj === null) return 0;
  let count = 0;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      count += countKeys(item);
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      count += 1;
      count += countKeys(value);
    }
  }
  return count;
}

export default function Results({ result, error, loading, inputJson }) {
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // Compute metrics when result changes
  useEffect(() => {
    if (!result) {
      setMetrics(null);
      return;
    }

    try {
      const inputObj = JSON.parse(inputJson);
      const inputStr = JSON.stringify(inputObj);
      const outputStr = JSON.stringify(result);

      const inputKeyCount = countKeys(inputObj);
      const outputKeyCount = countKeys(result);
      const removedKeys = inputKeyCount - outputKeyCount;

      const inputBytes = new Blob([inputStr]).size;
      const outputBytes = new Blob([outputStr]).size;
      const reduction = inputBytes > 0 
        ? Math.max(0, Math.round(((inputBytes - outputBytes) / inputBytes) * 100))
        : 0;

      setMetrics({
        inputSize: inputBytes,
        outputSize: outputBytes,
        reduction,
        removedKeys: removedKeys >= 0 ? removedKeys : 0
      });
    } catch (e) {
      setMetrics(null);
    }
  }, [result, inputJson]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sanitized_payload_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel results-panel">
      <div className="panel-header">
        <div className="title-area">
          <span className="icon">✨</span>
          <h3>Processed Output</h3>
        </div>
        
        {result && !loading && (
          <div className="action-buttons">
            <button 
              onClick={handleCopy} 
              className={`action-btn copy-btn ${copied ? 'copied' : ''}`}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button 
              onClick={handleDownload} 
              className="action-btn download-btn"
              title="Download JSON file"
            >
              💾 Download
            </button>
          </div>
        )}
      </div>

      <div className="results-container">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Cleaning payload...</p>
          </div>
        )}

        {error && (
          <div className="error-card">
            <div className="error-header">
              <span className="error-badge">Processing Error</span>
            </div>
            <p className="error-message">{error}</p>
          </div>
        )}

        {result && !loading && (
          <>
            {metrics && (
              <div className="metrics-dashboard">
                <div className="metric-card">
                  <span className="metric-value">{metrics.reduction}%</span>
                  <span className="metric-label">Payload Reduction</span>
                </div>
                <div className="metric-card">
                  <span className="metric-value">{metrics.removedKeys}</span>
                  <span className="metric-label">Keys Stripped</span>
                </div>
                <div className="metric-card">
                  <span className="metric-value">{metrics.outputSize} B</span>
                  <span className="metric-label">Final Size (Input: {metrics.inputSize} B)</span>
                </div>
              </div>
            )}
            
            <div className="code-viewer-wrapper">
              <pre className="code-viewer">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            </div>
          </>
        )}

        {!result && !error && !loading && (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <h4>Ready to Process</h4>
            <p>Paste a payload on the left and click "Sanitize Output" to see the cleaned results here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
