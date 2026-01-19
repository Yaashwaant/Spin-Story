interface MockUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  onboarded: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// In-memory user storage for development
const mockUsers: MockUser[] = [];

export const mockUserStore = {
  async createUser(data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    const id = `user_${Date.now()}`;
    const now = new Date();
    
    const user: MockUser = {
      id,
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phoneNumber: data.phoneNumber,
      password: data.password, // This should be hashed in real implementation
      role: "USER",
      onboarded: false,
      emailVerified: false,
      phoneVerified: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    
    mockUsers.push(user);
    return user;
  },
  
  async findByEmail(email: string) {
    return mockUsers.find(user => user.email === email.toLowerCase());
  },
  
  async findByPhoneNumber(phoneNumber: string) {
    return mockUsers.find(user => user.phoneNumber === phoneNumber);
  },
  
  async findByEmailOrPhone(emailOrPhone: string) {
    const isEmail = emailOrPhone.includes("@");
    if (isEmail) {
      return await this.findByEmail(emailOrPhone);
    }
    return await this.findByPhoneNumber(emailOrPhone);
  },
  
  async updateLastLogin(userId: string) {
    const user = mockUsers.find(user => user.id === userId);
    if (user) {
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
    }
  },
  
  async getAllUsers() {
    return mockUsers;
  },
  
  async clearUsers() {
    mockUsers.length = 0;
  }
};