'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, MapPin, Clock, DollarSign, Navigation,
  CheckCircle, XCircle, Phone, MessageCircle,
  TrendingUp, AlertCircle, Battery, Wifi
} from 'lucide-react';
import { matchingService, Match } from '@/lib/realtime-matching-service';
import { useAuth } from '@/hooks/useAuth';
import MapView from './MapView';

export default function ContractorLiveView() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [incomingMatches, setIncomingMatches] = useState<Match[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0 });
  const [stats, setStats] = useState({ acceptance: 85, rating: 4.8, completed: 12 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);

  // Initialize location tracking
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          
          // Update contractor location in real-time
          if (user && isOnline) {
            matchingService.updateContractorLocation(user.uid, newLocation);
          }
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [user, isOnline]);

  // Subscribe to incoming job opportunities
  useEffect(() => {
    if (!user || !isOnline) return;
    
    const unsubscribe = matchingService.subscribeToOpportunities(
      user.uid,
      (match: Match) => {
        console.log('New job opportunity:', match);
        setIncomingMatches(prev => [...prev, match]);
        
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play();
        }
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
        
        // Set timer
        setTimeRemaining(60);
      }
    );
    
    return () => unsubscribe();
  }, [user, isOnline]);

  // Countdown timer for current match
  useEffect(() => {
    if (incomingMatches.length > 0 && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Remove expired match
            setIncomingMatches(prev => prev.slice(1));
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [incomingMatches, timeRemaining]);

  const toggleOnlineStatus = async () => {
    if (!user || !currentLocation) return;
    
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    await matchingService.setContractorAvailability(
      user.uid,
      newStatus,
      currentLocation
    );
  };

  const acceptMatch = async (match: Match) => {
    if (!user) return;
    
    try {
      await matchingService.acceptMatch(match.id, user.uid);
      setCurrentMatch(match);
      setIncomingMatches([]);
      
      // Update metrics
      await matchingService.updateContractorMetrics(user.uid, {
        responseTime: 60 - timeRemaining,
        accepted: true
      });
    } catch (error) {
      console.error('Error accepting match:', error);
      alert('Match no longer available');
    }
  };

  const rejectMatch = async (match: Match) => {
    setIncomingMatches(prev => prev.filter(m => m.id !== match.id));
    
    // Update metrics
    if (user) {
      await matchingService.updateContractorMetrics(user.uid, {
        responseTime: 60 - timeRemaining,
        accepted: false
      });
    }
  };

  const renderOnlineToggle = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleOnlineStatus}
            className={`relative w-20 h-10 rounded-full transition-colors ${
              isOnline ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow transition-transform ${
                isOnline ? 'translate-x-11' : 'translate-x-1'
              }`}
            />
          </button>
          <div>
            <p className="font-semibold">{isOnline ? 'Online' : 'Offline'}</p>
            <p className="text-sm text-gray-600">
              {isOnline ? 'Receiving job requests' : 'Not receiving requests'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center text-green-600">
            <Wifi className="w-4 h-4 mr-1" />
            <span>Connected</span>
          </div>
          <div className="flex items-center text-green-600">
            <Battery className="w-4 h-4 mr-1" />
            <span>87%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEarningsCard = () => (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Today's Earnings</h3>
        <TrendingUp className="w-6 h-6 opacity-70" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-3xl font-bold">${earnings.today}</p>
          <p className="text-sm opacity-90">Today</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">${earnings.week}</p>
          <p className="text-sm opacity-90">This Week</p>
        </div>
        <div>
          <p className="text-2xl font-semibold">{stats.completed}</p>
          <p className="text-sm opacity-90">Jobs Today</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
        <span>Acceptance Rate: {stats.acceptance}%</span>
        <span>Rating: ⭐ {stats.rating}</span>
      </div>
    </div>
  );

  const renderIncomingJob = (match: Match) => {
    const isCurrentMatch = incomingMatches[0]?.id === match.id;
    
    return (
      <div key={match.id} className={`bg-white rounded-lg shadow-lg p-6 mb-4 ${
        isCurrentMatch ? 'ring-4 ring-purple-500 ring-opacity-50' : 'opacity-50'
      }`}>
        {/* Timer Bar */}
        {isCurrentMatch && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Time to respond</span>
              <span className="text-lg font-bold text-purple-600">{timeRemaining}s</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeRemaining / 60) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Job Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{match.factors.priceEstimate}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              match.score > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {match.score}% Match
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{match.factors.distance.toFixed(1)} miles away</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{match.factors.estimatedArrival} min ETA</span>
            </div>
          </div>

          {/* Map Preview */}
          <div className="h-32 bg-gray-100 rounded-lg overflow-hidden">
            {currentLocation && (
              <MapView className="w-full h-full" />
            )}
          </div>

          {/* Action Buttons */}
          {isCurrentMatch && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => rejectMatch(match)}
                className="bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => acceptMatch(match)}
                className="bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Accept ${match.factors.priceEstimate}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCurrentJob = () => {
    if (!currentMatch) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Job</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Active
          </span>
        </div>

        {/* Customer Info */}
        <div className="flex items-center space-x-4 mb-4 pb-4 border-b">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold">JD</span>
          </div>
          <div className="flex-1">
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-gray-600">HVAC Repair</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
          <Navigation className="w-5 h-5" />
          <span>Navigate to Customer</span>
        </button>

        {/* Job Actions */}
        <div className="mt-4 space-y-2">
          <button className="w-full text-purple-600 py-2 hover:text-purple-700">
            I've Arrived
          </button>
          <button className="w-full text-gray-600 py-2 hover:text-gray-700">
            Cancel Job
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {/* Audio for notifications */}
      <audio ref={audioRef} src="/notification.mp3" />

      {/* Online Toggle */}
      {renderOnlineToggle()}

      {/* Earnings Card */}
      {isOnline && renderEarningsCard()}

      {/* Current Job or Incoming Matches */}
      {currentMatch ? (
        renderCurrentJob()
      ) : (
        <>
          {incomingMatches.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">New Job Request</h2>
                <Bell className="w-6 h-6 text-purple-600 animate-bounce" />
              </div>
              {incomingMatches.map(match => renderIncomingJob(match))}
            </>
          ) : isOnline ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Waiting for jobs</h3>
              <p className="text-gray-600">
                Stay in busy areas to receive more job requests
              </p>
              
              {/* Heatmap suggestion */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  High demand area 2.3 miles north
                </p>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}