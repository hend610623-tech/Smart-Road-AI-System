
import React, { useState, useEffect, useCallback } from 'react';
import { Coordinates, AiModel } from '../types';
import { LoaderIcon, PinIcon, SteeringWheelIcon, SparklesIcon, BoltIcon } from './Icons';
import * as geminiService from '../services/geminiService';

const MapView: React.FC = () => {
    const [location, setLocation] = useState<Coordinates | null>(null);
    const [startPoint, setStartPoint] = useState('');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRouting, setIsRouting] = useState(false);
    const [routeResult, setRouteResult] = useState<string | null>(null);

    const acquireLocation = useCallback(() => {
        setIsLoading(true);
        setError(null);
        
        if (!navigator.geolocation) {
            setError("GPS not supported by browser.");
            setIsLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                setLocation(coords);
                setStartPoint(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
                setIsLoading(false);
                
                window.dispatchEvent(new CustomEvent('ai-thought-stream', { 
                    detail: { 
                        text: `GPS Signal Lock: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`, 
                        type: 'info', 
                        timestamp: new Date().toLocaleTimeString() 
                    } 
                }));
            },
            (err) => {
                console.error("GPS Error:", err);
                setError(`GPS Error: ${err.message}. Please check location permissions.`);
                setIsLoading(false);
            },
            options
        );
    }, []);

    useEffect(() => {
        acquireLocation();
    }, [acquireLocation]);

    const handleGetRoute = async () => {
        if (!destination.trim()) return;
        setIsRouting(true);
        setRouteResult(null);
        setError(null);

        try {
            const prompt = `URGENT ROUTING REQUEST:
            CURRENT POSITION: ${startPoint}
            TARGET DESTINATION: ${destination}
            
            TASKS:
            1. Search for the real-world optimal route between these two points.
            2. Provide a turn-by-turn summary.
            3. Set infrastructure signals (d1, d2, d3) to '1' for priority green-wave.
            
            Analyze the traffic and provide the absolute best path.`;
            
            const response = await geminiService.generateText(prompt, AiModel.Flash, true);
            const textResponse = response.text || "Route calculated. Synchronizing with infrastructure...";
            setRouteResult(textResponse);

            await geminiService.treatSpreadsheet({
                d1: "1", 
                d2: "1", 
                d3: "1", 
                d4: location?.latitude.toString() || "0",
                d5: location?.longitude.toString() || "0",
                d6: destination.substring(0, 30),
                d7: "Neural route active: " + destination
            });
            
            window.dispatchEvent(new CustomEvent('ai-thought-stream', { 
                detail: { 
                    text: `Spreadsheet Updated: Priority routing to ${destination} active.`, 
                    type: 'success', 
                    timestamp: new Date().toLocaleTimeString() 
                } 
            }));
        } catch (err: any) {
            setError("Routing Engine Error: " + err.message);
        } finally {
            setIsRouting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#121212] overflow-hidden font-mono">
             <div className="p-4 border-b border-white/10 bg-[#1e1e1e] space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural Routing Core</h2>
                        <div className="flex gap-1">
                          <button 
                              onClick={acquireLocation}
                              disabled={isLoading}
                              className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 hover:text-primary transition-all active:scale-90"
                              title="Re-acquire Location"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? 'animate-spin' : ''}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                          </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded">
                        <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
                        <span className="text-[8px] text-green-400 font-bold uppercase tracking-tighter">
                            {isLoading ? 'Calibrating...' : 'GPS Lock'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Origin (Auto-Telemetry)</label>
                        <input 
                            type="text" 
                            readOnly
                            value={isLoading ? "Locating..." : startPoint}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-gray-400 outline-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-primary uppercase font-bold">Target Destination</label>
                        <input 
                            type="text" 
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Enter destination name or city..."
                            className="w-full bg-white/5 border border-primary/20 rounded-lg px-3 py-2 text-xs text-white focus:border-primary outline-none transition-all placeholder:text-gray-600"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleGetRoute}
                    disabled={isRouting || !destination || isLoading}
                    className="w-full bg-primary text-black py-3 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-20"
                >
                    {isRouting ? <LoaderIcon className="w-4 h-4" /> : <SteeringWheelIcon className="w-4 h-4" />}
                    {isRouting ? 'Calculating Optimal Route...' : 'Engage Smart Route'}
                </button>
            </div>

            <div className="flex-grow relative bg-black">
                {isLoading && !location ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <LoaderIcon className="w-8 h-8 text-primary mb-2" />
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Acquiring Satellites...</span>
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                        <PinIcon className="w-10 h-10 text-red-500/50 mb-3" />
                        <p className="text-xs text-red-400 uppercase font-bold">{error}</p>
                        <button 
                            onClick={acquireLocation}
                            className="mt-4 px-6 py-2 border border-primary text-[9px] text-primary hover:bg-primary/10 uppercase tracking-widest transition-colors rounded"
                        >
                            Retry GPS Sync
                        </button>
                    </div>
                ) : (
                    <>
                        <iframe
                            key={location ? `${location.latitude}-${location.longitude}` : 'searching'}
                            title="Live Map"
                            className="w-full h-full border-none"
                            style={{ border: 0 }}
                            src={`https://maps.google.com/maps?q=loc:${location?.latitude},${location?.longitude}&z=15&output=embed&t=m`}
                        ></iframe>
                        
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full pointer-events-none">
                           <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                             Precision Lock: {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
                           </span>
                        </div>

                        {routeResult && (
                            <div className="absolute bottom-4 left-4 right-4 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl max-h-[40%] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 z-20">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4 text-primary" />
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Neural Guidance Output</span>
                                    </div>
                                    <button onClick={() => setRouteResult(null)} className="text-gray-500 hover:text-white p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                    </button>
                                </div>
                                <div className="prose prose-invert prose-xs">
                                  <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">{routeResult}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MapView;
