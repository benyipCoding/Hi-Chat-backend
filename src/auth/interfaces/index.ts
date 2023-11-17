export interface JwtPayload {
  sub: string;
  name: string;
  iat?: number;
  exp?: number;
  tokenId?: string;
}

export type RefreshTokenPayload = {
  sub: string;
  tokenId: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};
