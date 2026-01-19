export const getFirestore = jest.fn(() => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({
        exists: true,
        data: () => ({ id: "test-user", email: "test@example.com" }),
        id: "test-user",
      })),
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
    })),
    where: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          empty: false,
          docs: [{
            data: () => ({ id: "test-user", email: "test@example.com", password: "hashed-password" }),
            id: "test-user",
            ref: {
              update: jest.fn(() => Promise.resolve()),
            },
          }],
        })),
      })),
    })),
  })),
}));