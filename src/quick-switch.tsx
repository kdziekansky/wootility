import { showHUD, showToast, Toast, LaunchProps, getPreferenceValues } from '@raycast/api';
import { WootilityAPI } from './utils/wootility-api';

interface QuickSwitchArguments {
  profileNumber: string;
}

interface Preferences {
  wootilityPath?: string;
  defaultProfile?: string;
  enableNotifications?: boolean;
}

export default async function QuickSwitchCommand(
  props: LaunchProps<{ arguments: QuickSwitchArguments }>
) {
  const { profileNumber } = props.arguments;
  const preferences = getPreferenceValues<Preferences>();
  
  try {
    const wootilityAPI = new WootilityAPI(preferences.wootilityPath);
    
    // Check if Wootility is available
    const isAvailable = await wootilityAPI.isWootilityAvailable();
    if (!isAvailable) {
      await showHUD('❌ Wootility not found. Please install Wootility first.');
      return;
    }

    // Get connected devices
    const devices = await wootilityAPI.getDevices();
    
    if (devices.length === 0) {
      await showHUD('❌ No Wooting devices found. Check your connection.');
      return;
    }

    // Validate profile number
    const validation = wootilityAPI.validateProfileNumber(profileNumber);
    if (!validation.valid) {
      await showHUD(`❌ ${validation.error}`);
      return;
    }

    const profileIndex = validation.number;
    let successCount = 0;
    let totalDevices = devices.length;

    // Show progress for multiple devices
    if (totalDevices > 1) {
      await showToast({
        style: Toast.Style.Animated,
        title: 'Switching profiles...',
        message: `Switching ${totalDevices} devices to Profile ${profileNumber}`
      });
    }

    // Switch profile on all connected devices
    for (const device of devices) {
      try {
        // Check if device has enough profiles
        if (profileIndex >= device.profiles.length) {
          console.warn(`Device ${device.modelName} doesn't have Profile ${profileNumber}`);
          continue;
        }

        const success = await wootilityAPI.switchProfile(device.serial, profileIndex);
        if (success) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error switching profile for device ${device.serial}:`, error);
      }
    }

    // Show result
    if (successCount === totalDevices) {
      const profileName = devices[0]?.profiles[profileIndex] || `Profile ${profileNumber}`;
      const message = totalDevices === 1 
        ? `Switched to ${profileName}`
        : `Switched ${successCount} devices to ${profileName}`;
      
      await showHUD(`✅ ${message}`);
    } else if (successCount > 0) {
      await showHUD(`⚠️ Switched ${successCount}/${totalDevices} devices to Profile ${profileNumber}`);
    } else {
      await showHUD(`❌ Failed to switch to Profile ${profileNumber}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Quick switch error:', error);
    
    if (errorMessage.includes('not found') || errorMessage.includes('not installed')) {
      await showHUD('❌ Wootility not found. Check installation.');
    } else {
      await showHUD(`❌ Error: ${errorMessage}`);
    }
  }
}