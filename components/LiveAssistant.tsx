
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage } from "@google/genai";
import { ChatMessage, Coordinates } from '../types';
import * as geminiService from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { MicIcon, LoaderIcon, BoltIcon, MapIcon } from './Icons';

const LiveAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Ready for your command.');
  const [liveTranscription, setLiveTranscription] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMapConsulting, setIsMapConsulting] = useState(false);

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const addMessage = useCallback((sender: 'user' | 'ai' | 'system', text: string, metadata?: any) => {
    setConversation(prev => [...prev, { sender, text, timestamp: new Date().toISOString(), metadata }]);
  }, []);

  const stopEverything = useCallback(() => {
    setIsListening(false);
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close()).catch(console.error);
      sessionPromiseRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    inputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;
    outputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current = null;
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setLiveTranscription('');
    setStatus('Ready.');
  }, []);
  
  const handleRouteRequest = useCallback(async (destination: string) => {
    if (!currentLocation) {
        addMessage('system', 'GPS signal needed for routing.');
        return;
    }
    addMessage('system', `Calculating best route to ${destination}...`);
    try {
        const response = await geminiService.getRoute(currentLocation, destination);
        addMessage('ai', response.text, { grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks });
    } catch (e) {
        addMessage('system', 'Connectivity lost.');
    }
}, [currentLocation, addMessage]);

  const startSession = async () => {
    setError(null);
    setLiveTranscription('');
    setStatus('Activating...');
    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });
      const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCurrentLocation(coords);
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      setIsListening(true);
      setStatus('Online');

      sessionPromiseRef.current = geminiService.connectToLive({
        onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = geminiService.createPcmBlob(inputData);
                sessionPromiseRef.current?.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                // Fetch Telemetry (b, c, d, e, f, g, h)
                if (fc.name === 'getInfrastructureTelemetry') {
                  setIsSyncing(true);
                  const telemetry = await geminiService.getInfrastructureData();
                  setIsSyncing(false);
                  sessionPromiseRef.current?.then(session => {
                    session.sendToolResponse({
                      functionResponses: { id: fc.id, name: fc.name, response: { telemetry } }
                    });
                  });
                }
                
                // Execute Binary GPIO Logic
                if (fc.name === 'sendGpioOrders') {
                  setIsSyncing(true);
                  const sig1 = fc.args.sig1 as number;
                  const sig2 = fc.args.sig2 as number;
                  const sig3 = fc.args.sig3 as number;
                  const logicSummary = fc.args.logicSummary as string;
                  const result = await geminiService.executeGpioOrders(sig1, sig2, sig3, logicSummary);
                  setTimeout(() => setIsSyncing(false), 1500);
                  sessionPromiseRef.current?.then(session => {
                    session.sendToolResponse({
                      functionResponses: { id: fc.id, name: fc.name, response: { result } }
                    });
                  });
                }
                
                // Maps Traffic Check
                if (fc.name === 'checkLocalTraffic') {
                    setIsMapConsulting(true);
                    const location = fc.args.location as string;
                    const trafficInfo = await geminiService.getTrafficStatus(location, coords);
                    setIsMapConsulting(false);
                    sessionPromiseRef.current?.then(session => {
                        session.sendToolResponse({
                            functionResponses: { id: fc.id, name: fc.name, response: { trafficStatus: trafficInfo } }
                        });
                    });
                }
              }
            }

            if (message.serverContent?.inputTranscription) {
                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                setLiveTranscription(currentInputTranscriptionRef.current);
            }
            if (message.serverContent?.outputTranscription) {
                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscriptionRef.current.trim();
                const fullOutput = currentOutputTranscriptionRef.current.trim();
                if(fullInput) addMessage('user', fullInput);
                if(fullOutput) addMessage('ai', fullOutput);
                
                const routeKeywords = ['to', 'route', 'go', 'navigate', 'direction'];
                if (routeKeywords.some(kw => fullInput.toLowerCase().includes(kw))) {
                    const destination = fullInput.toLowerCase().replace(/.*(to|directions to)\s+/i, '').trim();
                    if(destination.length > 2) handleRouteRequest(destination);
                }
                
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
                setLiveTranscription('');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current!, 24000, 1);
                const source = outputAudioContextRef.current!.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContextRef.current!.destination);
                const startTime = Math.max(outputAudioContextRef.current!.currentTime, nextStartTimeRef.current);
                source.start(startTime);
                nextStartTimeRef.current = startTime + audioBuffer.duration;
                audioSourcesRef.current.add(source);
                source.onended = () => audioSourcesRef.current.delete(source);
            }
            
            if (message.serverContent?.interrupted) {
                audioSourcesRef.current.forEach(s => s.stop());
                audioSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
        },
        onerror: (e) => {
            setError('Connection fault.');
            stopEverything();
        },
        onclose: () => stopEverything(),
      });
    } catch (err: any) {
      setError('System fault.');
      stopEverything();
    }
  };

  const toggleListening = () => isListening ? stopEverything() : startSession();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-primary animate-pulse' : 'bg-gray-600'}`}></div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Moheb-Saeed Unit</span>
          </div>
          <div className="flex items-center gap-4">
              {isMapConsulting && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 transition-all">
                      <MapIcon className="w-3 h-3 text-blue-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Maps Sync</span>
                  </div>
              )}
              {isSyncing && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 transition-all">
                      <BoltIcon className="w-3 h-3 text-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Telemetry Sync</span>
                  </div>
              )}
          </div>
      </div>

      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {conversation.map((msg, index) => (
          msg.sender !== 'system' && ( 
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                msg.sender === 'user' ? 'bg-primary text-background font-medium rounded-br-none' :
                'bg-white/10 text-gray-200 rounded-bl-none shadow-md shadow-black/10'
                }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
            </div>
          )
        ))}
        <div ref={conversationEndRef} />
      </div>
      
      {error && <div className="mx-4 mb-4 p-2 text-center text-xs bg-red-900/40 text-red-200 rounded-md border border-red-500/20">{error}</div>}

      <div className="p-6 bg-background/50 border-t border-white/10">
          <div className="text-center text-sm text-gray-500 mb-6 h-6 flex items-center justify-center">
            <p className="italic font-light">
              {isListening && liveTranscription ? liveTranscription : status}
            </p>
          </div>
          <div className="flex justify-center items-center">
            <button
              onClick={toggleListening}
              className={`relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                isListening ? 'bg-red-500 shadow-xl' : 'bg-primary shadow-xl'
              }`}
            >
              <div className={`absolute inset-0 rounded-full border-2 border-white/5 ${isListening ? 'animate-ping opacity-10' : ''}`}></div>
              {isListening && !liveTranscription && status === 'Activating...' ? <LoaderIcon className="w-8 h-8 text-white"/> : <MicIcon className={`w-10 h-10 ${isListening ? 'text-white' : 'text-background'}`} />}
            </button>
          </div>
      </div>
    </div>
  );
};

export default LiveAssistant;
