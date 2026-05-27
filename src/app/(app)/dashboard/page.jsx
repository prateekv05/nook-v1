"use client";

import { useState } from "react";
import Sidebar from "../../../components/layout/Sidebar";
import Topbar from "../../../components/layout/Topbar";
import GreetingBanner from "../../../components/layout/GreetingBanner";
import HeroGrid from "../../../components/home/HeroGrid";
import FinanceSection from "../../../components/sections/FinanceSection";
import KnowledgeSection from "../../../components/sections/KnowledgeSection";
import LifestyleSection from "../../../components/sections/LifestyleSection";
import TrackingSection from "../../../components/sections/TrackingSection";
import SettingsView from "../../../components/settings/SettingsView";
import ShareModal from "../../../components/ui/ShareModal";

const SECTION_MAP = {
  financial: FinanceSection,
  knowledge: KnowledgeSection,
  lifestyle: LifestyleSection,
  tracking:  TrackingSection,
};

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState("home");
  const [currentSection, setCurrentSection] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div
        className={`mobile-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar
        currentView={currentView}
        setView={(v) => { setView(v); setSidebarOpen(false); }}
        currentSection={currentSection}
        setSection={(s) => { setSection(s); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
      />

      <div className="main">
        <Topbar
          currentView={currentView}
          setView={setView}
          setSection={setSection}
          onShare={() => setShareOpen(true)}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        <div className="view-content">
          <div key={viewKey} className="view-enter">
            {currentView === "home" && (
              <div id="home-view">
                <GreetingBanner />
                <HeroGrid setView={setView} setSection={setSection} />
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
              <div id="settings-view" style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                <SettingsView />
              </div>
            )}
          </div>
        </div>
      </div>
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
