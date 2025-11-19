"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface VoiceChatProps {
  agentId: string;
  sessionId: string;
  countryCode: string;
}

/**
 * Voice chat component using ElevenLabs Conversational AI
 * Based on the USCIS implementation pattern
 */
export default function VoiceChat({ agentId, sessionId, countryCode }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Fetch signed WebSocket URL from backend
  const fetchSignedUrl = useCallback(async () => {
    try {
      const response = await fetch(`/.netlify/functions/elevenSignedUrl?agent_id=${agentId}&country=${countryCode}`);
      if (!response.ok) throw new Error("Failed to get signed URL");
      const data = await response.json();
      setSignedUrl(data.signedUrl);
      return data.signedUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
      return null;
    }
  }, [agentId, countryCode]);

  // Initialize audio context
  const initAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (!mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }
    } catch (err) {
      setError("Microphone access denied");
      console.error("Audio init error:", err);
    }
  }, []);

  // Connect to ElevenLabs WebSocket
  const connect = useCallback(async () => {
    const url = signedUrl || await fetchSignedUrl();
    if (!url) return;

    await initAudio();

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log("Connected to ElevenLabs");
      };

      ws.onmessage = (event) => {
        // Handle incoming audio from ElevenLabs
        if (event.data instanceof Blob) {
          playAudio(event.data);
        } else {
          // Handle text/control messages
          try {
            const message = JSON.parse(event.data);
            if (message.type === "agent_speaking") {
              setIsSpeaking(message.speaking);
            }
          } catch (e) {
            // Not JSON, ignore
          }
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("Connection error");
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("Disconnected from ElevenLabs");
      };

      // Start sending microphone audio
      if (mediaStreamRef.current) {
        startAudioStream(ws);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [signedUrl, fetchSignedUrl, initAudio]);

  // Start streaming microphone audio to WebSocket
  const startAudioStream = (ws: WebSocket) => {
    if (!mediaStreamRef.current || !audioContextRef.current) return;

    const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);

    processor.onaudioprocess = (e) => {
      if (ws.readyState === WebSocket.OPEN && !isMuted) {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to Int16Array for transmission
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        ws.send(int16Data.buffer);
      }
    };
  };

  // Play audio received from agent
  const playAudio = async (audioBlob: Blob) => {
    if (!audioContextRef.current) return;

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  // Disconnect
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [disconnect]);

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Voice Chat</h3>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 py-8">
        <button
          onClick={isConnected ? disconnect : connect}
          className={`
            p-6 rounded-full transition-all shadow-lg
            ${isConnected 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-primary-600 hover:bg-primary-700'
            }
            ${isSpeaking ? 'ring-4 ring-primary-400 animate-pulse' : ''}
          `}
          aria-label={isConnected ? "Disconnect" : "Connect"}
        >
          {isConnected ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </button>

        <button
          onClick={() => setIsMuted(!isMuted)}
          disabled={!isConnected}
          className={`
            p-4 rounded-full transition-all
            ${isMuted ? 'bg-gray-600' : 'bg-gray-700'}
            hover:bg-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6 text-white" />
          ) : (
            <Volume2 className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-300 space-y-1">
        <p className="font-medium">
          {isConnected 
            ? isSpeaking 
              ? "Agent is speaking..." 
              : "Listening..."
            : "Click microphone to start"}
        </p>
        <p className="text-xs text-gray-400">
          Speak naturally in any supported language
        </p>
      </div>
    </div>
  );
}
