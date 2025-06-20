'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Log to console
    console.log('🔍 Debug page loaded');
    console.log('📍 Current URL:', window.location.href);
    console.log('🤖 Claude can see these logs!');

    // Fetch debug messages
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/debug');
        const data = await res.json();
        setLogs(data.messages || []);
      } catch (error) {
        console.error('Failed to fetch debug logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Test function Claude can call
  const testFunction = () => {
    console.log('✅ Test function called from Claude!');
    alert('Claude called this function!');
  };

  // Expose to window
  useEffect(() => {
    (window as any).testFunction = testFunction;
    (window as any).debugInfo = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    setConnected(true);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🔍 Debug Console</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p className="font-semibold">Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        <p className="text-sm text-gray-600">Claude can communicate with this page</p>
      </div>

      <div className="bg-purple-600 text-green-400 p-4 rounded-lg font-mono text-sm">
        <div className="mb-2">{'>'} window.testFunction() - Call test function</div>
        <div className="mb-2">{'>'} window.debugInfo - View debug info</div>
        <div className="mb-2">{'>'} console.log("Hello Claude!") - Send message</div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">📝 Debug Messages from Claude:</h2>
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="bg-white p-3 rounded shadow">
              <div className="text-sm text-gray-500">{log.timestamp}</div>
              <div className="font-medium">{log.message}</div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-gray-500">No messages yet...</p>
          )}
        </div>
      </div>
    </div>
  );
}