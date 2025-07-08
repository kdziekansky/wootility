/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `manage-profiles` command */
  export type ManageProfiles = ExtensionPreferences & {}
  /** Preferences accessible in the `quick-switch` command */
  export type QuickSwitch = ExtensionPreferences & {}
  /** Preferences accessible in the `rgb-control` command */
  export type RgbControl = ExtensionPreferences & {}
  /** Preferences accessible in the `device-info` command */
  export type DeviceInfo = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `manage-profiles` command */
  export type ManageProfiles = {}
  /** Arguments passed to the `quick-switch` command */
  export type QuickSwitch = {
  /** Profile number (1-4) */
  "profileNumber": string
}
  /** Arguments passed to the `rgb-control` command */
  export type RgbControl = {}
  /** Arguments passed to the `device-info` command */
  export type DeviceInfo = {}
}

