import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { getProviderProfile, updateOnlineStatus } from '../services/providerRegistrationService';
import { getAvailableRequests } from '../services/marketplaceService';
import notificationSoundService from '../services/notificationSoundService';

const ProviderContext = createContext();

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within ProviderProvider');
  }
  return context;
};

export const ProviderProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    rating: 0,
    completedJobs: 0,
    totalJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  const requestCheckInterval = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initializeProvider();
    setupAppStateListener();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      startRequestMonitoring();
    } else {
      stopRequestMonitoring();
    }
  }, [isOnline]);

  const initializeProvider = async () => {
    await notificationSoundService.initialize();
    await loadProfile();
  };

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground - refresh data
      if (isOnline) {
        checkForNewRequests();
      }
    }
    appState.current = nextAppState;
  };

  const loadProfile = async () => {
    const result = await getProviderProfile();
    if (result.success && result.data) {
      setProfile(result.data);
      setIsOnline(result.data.isOnline || false);
      setStats({
        todayEarnings: result.data.todayEarnings || 0,
        rating: result.data.rating || 0,
        completedJobs: result.data.completedJobs || 0,
        totalJobs: result.data.totalJobs || 0,
      });
    }
    setLoading(false);
  };

  const toggleOnlineStatus = async (value) => {
    const result = await updateOnlineStatus(value);
    if (result.success) {
      setIsOnline(value);
      setProfile(result.data);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const startRequestMonitoring = () => {
    // Check immediately
    checkForNewRequests();
    
    // Then check every 5 seconds
    requestCheckInterval.current = setInterval(() => {
      checkForNewRequests();
    }, 5000);
  };

  const stopRequestMonitoring = () => {
    if (requestCheckInterval.current) {
      clearInterval(requestCheckInterval.current);
      requestCheckInterval.current = null;
    }
  };

  const checkForNewRequests = async () => {
    if (!profile?.id) return;

    const result = await getAvailableRequests(profile.id);
    if (result.success && result.requests) {
      const newRequests = result.requests;
      
      // Check for truly new requests (not in current list)
      const currentIds = incomingRequests.map(r => r.id);
      const brandNewRequests = newRequests.filter(r => !currentIds.includes(r.id));
      
      if (brandNewRequests.length > 0) {
        // Play notification for new requests
        brandNewRequests.forEach(request => {
          if (request.urgent) {
            notificationSoundService.playUrgentRequestSound();
          } else {
            notificationSoundService.playNewRequestSound();
          }
        });
      }
      
      setIncomingRequests(newRequests);
    }
  };

  const acceptRequest = (request) => {
    setCurrentJob(request);
    // Remove from incoming requests
    setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const rejectRequest = (requestId) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const updateJobStatus = (status) => {
    if (currentJob) {
      setCurrentJob({ ...currentJob, status });
    }
  };

  const completeJob = (earnings) => {
    setStats(prev => ({
      ...prev,
      todayEarnings: prev.todayEarnings + earnings,
      completedJobs: prev.completedJobs + 1,
      totalJobs: prev.totalJobs + 1,
    }));
    setCurrentJob(null);
  };

  const cleanup = () => {
    stopRequestMonitoring();
    notificationSoundService.cleanup();
  };

  const value = {
    profile,
    isOnline,
    currentJob,
    incomingRequests,
    stats,
    loading,
    toggleOnlineStatus,
    acceptRequest,
    rejectRequest,
    updateJobStatus,
    completeJob,
    refreshProfile: loadProfile,
    refreshRequests: checkForNewRequests,
  };

  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
};
