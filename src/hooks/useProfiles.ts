import { useState, useEffect, useCallback } from 'react';
import { showToast, Toast, getPreferenceValues } from '@raycast/api';
import { WootilityAPI, WootingProfile, WootingDevice } from '../utils/wootility-api';

interface Preferences {
  wootilityPath?: string;
  defaultProfile?: string;
  enableNotifications?: boolean;
}

interface UseProfilesReturn {
  profiles: WootingProfile[];
  devices: WootingDevice[];
  loading: boolean;
  error: string | null;
  switchProfile: (profile: WootingProfile) => Promise<void>;
  reload: () => Promise<void>;
  wootilityAvailable: boolean;
}

export function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<WootingProfile[]>([]);
  const [devices, setDevices] = useState<WootingDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wootilityAvailable, setWootilityAvailable] = useState(false);

  const preferences = getPreferenceValues<Preferences>();
  const wootilityAPI = new WootilityAPI(preferences.wootilityPath);

  const checkWootilityAvailability = useCallback(async () => {
    try {
      const available = await wootilityAPI.isWootilityAvailable();
      setWootilityAvailable(available);
      return available;
    } catch (err) {
      setWootilityAvailable(false);
      return false;
    }
  }, [wootilityAPI]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Wootility is available first
      const available = await checkWootilityAvailability();
      if (!available) {
        throw new Error('Wootility is not installed or not found. Please install Wootility and try again.');
      }

      // Load devices
      const devicesData = await wootilityAPI.getDevices();
      setDevices(devicesData);

      if (devicesData.length === 0) {
        setProfiles([]);
        return;
      }

      // Load profiles for all devices
      const allProfiles: WootingProfile[] = [];
      
      for (const device of devicesData) {
        try {
          const deviceProfiles = await wootilityAPI.getProfiles(device.serial);
          allProfiles.push(...deviceProfiles);
        } catch (err) {
          console.error(`Error loading profiles for device ${device.serial}:`, err);
          // Continue with other devices
        }
      }

      setProfiles(allProfiles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Don't show toast for initial load if it's just a detection issue
      if (!errorMessage.includes('not found') && !errorMessage.includes('not installed')) {
        showToast({
          style: Toast.Style.Failure,
          title: 'Error loading profiles',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  }, [wootilityAPI, checkWootilityAvailability]);

  const switchProfile = useCallback(async (profile: WootingProfile) => {
    try {
      if (profile.active) {
        if (preferences.enableNotifications) {
          showToast({
            style: Toast.Style.Success,
            title: 'Profile already active',
            message: `${profile.name} is already the active profile`
          });
        }
        return;
      }

      // Show loading toast
      const loadingToast = await showToast({
        style: Toast.Style.Animated,
        title: 'Switching profile...',
        message: `Switching to ${profile.name}`
      });

      const success = await wootilityAPI.switchProfile(
        profile.deviceSerial, 
        profile.profileIndex
      );

      if (success) {
        // Reload data to update active states
        await loadData();
        
        if (preferences.enableNotifications) {
          loadingToast.style = Toast.Style.Success;
          loadingToast.title = 'Profile switched';
          loadingToast.message = `Switched to ${profile.name}`;
        } else {
          loadingToast.hide();
        }
      } else {
        loadingToast.style = Toast.Style.Failure;
        loadingToast.title = 'Failed to switch profile';
        loadingToast.message = 'Check that Wootility is running and the device is connected';
      }
    } catch (err) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Error switching profile',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    }
  }, [wootilityAPI, loadData, preferences.enableNotifications]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    profiles,
    devices,
    loading,
    error,
    switchProfile,
    reload: loadData,
    wootilityAvailable
  };
}