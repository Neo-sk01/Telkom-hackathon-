'use client';

import { useEffect } from 'react';

interface LocalStorageSyncProps {
  onCallInitiated?: (callId: string) => void;
}

export default function LocalStorageSync({ onCallInitiated }: LocalStorageSyncProps) {
  useEffect(() => {
    // Listen for call initiation events
    const handleCallInitiated = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { callId, ticketId } = customEvent.detail;
      
      try {
        // Get escalation data from localStorage
        const escalationDataStr = localStorage.getItem('escalationData');
        if (!escalationDataStr) {
          console.log('No escalation data found in localStorage');
          return;
        }

        const escalationData = JSON.parse(escalationDataStr);
        
        // Sync the data with admin dashboard
        const response = await fetch('/api/admin/sync-localStorage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            escalationData,
            ticketId
          })
        });

        if (response.ok) {
          console.log('Successfully synced chat history to admin dashboard');
          // Clear localStorage after successful sync
          localStorage.removeItem('escalationData');
        } else {
          console.error('Failed to sync chat history to admin dashboard');
        }

        if (onCallInitiated) {
          onCallInitiated(callId);
        }
      } catch (error) {
        console.error('Error syncing localStorage data:', error);
      }
    };

    // Add event listener for call initiation
    window.addEventListener('callInitiated', handleCallInitiated as EventListener);

    return () => {
      window.removeEventListener('callInitiated', handleCallInitiated as EventListener);
    };
  }, [onCallInitiated]);

  return null; // This component doesn't render anything
}
