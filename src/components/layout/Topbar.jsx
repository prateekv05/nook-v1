"use client";

import { useRef, useState } from "react";

const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(d) {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Topbar({ currentView, setView, setSection, onShare }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const today = formatDate(new Date());

  function toggleSearch() {
    if (searchOpen) {
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
      // Focus input after the width transition starts
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function collapseSearch() {
    setSearchOpen(false);
  }

  function handleLogToday() {
    setSection("tracking");
    setView("expanded");
  }

  return (
    <div className="topbar">
      <div className="date-badge">{today}</div>

      <div className="tb-right">
        {/* Search */}
        <div className={`search-wrap${searchOpen ? " open" : ""}`}>
          <div className="search-inner">
            <div
              className="search-icon-btn"
              onClick={toggleSearch}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && toggleSearch()}
              aria-label="Toggle search"
            >
              <i className="ph-bold ph-magnifying-glass" />
            </div>
            <input
              ref={inputRef}
              className="search-input"
              placeholder="Search..."
              onBlur={collapseSearch}
              aria-label="Search"
            />
          </div>
        </div>

        {/* Notification bell */}
        <div
          className="notif-btn"
          role="button"
          tabIndex={0}
          aria-label="Notifications"
        >
          <i className="ph-bold ph-bell" />
          <div className="notif-dot" />
        </div>

        {/* Share */}
        <button className="log-btn-ghost" aria-label="Share" onClick={onShare}>
          <i className="ph-bold ph-share-network" />
          <span>Share</span>
        </button>

        {/* Log today */}
        <button className="log-btn" onClick={handleLogToday} aria-label="Log today">
          <i className="ph-bold ph-plus" />
          <span>Log today</span>
        </button>
      </div>
    </div>
  );
}
