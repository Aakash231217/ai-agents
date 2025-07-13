/**
 * Layout Components Barrel Export
 * 
 * This file serves as a central export point for all layout components,
 * making imports cleaner and more organized throughout the application.
 * 
 * Usage:
 * import { Header, Footer, Sidebar } from '@/components/layout';
 */

// Core layout components
export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as Sidebar } from './Sidebar';
export { default as Navigation } from './Navigation';
export { default as Layout } from './Layout';

// Layout utility components
export { default as Container } from './Container';
export { default as Section } from './Section';
export { default as Grid } from './Grid';

// Layout-specific types and interfaces
export type {
  LayoutProps,
  HeaderProps,
  FooterProps,
  SidebarProps,
  NavigationProps,
  ContainerProps,
  SectionProps,
  GridProps,
  LayoutVariant,
  ResponsiveBreakpoint
} from './types';

// Layout hooks and utilities
export { useLayout } from './hooks/useLayout';
export { useResponsive } from './hooks/useResponsive';
export { useSidebar } from './hooks/useSidebar';

// Layout constants and configurations
export {
  LAYOUT_BREAKPOINTS,
  LAYOUT_VARIANTS,
  DEFAULT_LAYOUT_CONFIG,
  GRID_SYSTEM_CONFIG
} from './constants';

// Layout context providers
export { LayoutProvider, LayoutContext } from './context/LayoutContext';
export { SidebarProvider, SidebarContext } from './context/SidebarContext';

// Re-export commonly used layout utilities
export {
  getLayoutClasses,
  calculateGridColumns,
  getResponsiveValue,
  validateLayoutProps
} from './utils';

/**
 * Default layout configuration object
 * Can be imported and used as a base configuration
 */
export const defaultLayoutConfig = {
  header: {
    sticky: true,
    height: '64px',
    showLogo: true,
    showNavigation: true
  },
  footer: {
    sticky: false,
    showSocial: true,
    showLinks: true,
    showCopyright: true
  },
  sidebar: {
    collapsible: true,
    defaultCollapsed: false,
    width: '280px',
    collapsedWidth: '64px'
  },
  container: {
    maxWidth: '1200px',
    padding: '1rem',
    centered: true
  }
} as const;

/**
 * Layout component variants for consistent styling
 */
export const layoutVariants = {
  default: 'default',
  minimal: 'minimal',
  dashboard: 'dashboard',
  landing: 'landing',
  auth: 'auth'
} as const;

/**
 * Responsive breakpoints used throughout layout components
 */
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;