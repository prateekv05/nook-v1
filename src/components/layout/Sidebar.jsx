"use client";

import { useTheme } from "../../hooks/useTheme";
import { createClient } from "../../lib/supabase";

const NAV_ITEMS = [
  { id: "home",      label: "Dashboard", icon: "ph-house",          view: "home" },
  { id: "financial", label: "Financial", icon: "ph-currency-dollar", view: "expanded", section: "financial" },
  { id: "knowledge", label: "Knowledge", icon: "ph-book-open",       view: "expanded", section: "knowledge" },
  { id: "lifestyle", label: "Lifestyle", icon: "ph-heart",           view: "expanded", section: "lifestyle" },
  { id: "tracking",  label: "Tracking",  icon: "ph-chart-line-up",   view: "expanded", section: "tracking" },
];

const THEMES = [
  { id: "regular", icon: "ph-sun",    label: "Regular" },
  { id: "dark",    icon: "ph-moon",   label: "Dark" },
  { id: "calm",    icon: "ph-coffee", label: "Calm" },
];

export default function Sidebar({ currentView, setView, currentSection, setSection }) {
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function handleNav(item) {
    if (item.view === "expanded") {
      setSection(item.section);
      setView("expanded");
    } else {
      setView(item.view);
    }
  }

  function isActive(item) {
    if (item.view === "home") return currentView === "home";
    if (item.view === "expanded") return currentView === "expanded" && currentSection === item.section;
    return false;
  }

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="s-logo-row">
        <div className="s-logo">N</div>
        <div className="s-app-name">Nook</div>
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className={`s-item${isActive(item) ? " active" : ""}`}
          onClick={() => handleNav(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleNav(item)}
          aria-current={isActive(item) ? "page" : undefined}
        >
          <i className={`ph-bold ${item.icon}`} />
          <span className="s-item-label">{item.label}</span>
        </div>
      ))}

      <div className="s-spacer" />
      <div className="s-divider" />

      {/* Dev: Onboarding preview link */}
      <a
        href="/onboarding"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, color: 'var(--sb-icon)', fontSize: 13, textDecoration: 'none', transition: 'all 0.2s', marginBottom: 4 }}
        onMouseOver={e => e.currentTarget.style.background = 'var(--sb-active)'}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        <i className="ph-bold ph-rocket-launch" />
        <span className="s-item-label">Onboarding</span>
      </a>

      <div className="s-divider" />

      {/* Theme toggle */}
      <div className="s-theme-wrap">
        <div className="s-theme-label">Appearance</div>
        <div className="theme-toggle">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`tt-btn${theme === t.id ? " active" : ""}`}
              onClick={() => setTheme(t.id)}
              aria-label={t.label}
            >
              <i className={`ph-bold ${t.icon}`} />
              <div className="tt-tooltip">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="s-divider" />

      {/* Settings */}
      <div
        className={`s-item${currentView === "settings" ? " active" : ""}`}
        onClick={() => setView("settings")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setView("settings")}
        aria-current={currentView === "settings" ? "page" : undefined}
      >
        <i className="ph-bold ph-gear" />
        <span className="s-item-label">Settings</span>
      </div>

      {/* User row */}
      <div className="s-user-row">
        <div className="s-avatar">AL</div>
        <span className="s-user-name">Alex Lewis</span>
        <button
          className="s-logout-btn"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <i className="ph-bold ph-sign-out" />
        </button>
      </div>
    </div>
  );
}
