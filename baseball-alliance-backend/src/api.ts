// src/types/api.ts

import { UserPublic } from "./types";

export type ApiError = { error: string } & Record<string, unknown>;

export type PageQuery = {
  page?: number; // 1-based
  pageSize?: number; // default 20
};

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type AuthLoginBody = {
  email: string;
  password: string;
};

export type AuthPayload = {
  token: string;
  user: UserPublic;
};
