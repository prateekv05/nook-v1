'use client';

import { useState } from 'react';

export default function Step07Location({ state, setState, onNext }) {
  const loc = state.location;
  const canContinue = loc.city.trim().length > 0;

  function set(key, val) {
    setState(s => ({ ...s, location: { ...s.location, [key]: val } }));
  }

  function handleStateInput(e) {
    const pos = e.target.selectionStart;
    const upper = e.target.value.toUpperCase();
    set('state', upper);
    requestAnimationFrame(() => e.target.setSelectionRange(pos, pos));
  }

  function handleZipInput(e) {
    set('zip', e.target.value.replace(/[^\d-]/g, ''));
  }

  return (
    <>
      <div className="ob-heading-block">
        <h1 className="ob-headline">Where are you based?</h1>
        <p className="ob-subtext">Helps us surface relevant content and local time zones.</p>
      </div>

      <form className="ob-form" noValidate onSubmit={e => { e.preventDefault(); if (canContinue) onNext(); }}>
        <div className="ob-field">
          <label className="ob-field-label" htmlFor="s7-country">Country</label>
          <input
            className="ob-input"
            type="text"
            id="s7-country"
            name="country"
            placeholder="United States"
            autoComplete="country-name"
            autoCapitalize="words"
            value={loc.country}
            onChange={e => set('country', e.target.value)}
          />
        </div>

        <div className="ob-field">
          <label className="ob-field-label" htmlFor="s7-city">City</label>
          <input
            className="ob-input"
            type="text"
            id="s7-city"
            name="city"
            placeholder="San Francisco"
            autoComplete="address-level2"
            autoCapitalize="words"
            required
            value={loc.city}
            onChange={e => set('city', e.target.value)}
          />
        </div>

        <div className="ob-form-row">
          <div className="ob-field">
            <label className="ob-field-label" htmlFor="s7-state">State</label>
            <input
              className="ob-input"
              type="text"
              id="s7-state"
              name="state"
              placeholder="CA"
              autoComplete="address-level1"
              maxLength={2}
              value={loc.state}
              onChange={handleStateInput}
            />
          </div>
          <div className="ob-field">
            <label className="ob-field-label" htmlFor="s7-zip">ZIP code</label>
            <input
              className="ob-input"
              type="text"
              id="s7-zip"
              name="zip"
              placeholder="94103"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={10}
              value={loc.zip}
              onChange={handleZipInput}
            />
          </div>
        </div>

        <div className="ob-privacy-note" role="note" style={{ marginTop: '4px' }}>
          <i className="ph-bold ph-map-pin" />
          <p>Your location is never shared publicly. Used only for personalisation.</p>
        </div>
      </form>

      <div className="ob-cta-area">
        <button
          type="button"
          className="ob-cta-btn"
          aria-disabled={!canContinue}
          onClick={() => { if (canContinue) onNext(); }}
        >
          Continue
          <i className="ph-bold ph-arrow-right" />
        </button>
      </div>
    </>
  );
}
