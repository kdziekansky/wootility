import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface WootingProfile {
  id: string;
  name: string;
  active: boolean;
  deviceSerial: string;
  profileIndex: number;
  description?: string;
}

export interface WootingDevice {
  serial: string;
  modelName: string;
  connected: boolean;
  profiles: string[];
  currentProfile: number;
  rgbEnabled: boolean;
}

export interface RGBEffect {
  id: string;
  name: string;
  description: string;
  category: 'static' | 'dynamic' | 'reactive' | 'off';
}

export class WootilityAPI {
  private wootilityPath: string;
  private configPath: string;

  constructor(customPath?: string) {
    this.wootilityPath = customPath || this.findWootilityPath();
    this.configPath = this.getConfigPath();
  }

  private findWootilityPath(): string {
    const possiblePaths = [
      'C:\\Program Files\\WootingUtility\\WootingUtility.exe',
      'C:\\Program Files (x86)\\WootingUtility\\WootingUtility.exe',
      join(homedir(), 'AppData', 'Local', 'WootingUtility', 'WootingUtility.exe'),
      'C:\\Program Files\\Wooting\\Wootility\\Wootility.exe',
      'C:\\Program Files (x86)\\Wooting\\Wootility\\Wootility.exe'
    ];

    for (const wootPath of possiblePaths) {
      if (existsSync(wootPath)) {
        return wootPath;
      }
    }
    
    // Return mock path for development
    return 'wootility-mock';
  }

  private getConfigPath(): string {
    return join(process.env.APPDATA || homedir(), 'WootingProfileSwitcher', 'config.json');
  }

  // Check if Wootility is available
  async isWootilityAvailable(): Promise<boolean> {
    try {
      return existsSync(this.wootilityPath) || this.wootilityPath === 'wootility-mock';
    } catch {
      return true; // Return true for mock development
    }
  }

  // Get connected devices
  async getDevices(): Promise<WootingDevice[]> {
    try {
      // Method 1: Try to read from Profile Switcher config
      if (existsSync(this.configPath)) {
        const config = JSON.parse(readFileSync(this.configPath, 'utf8'));
        
        const devices: WootingDevice[] = Object.entries(config.devices || {}).map(([serial, device]: [string, any]) => ({
          serial,
          modelName: device.model_name || 'Unknown Wooting Device',
          connected: true,
          profiles: device.profiles || ['Default', 'Gaming', 'Typing', 'Custom'],
          currentProfile: 0,
          rgbEnabled: true
        }));

        return devices;
      }
      
      // Method 2: Return mock devices for development
      return this.getMockDevices();
    } catch (error) {
      console.error('Error getting devices:', error);
      return this.getMockDevices();
    }
  }

  private getMockDevices(): WootingDevice[] {
    return [
      {
        serial: 'WK001',
        modelName: 'Wooting One',
        connected: true,
        profiles: ['Default', 'Gaming', 'Typing', 'Custom'],
        currentProfile: 0,
        rgbEnabled: true
      },
      {
        serial: 'WK002', 
        modelName: 'Wooting Two HE',
        connected: true,
        profiles: ['Work', 'Gaming', 'Streaming', 'RGB Show'],
        currentProfile: 1,
        rgbEnabled: true
      }
    ];
  }

  // Switch profile for a device
  async switchProfile(deviceSerial: string, profileIndex: number): Promise<boolean> {
    try {
      console.log(`Switching device ${deviceSerial} to profile ${profileIndex}`);
      
      // For mock development, always return true
      if (this.wootilityPath === 'wootility-mock') {
        return true;
      }

      // Try to switch via Wootility
      return await this.switchViaWootility(deviceSerial, profileIndex);
    } catch (error) {
      console.error('Error switching profile:', error);
      return false;
    }
  }

  private async switchViaWootility(deviceSerial: string, profileIndex: number): Promise<boolean> {
    try {
      // Mock implementation - in real scenario this would call Wootility
      console.log(`Mock: Switching ${deviceSerial} to profile ${profileIndex}`);
      return true;
    } catch {
      return false;
    }
  }

  // Get current active profile for a device
  async getCurrentProfile(deviceSerial: string): Promise<number> {
    try {
      // Mock implementation
      return 0;
    } catch (error) {
      console.error('Error getting current profile:', error);
      return 0;
    }
  }

  // Get all profiles for a device
  async getProfiles(deviceSerial: string): Promise<WootingProfile[]> {
    const devices = await this.getDevices();
    const device = devices.find(d => d.serial === deviceSerial);
    
    if (!device) return [];

    const currentProfile = await this.getCurrentProfile(deviceSerial);

    return device.profiles.map((name, index) => ({
      id: `${deviceSerial}-${index}`,
      name,
      active: index === currentProfile,
      deviceSerial,
      profileIndex: index,
      description: this.getProfileDescription(name, index)
    }));
  }

  private getProfileDescription(name: string, index: number): string {
    const descriptions: Record<string, string> = {
      'default': 'Standard keyboard configuration',
      'gaming': 'Optimized for gaming with low latency',
      'typing': 'Comfortable for extended typing sessions',
      'custom': 'User-customized profile',
      'work': 'Professional work environment settings',
      'streaming': 'Optimized for content creation',
      'rgb show': 'Spectacular RGB lighting effects'
    };
    
    return descriptions[name.toLowerCase()] || `Profile ${index + 1} configuration`;
  }

  // RGB Control Methods
  async getRGBEffects(): Promise<RGBEffect[]> {
    return [
      {
        id: 'rainbow-wave',
        name: 'Rainbow Wave',
        description: 'Smooth rainbow wave across the keyboard',
        category: 'dynamic'
      },
      {
        id: 'breathing',
        name: 'Breathing',
        description: 'Gentle breathing effect with smooth transitions',
        category: 'dynamic'
      },
      {
        id: 'reactive',
        name: 'Reactive',
        description: 'Keys light up when pressed',
        category: 'reactive'
      },
      {
        id: 'static-red',
        name: 'Static Red',
        description: 'Solid red lighting',
        category: 'static'
      },
      {
        id: 'static-blue',
        name: 'Static Blue', 
        description: 'Solid blue lighting',
        category: 'static'
      },
      {
        id: 'static-white',
        name: 'Static White',
        description: 'Solid white lighting',
        category: 'static'
      },
      {
        id: 'off',
        name: 'Turn Off',
        description: 'Disable RGB lighting',
        category: 'off'
      }
    ];
  }

  async applyRGBEffect(deviceSerial: string, effectId: string): Promise<boolean> {
    try {
      console.log(`Applying RGB effect ${effectId} to device ${deviceSerial}`);
      
      // Mock implementation - always return true for development
      return true;
    } catch (error) {
      console.error('Error applying RGB effect:', error);
      return false;
    }
  }

  // Utility method to validate profile number
  validateProfileNumber(profileNumber: string): { valid: boolean; number: number; error?: string } {
    const num = parseInt(profileNumber);
    
    if (isNaN(num)) {
      return { valid: false, number: 0, error: 'Profile number must be a number' };
    }
    
    if (num < 1 || num > 4) {
      return { valid: false, number: 0, error: 'Profile number must be between 1 and 4' };
    }
    
    return { valid: true, number: num - 1 };
  }
}