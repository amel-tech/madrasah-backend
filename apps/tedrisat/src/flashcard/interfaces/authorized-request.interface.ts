import { UserPayload } from './user-payload.interface';

export interface AuthorizedRequest extends Request {
  user: UserPayload;
}
