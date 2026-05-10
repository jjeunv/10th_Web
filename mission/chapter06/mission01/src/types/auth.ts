export type RequestSignupDto = {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  password: string;
};

export type ResponseSignupDto = {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RequestLoginDto = {
  email: string;
  password: string;
};

export type ResponseLoginDto = {
  id: number;
  name: string;
  accessToken: string;
  refreshToken: string;
};
