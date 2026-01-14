
import React, { useState, useRef } from 'react';
import LiveAssistant, { LiveAssistantHandle } from './components/LiveAssistant';
import MapView from './components/MapView';
import AboutProject from './components/AboutProject';
import ContactUs from './components/ContactUs';
import { SparklesIcon, SteeringWheelIcon, MapIcon, InfoIcon, MailIcon } from './components/Icons';

export type Tab = 'assistant' | 'map' | 'about' | 'contact';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const assistantRef = useRef<LiveAssistantHandle>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return <MapView />;
      case 'about':
        return <AboutProject onNavigate={setActiveTab} />;
      case 'contact':
        return <ContactUs />;
      case 'assistant':
        return null;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactElement }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-tighter rounded-t-xl transition-all duration-300 focus:outline-none ${
        activeTab === tab
          ? 'bg-background text-primary border-b-4 border-primary shadow-[0_-10px_20px_rgba(152,195,217,0.1)]'
          : 'text-gray-500 hover:text-primary hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-background text-gray-100 font-sans flex flex-col overflow-hidden">
      <header className="bg-background/80 backdrop-blur-md border-b border-white/5 flex-shrink-0 z-10 w-full">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
              Smart Road <span className="text-primary">Assistant</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col container mx-auto px-4 pb-2 overflow-hidden">
        <div className="flex-shrink-0 mt-2">
          <nav className="flex space-x-1 overflow-x-auto no-scrollbar" aria-label="Tabs">
            <TabButton tab="about" label="Home" icon={<InfoIcon className="w-4 h-4" />} />
            <TabButton tab="assistant" label="Neural Drive" icon={<SteeringWheelIcon className="w-4 h-4" />} />
            <TabButton tab="map" label="Live Map" icon={<MapIcon className="w-4 h-4" />} />
            <TabButton tab="contact" label="Support" icon={<MailIcon className="w-4 h-4" />} />
          </nav>
        </div>
        <div className="flex-grow bg-[#1a1a1a] rounded-b-2xl shadow-2xl overflow-hidden relative border-x border-b border-white/5">
          <div className={`absolute inset-0 z-20 bg-background ${activeTab === 'assistant' ? 'block' : 'hidden'}`}>
             <LiveAssistant ref={assistantRef} />
          </div>
          <div className="h-full w-full">
            {renderTabContent()}
          </div>
        </div>
      </main>

       <footer className="text-center py-3 text-[9px] text-gray-600 font-bold uppercase tracking-[0.3em] flex-shrink-0">
          Cognitive Grid Protocol • El-Moheb Smart Street
      </footer>
    </div>
  );
};

export default App;
