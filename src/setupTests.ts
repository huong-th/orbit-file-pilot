
import '@testing-library/jest-dom';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    protocol: 'http:',
    hostname: 'localhost',
    href: 'http://localhost:3000/',
  },
  writable: true,
});

// Mock PublicKeyCredential for WebAuthn tests
Object.defineProperty(window, 'PublicKeyCredential', {
  value: class MockPublicKeyCredential {
    static isUserVerifyingPlatformAuthenticatorAvailable() {
      return Promise.resolve(true);
    }
  },
  writable: true,
});

// Mock navigator.credentials
Object.defineProperty(navigator, 'credentials', {
  value: {
    create: jest.fn(),
    get: jest.fn(),
  },
  writable: true,
});

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore specific console outputs in tests
  // log: jest.fn(),
  // warn: jest.fn(),
};
