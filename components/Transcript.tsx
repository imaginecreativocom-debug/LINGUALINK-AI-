
import React, { useRef, useEffect } from 'react';
import { TranscriptMessage, MessageSender } from '../types';

interface TranscriptProps {
  transcript: TranscriptMessage[];
}

const MessageBubble: React.FC<{ message: TranscriptMessage }> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-prose px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-sky-600 rounded-br-none text-white'
            : 'bg-slate-700 rounded-bl-none text-slate-200'
        }`}
      >
        <p>{message.text}</p>
      </div>
    </div>
  );
};

export const Transcript: React.FC<TranscriptProps> = ({ transcript }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

  return (
    <div className="flex-grow overflow-y-auto pr-2 space-y-4">
      {transcript.length === 0 ? (
        <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Your conversation will appear here.</p>
        </div>
      ) : (
        transcript.map((msg) => <MessageBubble key={msg.id} message={msg} />)
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
