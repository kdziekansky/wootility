import { 
  List, 
  ActionPanel, 
  Action, 
  Icon, 
  Color,
  Detail,
  getPreferenceValues 
} from '@raycast/api';
import { useState, useEffect } from 'react';
import { WootilityAPI, WootingDevice } from './utils/wootility-api';

interface Preferences {
  wootilityPath?: string;
}

export default function DeviceInfo() {
  const [devices, setDevices] = useState<WootingDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<WootingDevice | null>(null);

  const preferences = getPreferenceValues<Preferences>();
  const wootilityAPI = new WootilityAPI(preferences.wootilityPath);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);

      const isAvailable = await wootilityAPI.isWootilityAvailable();
      if (!isAvailable) {
        throw new Error('Wootility is not installed or not found');
      }

      const devicesData = await wootilityAPI.getDevices();
      setDevices(devicesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (selectedDevice) {
    return <DeviceDetailView device={selectedDevice} onBack={() => setSelectedDevice(null)} />;
  }

  if (error) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="Device Information Unavailable"
          description={error}
          actions={
            <ActionPanel>
              <Action
                title="Retry"
                onAction={loadDevices}
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
          icon={Icon.Keyboard}
          title="No Wooting Devices Found"
          description="Connect your Wooting keyboard and make sure it's detected by Wootility"
          actions={
            <ActionPanel>
              <Action
                title="Refresh"
                onAction={loadDevices}
                icon={Icon.ArrowClockwise}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List 
      isLoading={loading} 
      navigationTitle="Device Information"
    >
      <List.Section title="Connected Devices" subtitle={`${devices.length} device(s) found`}>
        {devices.map(device => (
          <DeviceListItem
            key={device.serial}
            device={device}
            onSelect={setSelectedDevice}
            onRefresh={loadDevices}
          />
        ))}
      </List.Section>
    </List>
  );
}

interface DeviceListItemProps {
  device: WootingDevice;
  onSelect: (device: WootingDevice) => void;
  onRefresh: () => void;
}

function DeviceListItem({ device, onSelect, onRefresh }: DeviceListItemProps) {
  const accessories = [
    { text: device.connected ? 'Connected' : 'Disconnected' },
    { 
      icon: { 
        source: device.connected ? Icon.CheckCircle : Icon.XMarkCircle,
        tintColor: device.connected ? Color.Green : Color.Red
      }
    }
  ];

  if (device.rgbEnabled) {
    accessories.unshift({ text: 'RGB' });
  }

  return (
    <List.Item
      icon={{ 
        source: Icon.Desktop, 
        tintColor: device.connected ? Color.Blue : Color.SecondaryText 
      }}
      title={device.modelName}
      subtitle={`Serial: ${device.serial} • ${device.profiles.length} profiles`}
      accessories={accessories}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Device Actions">
            <Action
              title="View Details"
              onAction={() => onSelect(device)}
              icon={Icon.Info}
            />
            <Action
              title="Refresh Devices"
              onAction={onRefresh}
              shortcut={{ modifiers: ['cmd'], key: 'r' }}
              icon={Icon.ArrowClockwise}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

interface DeviceDetailViewProps {
  device: WootingDevice;
  onBack: () => void;
}

function DeviceDetailView({ device, onBack }: DeviceDetailViewProps) {
  const markdown = `# ${device.modelName}

## Device Information

**Serial Number:** \`${device.serial}\`
**Connection Status:** ${device.connected ? '🟢 Connected' : '🔴 Disconnected'}
**RGB Support:** ${device.rgbEnabled ? '✅ Enabled' : '❌ Not Available'}
**Current Profile:** ${device.currentProfile + 1} (${device.profiles[device.currentProfile] || 'Unknown'})

## Available Profiles

${device.profiles.map((profile, index) => {
  const isActive = index === device.currentProfile;
  return `${isActive ? '▶️' : '▫️'} **Profile ${index + 1}:** ${profile}${isActive ? ' *(Active)*' : ''}`;
}).join('\n')}

## Technical Details

- **Total Profiles:** ${device.profiles.length}
- **Device Type:** Analog Keyboard
- **SDK Support:** Wooting Analog SDK
${device.rgbEnabled ? '- **RGB SDK Support:** Wooting RGB SDK' : ''}

---

## Troubleshooting

If your device appears disconnected:

1. **Check USB Connection** - Ensure the keyboard is properly connected
2. **Restart Wootility** - Close and reopen Wootility application  
3. **Check Drivers** - Verify Wooting drivers are installed
4. **Reconnect Device** - Try unplugging and reconnecting the keyboard

## Support Resources

- [Wooting Support Center](https://wooting.io/support)
- [Wootility Documentation](https://wooting.io/wootility)
- [Community Discord](https://wooting.io/discord)
`;

  return (
    <Detail
      navigationTitle={device.modelName}
      markdown={markdown}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Navigation">
            <Action
              title="Back to Device List"
              onAction={onBack}
              icon={Icon.ArrowLeft}
            />
          </ActionPanel.Section>
          
          <ActionPanel.Section title="External Links">
            <Action.OpenInBrowser
              title="Wooting Support"
              url="https://wooting.io/support"
              icon={Icon.QuestionMark}
            />
            <Action.OpenInBrowser
              title="Download Wootility"
              url="https://wooting.io/wootility"
              icon={Icon.Download}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}