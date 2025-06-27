export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface OTPCredentials {
  email: string;
  otp: string;
}

export interface WebAuthnCredentials {
  email: string;
  options: { type: 'register' | 'authenticate' };
  credential: any;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface OTPResponse {
  message: string;
}

export interface WebAuthnChallenge {
  challenge: string;
  allowCredentials?: any[];
  excludeCredentials?: any[];
}
