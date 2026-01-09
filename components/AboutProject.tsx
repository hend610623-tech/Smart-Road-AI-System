
import React from 'react';
import { Tab } from '../App';
import { SteeringWheelIcon, MapIcon, SparklesIcon, TextIcon, MicIcon } from './Icons';

interface AboutProjectProps {
  onNavigate?: (tab: Tab) => void;
}

const AboutProject: React.FC<AboutProjectProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Premium Hero Section */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden flex flex-col justify-center items-center">
        <img 
          src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1600" 
          alt="Night City Highway" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        
        <div className="relative z-10 text-center px-4">
          <h2 className="text-4xl md:text-7xl font-extrabold text-white mb-4 tracking-tighter drop-shadow-2xl">
            Smart Road Assistant
          </h2>
          <p className="text-primary font-bold tracking-[0.4em] uppercase text-xs md:text-sm drop-shadow-lg opacity-90">
            Intelligent Infrastructure • Seamless Journeys
          </p>
          <div className="h-1 w-24 bg-primary rounded-full mx-auto mt-8 shadow-[0_0_20px_#98C3D9]"></div>
        </div>
      </div>

      <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-20">
        
        {/* Description Section */}
        <section className="py-10 border-b border-white/5 text-left md:text-left px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mt-4">
              <p className="text-lg md:text-2xl text-gray-300 leading-relaxed font-light">
                If you waste so much time every day on <span className="text-primary font-medium">El-Moheb Street</span>, this is the best solution for you. 
                <span className="text-primary font-medium"> Smart Route</span> gives you live traffic updates so you can avoid jams, save gas, and drive through city fast and smoothly.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section>
          <h3 className="text-sm font-black text-white/40 mb-12 flex justify-center items-center gap-4 uppercase tracking-[0.5em]">
            <div className="h-px w-8 bg-white/20"></div>
            Core Technology
            <div className="h-px w-8 bg-white/20"></div>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            
            <div className="group flex flex-col items-center">
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl transition-all duration-700 group-hover:shadow-primary/20 group-hover:scale-[1.03]">
                    <img 
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" 
                        alt="Advanced Computing Interface" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <div className="absolute top-6 right-6 bg-primary text-background p-3 rounded-2xl shadow-lg">
                        <MicIcon className="w-6 h-6" />
                    </div>
                </div>
                <h4 className="font-black text-white mb-4 uppercase tracking-widest text-base">Voice Synthesis</h4>
                <p className="text-sm text-gray-400 text-center leading-relaxed font-light px-4">
                  Engage in fluid, real-time conversations. Gemini processes and responds to your vocal intent with sub-second latency.
                </p>
            </div>

            <div className="group flex flex-col items-center">
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl transition-all duration-700 group-hover:shadow-primary/20 group-hover:scale-[1.03]">
                    <img 
                        src="https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=800" 
                        alt="High Tech Navigation UI" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <div className="absolute top-6 right-6 bg-primary text-background p-3 rounded-2xl shadow-lg">
                        <MapIcon className="w-6 h-6" />
                    </div>
                </div>
                <h4 className="font-black text-white mb-4 uppercase tracking-widest text-base">Predictive Mapping</h4>
                <p className="text-sm text-gray-400 text-center leading-relaxed font-light px-4">
                  Navigation that sees what's ahead. Our AI analyzes global traffic patterns to steer you clear of congestion before it forms.
                </p>
            </div>

            <div className="group flex flex-col items-center">
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl transition-all duration-700 group-hover:shadow-primary/20 group-hover:scale-[1.03]">
                    <img 
                        src="https://images.unsplash.com/photo-1517672688305-7511c5962f46?auto=format&fit=crop&q=80&w=800" 
                        alt="Abstract Infrastructure Monitoring" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <div className="absolute top-6 right-6 bg-primary text-background p-3 rounded-2xl shadow-lg">
                        <SteeringWheelIcon className="w-6 h-6" />
                    </div>
                </div>
                <h4 className="font-black text-white mb-4 uppercase tracking-widest text-base">Active Safety</h4>
                <p className="text-sm text-gray-400 text-center leading-relaxed font-light px-4">
                  Direct hardware integration allows the AI to manage local traffic signals, ensuring your path is physically optimized in real-time.
                </p>
            </div>

          </div>
        </section>

        {/* Action Dashboard */}
        <section className="pt-16 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <button 
                    onClick={() => onNavigate?.('assistant')}
                    className="group relative overflow-hidden p-10 bg-white/5 border border-white/5 rounded-3xl transition-all duration-500 hover:bg-primary/5 hover:border-primary/50 shadow-inner"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <MicIcon className="w-32 h-32 text-white" />
                    </div>
                    <MicIcon className="w-12 h-12 text-primary mb-6 transition-transform duration-500 group-hover:scale-110" />
                    <span className="block font-black text-white text-lg uppercase tracking-wider text-left">Assistant</span>
                    <span className="block text-[11px] text-gray-500 mt-2 uppercase tracking-widest text-left">Live Voice Interaction</span>
                </button>

                <button 
                    onClick={() => onNavigate?.('map')}
                    className="group relative overflow-hidden p-10 bg-white/5 border border-white/5 rounded-3xl transition-all duration-500 hover:bg-primary/5 hover:border-primary/50 shadow-inner"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <MapIcon className="w-32 h-32 text-white" />
                    </div>
                    <MapIcon className="w-12 h-12 text-primary mb-6 transition-transform duration-500 group-hover:scale-110" />
                    <span className="block font-black text-white text-lg uppercase tracking-wider text-left">Live View</span>
                    <span className="block text-[11px] text-gray-500 mt-2 uppercase tracking-widest text-left">Real-Time Telemetry</span>
                </button>

                <button 
                    onClick={() => onNavigate?.('generator')}
                    className="group relative overflow-hidden p-10 bg-white/5 border border-white/5 rounded-3xl transition-all duration-500 hover:bg-primary/5 hover:border-primary/50 shadow-inner"
                >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TextIcon className="w-32 h-32 text-white" />
                    </div>
                    <TextIcon className="w-12 h-12 text-primary mb-6 transition-transform duration-500 group-hover:scale-110" />
                    <span className="block font-black text-white text-lg uppercase tracking-wider text-left">AI Studio</span>
                    <span className="block text-[11px] text-gray-500 mt-2 uppercase tracking-widest text-left">Logic Playground</span>
                </button>
            </div>
        </section>

      </div>
    </div>
  );
};

export default AboutProject;
