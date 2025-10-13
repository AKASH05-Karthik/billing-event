import { Dimensions, Platform } from 'react-native';

// Get screen dimensions
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Breakpoints
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

// Device type detection
export const getDeviceType = () => {
  const { width } = getScreenDimensions();
  
  if (width < BREAKPOINTS.mobile) {
    return 'mobile-small';
  } else if (width < BREAKPOINTS.tablet) {
    return 'mobile';
  } else if (width < BREAKPOINTS.desktop) {
    return 'tablet';
  } else if (width < BREAKPOINTS.largeDesktop) {
    return 'desktop';
  } else {
    return 'large-desktop';
  }
};

// Check if device is mobile
export const isMobile = () => {
  const deviceType = getDeviceType();
  return deviceType === 'mobile-small' || deviceType === 'mobile';
};

// Check if device is tablet
export const isTablet = () => {
  return getDeviceType() === 'tablet';
};

// Check if device is desktop
export const isDesktop = () => {
  const deviceType = getDeviceType();
  return deviceType === 'desktop' || deviceType === 'large-desktop';
};

// Responsive font size
export const responsiveFontSize = (baseFontSize) => {
  const { width } = getScreenDimensions();
  const scale = width / BREAKPOINTS.tablet;
  const newSize = baseFontSize * scale;
  
  // Limit font size scaling
  if (newSize < baseFontSize * 0.8) {
    return Math.round(baseFontSize * 0.8);
  } else if (newSize > baseFontSize * 1.3) {
    return Math.round(baseFontSize * 1.3);
  }
  return Math.round(newSize);
};

// Responsive spacing
export const responsiveSpacing = (baseSpacing) => {
  const { width } = getScreenDimensions();
  
  if (width < BREAKPOINTS.mobile) {
    return baseSpacing * 0.8;
  } else if (width < BREAKPOINTS.tablet) {
    return baseSpacing;
  } else if (width < BREAKPOINTS.desktop) {
    return baseSpacing * 1.2;
  } else {
    return baseSpacing * 1.5;
  }
};

// Get responsive width
export const getResponsiveWidth = (percentage) => {
  const { width } = getScreenDimensions();
  return (width * percentage) / 100;
};

// Get container max width based on device
export const getContainerMaxWidth = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile-small':
    case 'mobile':
      return '100%';
    case 'tablet':
      return 720;
    case 'desktop':
      return 960;
    case 'large-desktop':
      return 1200;
    default:
      return '100%';
  }
};

// Get number of columns for grid layout
export const getGridColumns = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile-small':
    case 'mobile':
      return 1;
    case 'tablet':
      return 2;
    case 'desktop':
    case 'large-desktop':
      return 3;
    default:
      return 1;
  }
};

// Platform-specific styles
export const platformStyles = (webStyle, nativeStyle) => {
  return Platform.OS === 'web' ? webStyle : nativeStyle;
};

// Responsive padding
export const getResponsivePadding = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile-small':
      return 12;
    case 'mobile':
      return 16;
    case 'tablet':
      return 20;
    case 'desktop':
    case 'large-desktop':
      return 24;
    default:
      return 16;
  }
};

// Hook for responsive values (use with useState)
export const useResponsive = () => {
  const dimensions = getScreenDimensions();
  const deviceType = getDeviceType();
  
  return {
    dimensions,
    deviceType,
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    containerMaxWidth: getContainerMaxWidth(),
    gridColumns: getGridColumns(),
    padding: getResponsivePadding(),
  };
};
