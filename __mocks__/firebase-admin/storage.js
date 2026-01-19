export const getStorage = jest.fn(() => ({
  bucket: jest.fn(() => ({
    file: jest.fn(() => ({
      createWriteStream: jest.fn(() => ({
        on: jest.fn(),
        end: jest.fn(),
      })),
      getSignedUrl: jest.fn(() => Promise.resolve(["https://mock-signed-url.com"])),
    })),
  })),
}));