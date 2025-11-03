import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLiveConversation } from './hooks/useLiveConversation';
import { ConversationStatus, TranscriptMessage } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { TopicInput } from './components/TopicInput';
import { ControlButton } from './components/ControlButton';
import { StatusIndicator } from './components/StatusIndicator';
import { Transcript } from './components/Transcript';
import { MicIcon, StopIcon, RefreshIcon, SendIcon } from './components/Icons';

const App: React.FC = () => {
  const [language, setLanguage] = useState('English');
  const [topic, setTopic] = useState('ordering a coffee and a pastry');
  const [inputText, setInputText] = useState('');

  const { status, transcript, error, startConversation, stopConversation, sendMessage } = useLiveConversation();

  const handleStart = useCallback(() => {
    if (language && topic) {
      startConversation(language, topic);
    }
  }, [language, topic, startConversation]);

  const handleStop = useCallback(() => {
    stopConversation();
    setInputText('');
  }, [stopConversation]);
  
  const handleRestart = useCallback(() => {
    stopConversation();
    setInputText('');
    // A small delay to ensure resources are released before restarting
    setTimeout(() => {
        handleStart();
    }, 200);
  }, [stopConversation, handleStart]);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  }, [inputText, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && status === ConversationStatus.READY) {
      handleSend();
    }
  };

  const isConversationActive = status !== ConversationStatus.NOT_STARTED && status !== ConversationStatus.STOPPED && status !== ConversationStatus.ERROR;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-3xl flex flex-col h-screen">
        <header className="text-center py-6">
          <h1 className="text-4xl font-bold text-sky-400">LinguaLink AI</h1>
          <p className="text-slate-400 mt-2">Your AI partner for mastering new languages.</p>
        </header>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <LanguageSelector selectedLanguage={language} onChange={setLanguage} disabled={isConversationActive} />
            <TopicInput topic={topic} onChange={setTopic} disabled={isConversationActive} />
          </div>
          <div className="flex items-center justify-center space-x-4">
            {!isConversationActive ? (
              <ControlButton
                onClick={handleStart}
                label="Start Conversation"
                icon={<MicIcon />}
                className="bg-sky-600 hover:bg-sky-500"
              />
            ) : (
              <>
                <ControlButton
                  onClick={handleStop}
                  label="Stop Conversation"
                  icon={<StopIcon />}
                  className="bg-red-600 hover:bg-red-500"
                />
                <ControlButton
                    onClick={handleRestart}
                    label="Restart"
                    icon={<RefreshIcon />}
                    className="bg-slate-600 hover:bg-slate-500"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex-grow bg-slate-800/50 rounded-xl p-4 mt-6 border border-slate-700 shadow-lg flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-semibold text-slate-300">Transcript</h2>
            <StatusIndicator status={status} />
          </div>
          <Transcript transcript={transcript} />
          {isConversationActive && (
             <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={status !== ConversationStatus.READY}
                        className="flex-grow w-full bg-slate-700/50 border border-slate-600 rounded-full shadow-sm py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Your message"
                    />
                    <button
                        onClick={handleSend}
                        disabled={status !== ConversationStatus.READY}
                        className="p-3 bg-sky-600 rounded-full text-white hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                </div>
             </div>
          )}
          {error && <div className="text-center text-red-400 p-4">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default App;