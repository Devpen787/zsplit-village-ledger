
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.setInterval and clearInterval
Object.defineProperty(window, 'setInterval', {
  value: jest.fn((callback: () => void, delay: number) => {
    return setTimeout(callback, delay);
  })
});

Object.defineProperty(window, 'clearInterval', {
  value: jest.fn((id: number) => {
    clearTimeout(id);
  })
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
});
