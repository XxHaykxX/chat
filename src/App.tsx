import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { useTheme } from './hooks/useTheme';
import FilterPage from './pages/FilterPage';
import SearchingPage from './pages/SearchingPage';
import ChatPage from './pages/ChatPage';
import RulesPage from './pages/RulesPage';
import HelpPage from './pages/HelpPage';
import BugReportPage from './pages/BugReportPage';
import type { AppPage, Filters } from './types';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const socket = useSocket();
  const [currentPage, setCurrentPage] = useState<AppPage>('filter');

  const handleStartSearch = (filters: Filters) => {
    socket.search(filters);
    setCurrentPage('searching');
  };

  const handleStopSearch = () => {
    socket.stopSearch();
    setCurrentPage('filter');
  };

  const handleDisconnectChat = () => {
    socket.disconnectChat();
    setCurrentPage('filter');
  };

  const handleNewSearch = () => {
    socket.disconnectChat();
    setCurrentPage('filter');
  };

  // When matched, go to chat
  if (socket.isMatched && currentPage === 'searching') {
    setCurrentPage('chat');
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          currentPage === 'filter' ? (
            <FilterPage
              onStartSearch={handleStartSearch}
              onlineCount={socket.onlineCount}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          ) : currentPage === 'searching' ? (
            <SearchingPage
              onCancel={handleStopSearch}
              onlineCount={socket.onlineCount}
            />
          ) : (
            <ChatPage
              messages={socket.messages}
              setMessages={socket.setMessages}
              isPartnerTyping={socket.isPartnerTyping}
              isPartnerRecording={socket.isPartnerRecording}
              partnerDisconnected={socket.partnerDisconnected}
              onSendMessage={socket.sendMessage}
              onTyping={socket.sendTyping}
              onStopTyping={socket.sendStopTyping}
              onRecording={socket.sendRecording}
              onStopRecording={socket.sendStopRecording}
              onDisconnect={handleDisconnectChat}
              onNewSearch={handleNewSearch}
            />
          )
        }
      />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/bug-report" element={<BugReportPage />} />
    </Routes>
  );
}
