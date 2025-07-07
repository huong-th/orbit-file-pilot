import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
  PublicKeyCredentialCreationOptionsJSON,
} from '@simplewebauthn/types';

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
  credential: AuthenticationResponseJSON;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface OTPResponse {
  message: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

// CẬP NHẬT: Định nghĩa WebAuthnChallenge để khớp với PublicKeyCredentialCreationOptionsJSON
// Backend của bạn phải trả về định dạng này cho challenge đăng ký
export type WebAuthnChallenge = PublicKeyCredentialCreationOptionsJSON;

// THÊM: Định nghĩa cho challenge xác thực (nếu bạn sử dụng WebAuthn cho login)
export type WebAuthnAuthenticationChallenge = PublicKeyCredentialRequestOptionsJSON;
