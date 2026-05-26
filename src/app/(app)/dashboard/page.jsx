"use client";

import { useState } from "react";
import Sidebar from "../../../components/layout/Sidebar";
import Topbar from "../../../components/layout/Topbar";
import GreetingBanner from "../../../components/layout/GreetingBanner";
import FinanceSection from "../../../components/sections/FinanceSection";
import KnowledgeSection from "../../../components/sections/KnowledgeSection";
import LifestyleSection from "../../../components/sections/LifestyleSection";
import TrackingSection from "../../../components/sections/TrackingSection";

const SECTION_MAP = {
  financial: FinanceSection,
  knowledge: KnowledgeSection,
  lifestyle: LifestyleSection,
  tracking:  TrackingSection,
};

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState("home");
  const [currentSection, setCurrentSection] = useState(null);

  function setView(view) {
    setCurrentView(view);
  }

  function setSection(section) {
    setCurrentSection(section);
  }

  const SectionComponent = currentSection ? SECTION_MAP[currentSection] : null;

  // key re-mounts the view, re-triggering the fade-up animation on every navigation
  const viewKey = currentView === "expanded" ? `expanded-${currentSection}` : currentView;

  return (
    <div className="shell">
      <Sidebar
        currentView={currentView}
        setView={setView}
        currentSection={currentSection}
        setSection={setSection}
      />

      <div className="main">
        <Topbar
          currentView={currentView}
          setView={setView}
          setSection={setSection}
        />

        <div className="view-content">
          <div key={viewKey} className="view-enter">
            {currentView === "home" && (
              <div id="home-view">
                <GreetingBanner />
                {/* HeroGrid — Phase 2.3 */}
                <div id="hero-grid-placeholder" style={{ padding: "14px 16px", color: "var(--text-3)", fontSize: 13 }}>
                  HeroGrid — Phase 2
                </div>
              </div>
            )}

            {currentView === "expanded" && SectionComponent && (
              <div id="expanded-view">
                <SectionComponent
                  onBack={() => setView("home")}
                  currentSection={currentSection}
                  setSection={setSection}
                  setView={setView}
                />
              </div>
            )}

            {currentView === "settings" && (
              <div id="settings-view">
                {/* SettingsView — Phase 5.1 */}
                <div style={{ padding: 32, color: "var(--text-3)", fontSize: 13 }}>
                  Settings — Phase 5
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
