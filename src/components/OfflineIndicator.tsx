import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-lg border border-[#D5B876] bg-[#FAF5E8] px-3.5 py-2 text-xs font-medium text-[#7A5418] shadow-lg animate-fade-in"
    >
      <WifiOff className="w-4 h-4 text-[#B2741E] animate-pulse" />
      <div>
        <span className="font-semibold">Offline Sanctuary</span>
        <span className="mx-1 text-[#C4A36B]">·</span>
        <span className="text-[#8C6425]">Cached library and reading lists are active.</span>
      </div>
    </div>
  );
};
