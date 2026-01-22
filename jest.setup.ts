
import '@testing-library/jest-dom';

// Mock HTMLMediaElement properties and methods that JSDOM doesn't implement
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: jest.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: jest.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
    configurable: true,
    value: jest.fn(),
});

// Mock global fetch
global.fetch = jest.fn();

// Mock HTMLVideoElement specifically just in case
Object.defineProperty(window.HTMLVideoElement.prototype, 'play', {
    configurable: true,
    value: jest.fn().mockImplementation(() => Promise.resolve()),
});
