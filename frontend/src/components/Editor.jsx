import React, { useState, useEffect } from 'react';

const PRESETS = {
  standard: {
    name: 'Standard Webhook',
    desc: 'Contains nulls, empty strings, and normal nesting.',
    data: {
      event: 'user.signup',
      timestamp: '2026-05-24T12:00:00Z',
      user: {
        id: 42,
        name: 'Jane Doe',
        email: 'jane@example.com',
        avatar: null,
        phone: ''
      },
      meta: {
        referred_by: null,
        campaign: 'summer_sale_2026',
        notes: ''
      }
    }
  },
  nested: {
    name: 'Deep Nesting',
    desc: 'Tests object flattening / dot-notation mapping.',
    data: {
      id: 'webhook_9921',
      action: 'payment.success',
      data: {
        customer: {
          profile: {
            first_name: 'John',
            last_name: 'Smith',
            middle_name: null
          },
          billing: {
            address: {
              line1: '123 Pine St',
              line2: '',
              city: 'San Francisco',
              zip: '94103'
            }
          }
        },
        amount: 4999
      }
    }
  },
  array: {
    name: 'Array Payload',
    desc: 'Lists with mixed valid and empty entries.',
    data: {
      batch_id: 'batch_01',
      items: [
        { item_id: 1, name: 'Premium Tier Subscription', discount: null },
        null,
        { item_id: 2, name: 'Setup Fee', discount: 10.0 },
        { item_id: 3, name: '', discount: null }
      ],
      tags: ['billing', '', 'automation', null, 'webhook']
    }
  }
};

export default function Editor({ inputJson, setInputJson, flatten, setFlatten, preserveArrayNulls, setPreserveArrayNulls, loading, onSubmit }) {
  const [isValidJson, setIsValidJson] = useState(true);
  const [jsonError, setJsonError] = useState('');

  // Validate JSON in real-time
  useEffect(() => {
    if (!inputJson.trim()) {
      setIsValidJson(true);
      setJsonError('');
      return;
    }
    try {
      JSON.parse(inputJson);
      setIsValidJson(true);
      setJsonError('');
    } catch (err) {
      setIsValidJson(false);
      setJsonError(err.message);
    }
  }, [inputJson]);

  const loadPreset = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setInputJson(JSON.stringify(preset.data, null, 2));
    }
  };

  return (
    <div className="panel editor-panel">
      <div className="panel-header">
        <div className="title-area">
          <span className="icon">📝</span>
          <h3>Input Payload</h3>
        </div>
        <div className={`status-badge ${inputJson.trim() ? (isValidJson ? 'status-valid' : 'status-invalid') : 'status-empty'}`}>
          {inputJson.trim() ? (isValidJson ? '✓ Valid JSON' : '✗ Invalid JSON') : 'Empty'}
        </div>
      </div>

      <div className="presets-container">
        <span className="presets-label">Load Preset:</span>
        <div className="preset-buttons">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className="preset-btn"
              onClick={() => loadPreset(key)}
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="editor-form">
        <div className="editor-wrapper">
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder='Paste your JSON payload here...&#10;e.g. {"id": 101, "meta": null, "data": {"text": ""}}'
            className="code-textarea"
            spellCheck="false"
          />
        </div>

        {jsonError && (
          <div className="json-error-banner">
            <span className="error-icon">⚠</span>
            <span className="error-text">{jsonError}</span>
          </div>
        )}

        <div className="controls-row">
          <div className="toggles-group">
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Flatten nested properties (underscore separation)</span>
            </label>

            <label className="toggle-container">
              <input
                type="checkbox"
                checked={preserveArrayNulls}
                onChange={(e) => setPreserveArrayNulls(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Preserve array alignments (empty values as null)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !inputJson.trim() || !isValidJson}
            className="submit-btn"
          >
            {loading ? (
              <span className="loader-inline">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            ) : (
              <>
                <span>Sanitize Output</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
