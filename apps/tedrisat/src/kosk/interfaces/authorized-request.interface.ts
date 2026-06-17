export interface UserPayload {
  sub: string;
  preferred_username: string;
  email?: string;
}

export interface AuthorizedRequest extends Request {
  user: UserPayload;
}
