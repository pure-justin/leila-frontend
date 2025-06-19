'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWebSocketClient, JobNotification } from '@/lib/websocket-client';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/utils/currency';

interface JobFeedProps {
  contractorId: string;
  token: string;
  onAcceptJob: (jobId: string) => void;
  onDeclineJob: (jobId: string) => void;
}

export default function JobFeed({ contractorId, token, onAcceptJob, onDeclineJob }: JobFeedProps) {
  const [jobs, setJobs] = useState<JobNotification[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const wsClient = getWebSocketClient(contractorId, token);
    if (!wsClient) return;

    // Request notification permission
    wsClient.requestNotificationPermission();

    // Connect to WebSocket
    wsClient.connect();

    // Listen for events
    wsClient.on('connected', () => {
      setWsConnected(true);
      console.log('Connected to job feed');
    });

    wsClient.on('disconnected', () => {
      setWsConnected(false);
      console.log('Disconnected from job feed');
    });

    wsClient.on('job:new', (job: JobNotification) => {
      setJobs(prev => [job, ...prev].slice(0, 10)); // Keep last 10 jobs
      
      // Play sound for urgent jobs
      if (job.job.urgent) {
        const audio = new Audio('/sounds/urgent-job.mp3');
        audio.play().catch(() => {});
      }
    });

    wsClient.on('notification:clicked', (jobId: string) => {
      // Scroll to job in feed
      const element = document.getElementById(`job-${jobId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Update location every 30 seconds when online
    const locationInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            wsClient.updateLocation(position.coords.latitude, position.coords.longitude);
          },
          (error) => console.error('Location error:', error),
          { enableHighAccuracy: true }
        );
      }
    }, 30000);

    return () => {
      clearInterval(locationInterval);
      wsClient.disconnect();
    };
  }, [contractorId, token]);

  const handleAccept = (job: JobNotification) => {
    const wsClient = getWebSocketClient();
    wsClient?.acceptJob(job.job.id);
    onAcceptJob(job.job.id);
    
    // Remove from feed
    setJobs(prev => prev.filter(j => j.id !== job.id));
  };

  const handleDecline = (job: JobNotification) => {
    const wsClient = getWebSocketClient();
    wsClient?.declineJob(job.job.id);
    onDeclineJob(job.job.id);
    
    // Remove from feed
    setJobs(prev => prev.filter(j => j.id !== job.id));
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Live Job Feed</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {wsConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Job Feed */}
      <AnimatePresence>
        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <p>Waiting for new jobs...</p>
            <p className="text-sm mt-2">Jobs matching your skills will appear here</p>
          </motion.div>
        ) : (
          jobs.map((notification) => (
            <motion.div
              key={notification.id}
              id={`job-${notification.job.id}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className={`border rounded-lg p-4 ${
                notification.job.urgent ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Urgent Badge */}
              {notification.job.urgent && (
                <div className="flex items-center space-x-1 text-red-600 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">URGENT JOB</span>
                </div>
              )}

              {/* Job Details */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{notification.job.service}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.job.customerName}</p>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{notification.job.date} at {notification.job.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{notification.job.address} • {notification.job.distance}</span>
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="ml-4 text-right">
                  <div className="flex items-center justify-end text-2xl font-bold text-gray-900">
                    <span>{formatCurrency(notification.job.price)}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecline(notification)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(notification)}
                      className={`${
                        notification.job.urgent 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              </div>

              {/* Match Score Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Match Score</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                        style={{ width: '85%' }}
                      />
                    </div>
                    <span className="font-medium text-gray-700">85%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}