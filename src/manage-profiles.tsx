import { 
  List, 
  ActionPanel, 
  Action, 
  Icon, 
  Color, 
  Detail,
  openExtensionPreferences
} from '@raycast/api';
import { useProfiles } from './hooks/useProfiles';
import { WootingProfile, WootingDevice } from './utils/wootility-api';

export default function ManageProfiles() {
  const { 
    profiles, 
    devices, 
    loading, 
    error, 
    switchProfile, 
    reload, 
    wootilityAvailable 
  } = useProfiles();

  // Show error state if Wootility is not available
  if (!loading && !wootilityAvailable) {
    return (
      <Detail
        markdown={`# Wootility Not Found

Wootility Manager requires Wootility to be installed on your system.

## Installation Steps:

1. **Download Wootility** from the official Wooting website
2. **Install Wootility** following the setup wizard
3. **Connect your Wooting keyboard** 
4. **Run Wootility** at least once to initialize profiles

## Alternative Solutions:

- If Wootility is installed in a custom location, you can specify the path in extension preferences
- Make sure your Wooting keyboard is connected and recognized by Windows

## Troubleshooting:

- Restart Raycast after installing Wootility
- Check if Wootility appears in your system tray
- Verify your keyboard is detected in Wootility

---

**Need help?** Check the [Wooting Support](https://wooting.io/support) page.`}
        actions={
          <ActionPanel>
            <Action
              title="Open Extension Preferences"
              onAction={openExtensionPreferences}
              icon={Icon.Gear}
            />
            <Action
              title="Retry Detection"
              onAction={reload}
              icon={Icon.ArrowClockwise}
            />
            <Action.OpenInBrowser
              title="Download Wootility"
              url="https://wooting.io/wootility"
              icon={Icon.Download}
            />
          </ActionPanel>
        }
      />
    );
  }

  // Show error state for other errors
  if (error && !loading) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="Error Loading Profiles"
          description={error}
          actions={
            <ActionPanel>
              <Action
                title="Retry"
                onAction={reload}
                icon={Icon.ArrowClockwise}
              />
              <Action
                title="Open Extension Preferences"
                onAction={openExtensionPreferences}
                icon={Icon.Gear}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  // Show empty state if no devices found
  if (!loading && devices.length === 0) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.Keyboard}
          title="No Wooting Devices Found"
          description="Make sure your Wooting keyboard is connected and detected by Wootility"
          actions={
            <ActionPanel>
              <Action
                title="Refresh"
                onAction={reload}
                icon={Icon.ArrowClockwise}
              />
              <Action
                title="Open Wootility"
                onAction={() => {
                  console.log('Opening Wootility...');
                }}
                icon={Icon.Desktop}
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
      searchBarPlaceholder="Search profiles..."
      navigationTitle="Wootility Manager"
    >
      {devices.map(device => (
        <List.Section 
          key={device.serial} 
          title={`${device.modelName} (${device.serial})`}
          subtitle={`${device.connected ? 'Connected' : 'Disconnected'} • Profile ${device.currentProfile + 1} Active`}
        >
          {profiles
            .filter(profile => profile.deviceSerial === device.serial)
            .map(profile => (
              <ProfileListItem
                key={profile.id}
                profile={profile}
                device={device}
                onSwitch={switchProfile}
                onRefresh={reload}
              />
            ))}
        </List.Section>
      ))}
    </List>
  );
}

interface ProfileListItemProps {
  profile: WootingProfile;
  device: WootingDevice;
  onSwitch: (profile: WootingProfile) => Promise<void>;
  onRefresh: () => Promise<void>;
}

function ProfileListItem({ profile, device, onSwitch, onRefresh }: ProfileListItemProps) {
  const accessories = [
    { text: `Profile ${profile.profileIndex + 1}` }
  ];

  if (profile.active) {
    accessories.unshift({ 
      text: 'Active'
    });
  }

  return (
    <List.Item
      icon={{
        source: profile.active ? Icon.CheckCircle : Icon.Circle,
        tintColor: profile.active ? Color.Green : Color.SecondaryText
      }}
      title={profile.name}
      subtitle={profile.description}
      accessories={accessories}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Profile Actions">
            <Action
              title={profile.active ? 'Already Active' : 'Switch to Profile'}
              onAction={() => onSwitch(profile)}
              icon={profile.active ? Icon.CheckCircle : Icon.Play}
            />
          </ActionPanel.Section>
          
          <ActionPanel.Section title="Device Actions">
            <Action
              title="View Device Info"
              onAction={() => console.log('Device info:', device)}
              icon={Icon.Info}
            />
            <Action
              title="Refresh Profiles"
              onAction={onRefresh}
              shortcut={{ modifiers: ['cmd'], key: 'r' }}
              icon={Icon.ArrowClockwise}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Settings">
            <Action
              title="Open Extension Preferences"
              onAction={openExtensionPreferences}
              shortcut={{ modifiers: ['cmd'], key: ',' }}
              icon={Icon.Gear}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}