
import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { LiveServerMessage } from "@google/genai";
import { ChatMessage, Coordinates } from '../types';
import * as geminiService from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { MicIcon, LoaderIcon, BoltIcon, SparklesIcon } from './Icons';

export interface LiveAssistantHandle {
  remoteStart: () => void;
}

const LiveAssistant = forwardRef<LiveAssistantHandle, {}>((props, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const syncIntervalRef = useRef<number | null>(null);

  const broadcastThought = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    window.dispatchEvent(new CustomEvent('ai-thought-stream', { 
      detail: { text, type, timestamp: new Date().toLocaleTimeString() } 
    }));
  };

  const stopEverything = useCallback(() => {
    setIsListening(false);
    setIsAutoSync(false);
    setIsConnecting(false);
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close()).catch(() => {});
      sessionPromiseRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    scriptProcessorRef.current?.disconnect();
    gainNodeRef.current?.disconnect();
    inputAudioContextRef.current?.close().catch(() => {});
    outputAudioContextRef.current?.close().catch(() => {});
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    
    broadcastThought("Audio Stream Terminated", "warning");
  }, []);

  const runLogicCycle = useCallback(async () => {
    if (!sessionPromiseRef.current) return;
    try {
      const session = await sessionPromiseRef.current;
      session.sendRealtimeInput({
        text: "Perform background scan of infrastructure parameters B-H."
      });
    } catch (e) {
      console.error("Logic cycle failed", e);
    }
  }, []);

  const startSession = async () => {
    if (isConnecting || isListening) return;
    setIsConnecting(true);
    try {
      broadcastThought("Activating High-Sensitivity Mic...");
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Turn off noise suppression to catch fainter sounds
          autoGainControl: true
        } 
      });
      
      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      // Add a Gain Node to amplify the signal before sending to Gemini
      gainNodeRef.current = inputAudioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 3.0; // 300% volume boost for high sensitivity
      
      broadcastThought("Neural Connection Opening...");

      sessionPromiseRef.current = geminiService.connectToLive({
        onopen: () => {
            setIsListening(true);
            setIsConnecting(false);
            setIsAutoSync(true);
            broadcastThought("Hyper-Sensitive Audio Active", "success");
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = geminiService.createPcmBlob(inputData);
                sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            // Chain: Source -> Gain (Boost) -> Processor -> Destination
            source.connect(gainNodeRef.current!);
            gainNodeRef.current!.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
            
            runLogicCycle();
        },
        onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'treatSpreadsheet') {
                  setIsSyncing(true);
                  await geminiService.treatSpreadsheet(fc.args as any);
                  setTimeout(() => setIsSyncing(false), 500);
                  sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "OK" } } }));
                }
              }
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
            }
        },
        onerror: (e) => {
          broadcastThought("Link Error", "warning");
          stopEverything();
        },
        onclose: () => {
          stopEverything();
        },
      });
    } catch (e) { 
      broadcastThought("Permission Denied", "warning");
      stopEverything(); 
    }
  };

  useEffect(() => {
    if (isAutoSync && isListening) {
      syncIntervalRef.current = window.setInterval(runLogicCycle, 20000);
    } else {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    }
    return () => { if (syncIntervalRef.current) clearInterval(syncIntervalRef.current); };
  }, [isAutoSync, isListening, runLogicCycle]);

  useImperativeHandle(ref, () => ({
    remoteStart: () => {
      if (!isListening && !isConnecting) startSession();
    }
  }));

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-primary animate-ping shadow-[0_0_15px_#98C3D9]' : 'bg-gray-800'}`}></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {isListening ? 'Sonic Pulse: ACTIVE' : isConnecting ? 'Calibrating...' : 'Awaiting Input'}
              </span>
          </div>
          <div className="flex gap-2">
              {isSyncing && (
                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                  <BoltIcon className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-[8px] font-bold text-primary uppercase">Syncing</span>
                </div>
              )}
          </div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
        {isListening && (
           <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-[500px] h-[500px] border border-primary/30 rounded-full animate-ping"></div>
              <div className="absolute w-[300px] h-[300px] border border-primary/20 rounded-full animate-ping [animation-delay:0.5s]"></div>
           </div>
        )}

        {!isListening && !isConnecting ? (
          <div className="relative z-10 space-y-8">
            <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-primary/10 group-hover:border-primary/40 transition-all">
              <MicIcon className="w-12 h-12 text-primary/40" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Initialize Link</h3>
              <p className="text-xs text-gray-500 max-w-[250px] mx-auto uppercase font-bold tracking-widest leading-loose">Tap to activate high-gain neural audio stream</p>
            </div>
            <button 
              onClick={startSession}
              className="px-12 py-5 bg-primary text-black font-black rounded-full uppercase text-xs tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(152,195,217,0.2)]"
            >
              Wake Assistant
            </button>
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="w-40 h-40 bg-background border-2 border-primary/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_rgba(152,195,217,0.1)]">
               <div className={`w-24 h-24 rounded-full border-4 border-primary border-t-transparent ${isListening ? 'animate-spin' : ''}`}></div>
               <SparklesIcon className="absolute w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">
              {isListening ? 'Listening for whispers...' : 'Establishing Secure Link'}
            </p>
          </div>
        )}
      </div>

      <div className="p-10 border-t border-white/5 bg-white/[0.01] flex flex-col items-center">
        <button 
          onClick={isListening ? stopEverything : startSession} 
          disabled={isConnecting}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
            isListening ? 'bg-red-500/80 shadow-red-500/20 rotate-45' : 'bg-primary shadow-primary/20'
          }`}
        >
          {isListening ? <BoltIcon className="w-10 h-10 text-white" /> : <MicIcon className="w-10 h-10 text-background" />}
        </button>
        <p className="mt-6 text-[9px] text-gray-600 font-black uppercase tracking-[0.5em]">
          {isListening ? 'Kill Engine' : 'Audio Sync'}
        </p>
      </div>
    </div>
  );
});

export default LiveAssistant;
