
import React from 'react';
import { Tab } from '../App';
import { SteeringWheelIcon, MapIcon, TextIcon, MicIcon, BoltIcon } from './Icons';

interface AboutProjectProps {
  onNavigate?: (tab: Tab) => void;
}

const AboutProject: React.FC<AboutProjectProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Hero Section - Optimized for high reliability loading */}
      <div 
        className="relative h-[55vh] min-h-[500px] w-full overflow-hidden bg-[#121212] flex-shrink-0"
      >
        {/* Layer 0: Direct Source ID image from Unsplash (Verified high-stability ID) */}
        <img 
          src="https://images.unsplash.com/photo-1545143333-11bb2f7ef202?q=80&w=1920&auto=format&fit=crop" 
          alt="Smart Infrastructure" 
          className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.4] transition-opacity duration-1000 opacity-0"
          onLoad={(e) => (e.currentTarget.style.opacity = '1')}
        />
        
        {/* Layer 1: CSS Fallback (Pexels) - only visible if img tag is transparent or fails */}
        <div 
           className="absolute inset-0 z-[-1] bg-cover bg-center opacity-40"
           style={{ backgroundImage: 'url("https://images.pexels.com/photos/315938/pexels-photo-315938.jpeg?auto=compress&cs=tinysrgb&w=1260")' }}
        />

        {/* Layer 2: Complex Branding Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-[1]" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="mb-8 px-6 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-3xl shadow-2xl">
            <span className="text-[10px] md:text-xs font-black text-primary tracking-[0.6em] uppercase">
              AI Powered • Smart Infrastructure
            </span>
          </div>
          
          <h2 className="text-6xl md:text-[10rem] font-black text-white mb-6 tracking-tighter leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            SMART ROAD<br/>
            <span className="text-primary underline decoration-white/10 decoration-wavy underline-offset-[20px]">ASSISTANT</span>
          </h2>
          
          <div className="flex items-center gap-6 mt-12">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-primary/40"></div>
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(152,195,217,0.8)]"></div>
            <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-primary/40"></div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-16 max-w-7xl mx-auto w-full space-y-24">
        
        {/* Mission Statement Card */}
        <section className="relative overflow-hidden py-24 px-12 rounded-[4rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-3xl">
          <div className="absolute -top-20 -right-20 opacity-[0.02] rotate-12">
             <SteeringWheelIcon className="w-96 h-96 text-white" />
          </div>
          <div className="relative z-10 max-w-4xl">
            <h3 className="text-primary font-black text-xs uppercase tracking-[0.5em] mb-12 flex items-center gap-4">
              <span className="w-16 h-[2px] bg-primary"></span>
              Strategic Objective
            </h3>
            <p className="text-3xl md:text-5xl text-gray-100 leading-[1.05] font-light">
              Pioneering <span className="text-white font-bold italic underline decoration-primary/30 underline-offset-4">El-Moheb Street</span>'s transition to a cognitive traffic grid using decentralized neural telemetry.
            </p>
          </div>
        </section>

        {/* Action Dashboard */}
        <section className="pb-48">
            <div className="flex flex-col items-center mb-24 space-y-6">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.9em]">System Infrastructure</h4>
                <div className="h-[2px] w-64 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <DashboardCard 
                    title="Live Voice" 
                    subtitle="Assistant" 
                    description="Real-time route calculation & AI voice synthesis"
                    icon={<MicIcon className="w-10 h-10" />} 
                    onClick={() => onNavigate?.('assistant')}
                />
                <DashboardCard 
                    title="Telemetry" 
                    subtitle="Live Map" 
                    description="Precise GPS & Sector Monitoring Hub"
                    icon={<MapIcon className="w-10 h-10" />} 
                    onClick={() => onNavigate?.('map')}
                />
                <DashboardCard 
                    title="Cloud Logs" 
                    subtitle="AI Orders" 
                    description="ESP32 Instruction stream & binary logic"
                    icon={<BoltIcon className="w-10 h-10" />} 
                    onClick={() => onNavigate?.('orders')}
                />
                <DashboardCard 
                    title="Logic Lab" 
                    subtitle="AI Studio" 
                    description="Custom prompt engineering & sandbox environment"
                    icon={<TextIcon className="w-10 h-10" />} 
                    onClick={() => onNavigate?.('generator')}
                />
            </div>
        </section>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, subtitle, description, icon, onClick }: { title: string, subtitle: string, description: string, icon: React.ReactNode, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="group relative flex flex-col items-start p-14 bg-white/[0.01] border border-white/5 rounded-[4rem] transition-all duration-700 hover:bg-white/[0.07] hover:border-primary/40 hover:-translate-y-5 text-left overflow-hidden shadow-2xl"
    >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-all duration-700"></div>
        
        <div className="p-7 bg-white/5 rounded-[2rem] text-primary mb-12 group-hover:bg-primary group-hover:text-background transition-all duration-500 border border-white/5 shadow-inner">
            {icon}
        </div>
        
        <div className="space-y-4">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">{title}</span>
            <h5 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{subtitle}</h5>
            <p className="text-[11px] text-gray-400 font-medium group-hover:text-gray-200 transition-colors pt-3 leading-relaxed">{description}</p>
        </div>
        
        <div className="mt-12 flex items-center gap-4 text-primary text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 -translate-x-8 group-hover:translate-x-0 transition-all duration-700">
            Initialize
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
    </button>
);

export default AboutProject;
