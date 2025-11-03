import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat, Modality } from '@google/genai';
import { ConversationStatus, MessageSender, TranscriptMessage } from '../types';
import { decode, decodeAudioData } from '../services/audioService';

export const useLiveConversation = () => {
  const [status, setStatus] = useState<ConversationStatus>(ConversationStatus.NOT_STARTED);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const aiRef = useRef<GoogleGenAI | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopConversation = useCallback(() => {
    chatRef.current = null;
    
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();

    setTranscript([]);
    setStatus(ConversationStatus.STOPPED);
    setError(null);
  }, []);

  const startConversation = useCallback(async (language: string, topic: string) => {
    setError(null);
    setTranscript([]);
    setStatus(ConversationStatus.INITIALIZING);

    try {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      const systemInstruction = `You are a friendly and patient language tutor.
      The user wants to practice speaking ${language}.
      Your conversation topic is: "${topic}".
      Keep your responses concise and clear, suitable for a language learner.
      Speak only in ${language}, unless the user is struggling significantly and asks for English.
      If the user makes a grammatical mistake, you can gently correct them in your response. For example, if they say 'I goed to the store', you could reply 'Oh, you went to the store? What did you buy there?'`;
      
      chatRef.current = aiRef.current.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        }
      });

      setStatus(ConversationStatus.READY);

    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Could not start the conversation. Please check your connection or API key.');
      setStatus(ConversationStatus.ERROR);
    }
  }, []);


  const sendMessage = useCallback(async (message: string) => {
    if (!chatRef.current || !aiRef.current) return;

    setStatus(ConversationStatus.AI_REPLYING);
    setTranscript(prev => [...prev, { sender: MessageSender.USER, text: message, id: self.crypto.randomUUID() }]);

    try {
        const result = await chatRef.current.sendMessage({ message });
        const aiResponseText = result.text;
        
        setTranscript(prev => [...prev, { sender: MessageSender.AI, text: aiResponseText, id: self.crypto.randomUUID() }]);

        // Text-to-Speech
        const ttsResponse = await aiRef.current.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: aiResponseText }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
              },
            },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio && outputAudioContextRef.current) {
            const audioContext = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);

            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
            const sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(audioContext.destination);
            
            sourceNode.addEventListener('ended', () => {
                audioSourcesRef.current.delete(sourceNode);
                if(audioSourcesRef.current.size === 0) {
                    setStatus(ConversationStatus.READY);
                }
            });

            sourceNode.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(sourceNode);
        } else {
            setStatus(ConversationStatus.READY);
        }

    } catch (err) {
        console.error("Error sending message:", err);
        setError("Sorry, I couldn't get a response. Please try again.");
        setStatus(ConversationStatus.ERROR);
    }

  }, []);

  return { status, transcript, error, startConversation, stopConversation, sendMessage };
};