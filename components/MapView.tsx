
import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("GPS not supported by browser.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                setLocation(coords);
                setStartPoint(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
                setIsLoading(false);
            },
            (err) => {
                setError(`GPS Error: ${err.message}`);
                setIsLoading(false);
            }
        );
    }, []);

    const handleGetRoute = async () => {
        if (!destination.trim()) return;
        setIsRouting(true);
        setRouteResult(null);
        setError(null);

        try {
            // Force the AI to act as a Router with Search capabilities
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

            // Log to Google Sheets (8 Column Protocol)
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
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural Routing Core</h2>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[8px] text-green-400 font-bold uppercase">GPS Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-500 uppercase font-bold">Origin (Col E,F)</label>
                        <input 
                            type="text" 
                            readOnly
                            value={startPoint || "Acquiring satellites..."}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-gray-400 outline-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-primary uppercase font-bold">Destination (Col G)</label>
                        <input 
                            type="text" 
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Where are we aiming for?"
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
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <LoaderIcon className="w-8 h-8 text-primary mb-2" />
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Waking up GPS...</span>
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                        <PinIcon className="w-10 h-10 text-red-500/50 mb-3" />
                        <p className="text-xs text-red-400 uppercase font-bold">{error}</p>
                    </div>
                ) : (
                    <>
                        <iframe
                            title="Live Map"
                            className="w-full h-full grayscale contrast-125 opacity-60"
                            style={{ border: 0 }}
                            src={`https://maps.google.com/maps?q=${location?.latitude},${location?.longitude}&z=16&output=embed&t=m`}
                        ></iframe>
                        
                        {routeResult && (
                            <div className="absolute bottom-4 left-4 right-4 bg-[#1e1e1e]/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl max-h-[40%] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <SparklesIcon className="w-4 h-4 text-primary" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">AI Route Proposal</span>
                                </div>
                                <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">{routeResult}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MapView;
