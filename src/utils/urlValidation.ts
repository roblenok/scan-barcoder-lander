
export const validateEndpointUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  // Basic URL format validation
  try {
    const parsedUrl = new URL(trimmedUrl);
    
    // Check for supported protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
    }

    // Prevent localhost and private IP ranges for security
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return { isValid: false, error: 'Localhost URLs are not allowed for security reasons' };
    }

    // Block private IP ranges (basic check)
    const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
    if (privateIpRegex.test(hostname)) {
      return { isValid: false, error: 'Private IP addresses are not allowed for security reasons' };
    }

    // Block obviously suspicious patterns
    if (hostname.includes('admin') || hostname.includes('internal')) {
      return { isValid: false, error: 'Potentially unsafe hostname detected' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const sanitizeUrl = (url: string): string => {
  return url.trim();
};
