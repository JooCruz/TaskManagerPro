/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#1e40af';
const tintColorDark = '#60a5fa';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#fafbfc',
    tint: tintColorLight,
    icon: '#475569',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f1f5f9',
    background: '#0f172a',
    tint: tintColorDark,
    icon: '#cbd5e1',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
  },
};

export const ProfessionalColors = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',
  secondary: '#059669',
  accent: '#f59e0b',
  danger: '#dc2626',
  warning: '#ea580c',
  success: '#10b981',
  info: '#0ea5e9',
  neutral100: '#f8fafc',
  neutral200: '#f1f5f9',
  neutral300: '#e2e8f0',
  neutral400: '#cbd5e1',
  neutral500: '#94a3b8',
  neutral600: '#64748b',
  neutral700: '#475569',
  neutral800: '#1e293b',
  neutral900: '#0f172a',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
