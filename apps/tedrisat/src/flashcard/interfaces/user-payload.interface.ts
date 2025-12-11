export interface UserPayload {
  sub: string;
  realm_access: Record<string, unknown>;
  resource_access: Record<string, unknown>;
  scope: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
}
