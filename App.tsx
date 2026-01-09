
import React, { useState } from 'react';
import LiveAssistant from './components/LiveAssistant';
import TextGenerator from './components/TextGenerator';
import MapView from './components/MapView';
import AboutProject from './components/AboutProject';
import ContactUs from './components/ContactUs';
import { SparklesIcon, TextIcon, SteeringWheelIcon, MapIcon, InfoIcon, MailIcon } from './components/Icons';

export type Tab = 'assistant' | 'map' | 'generator' | 'about' | 'contact';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('about');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'assistant':
        return <LiveAssistant />;
      case 'map':
        return <MapView />;
      case 'generator':
        return <TextGenerator />;
      case 'about':
        return <AboutProject onNavigate={setActiveTab} />;
      case 'contact':
        return <ContactUs />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactElement }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${
        activeTab === tab
          ? 'bg-background text-primary border-b-2 border-primary'
          : 'text-gray-300 hover:bg-white/5 hover:text-primary'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans flex flex-col">
      <header className="bg-background/80 backdrop-blur-sm shadow-lg shadow-primary/10 sticky top-0 z-10 w-full">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Smart Road Assistant
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 flex flex-col">
        <div className="border-b border-white/10 mb-4">
          <nav className="flex -mb-px space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
            <TabButton tab="about" label="Home" icon={<InfoIcon className="w-5 h-5" />} />
            <TabButton tab="assistant" label="Assistant" icon={<SteeringWheelIcon className="w-5 h-5" />} />
            <TabButton tab="map" label="Map" icon={<MapIcon className="w-5 h-5" />} />
            <TabButton tab="generator" label="AI Studio" icon={<TextIcon className="w-5 h-5" />} />
            <TabButton tab="contact" label="Contact" icon={<MailIcon className="w-5 h-5" />} />
          </nav>
        </div>
        <div className="flex-grow bg-background rounded-lg shadow-2xl shadow-black/30 overflow-hidden">
          {renderTabContent()}
        </div>
      </main>

       <footer className="text-center py-4 text-xs text-gray-400">
          Powered by Gemini • Smart Road Infrastructure Control
      </footer>
    </div>
  );
};

export default App;
