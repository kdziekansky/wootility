import { 
  List, 
  ActionPanel, 
  Action, 
  Icon, 
  Color, 
  showToast, 
  Toast,
  getPreferenceValues 
} from '@raycast/api';
import { useState, useEffect } from 'react';
import { WootilityAPI, RGBEffect, WootingDevice } from './utils/wootility-api';

interface Preferences {
  wootilityPath?: string;
  enableNotifications?: boolean;
}

export default function RGBControl() {
  const [rgbEffects, setRgbEffects] = useState<RGBEffect[]>([]);
  const [devices, setDevices] = useState<WootingDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const preferences = getPreferenceValues<Preferences>();
  const wootilityAPI = new WootilityAPI(preferences.wootilityPath);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Wootility is available
      const isAvailable = await wootilityAPI.isWootilityAvailable();
      if (!isAvailable) {
        throw new Error('Wootility is not installed or not found');
      }

      // Load devices and RGB effects
      const [devicesData, effectsData] = await Promise.all([
        wootilityAPI.getDevices(),
        wootilityAPI.getRGBEffects()
      ]);

      setDevices(devicesData);
      setRgbEffects(effectsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyRGBEffect = async (effect: RGBEffect, deviceSerial?: string) => {
    try {
      const targetDevices = deviceSerial 
        ? devices.filter(d => d.serial === deviceSerial)
        : devices.filter(d => d.rgbEnabled);

      if (targetDevices.length === 0) {
        showToast({
          style: Toast.Style.Failure,
          title: 'No RGB devices available',
          message: 'No devices with RGB support found'
        });
        return;
      }

      // Show loading toast
      const loadingToast = await showToast({
        style: Toast.Style.Animated,
        title: 'Applying RGB effect...',
        message: `Setting ${effect.name} on ${targetDevices.length} device(s)`
      });

      let successCount = 0;

      for (const device of targetDevices) {
        try {
          const success = await wootilityAPI.applyRGBEffect(device.serial, effect.id);
          if (success) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error applying RGB effect to device ${device.serial}:`, error);
        }
      }

      // Update toast with result
      if (successCount === targetDevices.length) {
        loadingToast.style = Toast.Style.Success;
        loadingToast.title = 'RGB effect applied';
        loadingToast.message = `${effect.name} applied to ${successCount} device(s)`;
      } else if (successCount > 0) {
        loadingToast.style = Toast.Style.Success;
        loadingToast.title = 'Partially applied';
        loadingToast.message = `${effect.name} applied to ${successCount}/${targetDevices.length} devices`;
      } else {
        loadingToast.style = Toast.Style.Failure;
        loadingToast.title = 'Failed to apply effect';
        loadingToast.message = 'Check that devices are connected and Wootility is running';
      }
    } catch (err) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Error applying RGB effect',
        message: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    }
  };

  if (error) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="RGB Control Unavailable"
          description={error}
          actions={
            <ActionPanel>
              <Action
                title="Retry"
                onAction={loadData}
                icon={Icon.ArrowClockwise}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  if (!loading && devices.length === 0) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.LightBulb}
          title="No RGB Devices Found"
          description="Connect your Wooting keyboard with RGB support to control lighting"
          actions={
            <ActionPanel>
              <Action
                title="Refresh"
                onAction={loadData}
                icon={Icon.ArrowClockwise}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  const rgbDevices = devices.filter(d => d.rgbEnabled);

  return (
    <List 
      isLoading={loading} 
      searchBarPlaceholder="Search RGB effects..."
      navigationTitle="RGB Control"
    >
      <List.Section title="Quick Effects" subtitle="Apply to all RGB devices">
        {rgbEffects.map(effect => (
          <RGBEffectItem
            key={effect.id}
            effect={effect}
            onApply={(effect) => applyRGBEffect(effect)}
            showDeviceActions={rgbDevices.length > 1}
            devices={rgbDevices}
          />
        ))}
      </List.Section>

      {rgbDevices.length > 1 && (
        <List.Section title="Device-Specific Control" subtitle="Apply effects to individual devices">
          {rgbDevices.map(device => (
            <List.Item
              key={`device-${device.serial}`}
              icon={{ source: Icon.Desktop, tintColor: Color.Blue }}
              title={device.modelName}
              subtitle={`Serial: ${device.serial}`}
              accessories={[{ text: 'RGB Enabled' }]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section title={`${device.modelName} RGB Effects`}>
                    {rgbEffects.map(effect => (
                      <Action
                        key={`${device.serial}-${effect.id}`}
                        title={`Apply ${effect.name}`}
                        onAction={() => applyRGBEffect(effect, device.serial)}
                        icon={getRGBEffectIcon(effect)}
                      />
                    ))}
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

interface RGBEffectItemProps {
  effect: RGBEffect;
  onApply: (effect: RGBEffect) => void;
  showDeviceActions: boolean;
  devices: WootingDevice[];
}

function RGBEffectItem({ effect, onApply, showDeviceActions, devices }: RGBEffectItemProps) {
  const icon = getRGBEffectIcon(effect);
  
  return (
    <List.Item
      icon={icon}
      title={effect.name}
      subtitle={effect.description}
      accessories={[{ text: effect.category.charAt(0).toUpperCase() + effect.category.slice(1) }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Apply Effect">
            <Action
              title={`Apply ${effect.name}`}
              onAction={() => onApply(effect)}
              icon={icon}
            />
          </ActionPanel.Section>
          
          {showDeviceActions && (
            <ActionPanel.Section title="Apply to Specific Device">
              {devices.map(device => (
                <Action
                  key={device.serial}
                  title={`Apply to ${device.modelName}`}
                  onAction={() => onApply(effect)}
                  icon={Icon.Desktop}
                />
              ))}
            </ActionPanel.Section>
          )}
        </ActionPanel>
      }
    />
  );
}

function getRGBEffectIcon(effect: RGBEffect): { source: Icon; tintColor?: Color } {
  switch (effect.category) {
    case 'dynamic':
      return { source: Icon.Stars, tintColor: Color.Purple };
    case 'reactive':
      return { source: Icon.Bolt, tintColor: Color.Yellow };
    case 'static':
      if (effect.id.includes('red')) return { source: Icon.Circle, tintColor: Color.Red };
      if (effect.id.includes('blue')) return { source: Icon.Circle, tintColor: Color.Blue };
      if (effect.id.includes('white')) return { source: Icon.Circle, tintColor: Color.PrimaryText };
      return { source: Icon.Circle, tintColor: Color.Green };
    case 'off':
      return { source: Icon.CircleDisabled, tintColor: Color.SecondaryText };
    default:
      return { source: Icon.LightBulb, tintColor: Color.Orange };
  }
}