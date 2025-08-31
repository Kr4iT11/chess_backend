export interface JwtPayload {
  sub: number;            // user ID
  username: string;       // username/email
  refreshToken?: string;  // only added in refresh flow
}