import { JwtPayload } from '../auth/types/jwt-payload.type.ts';

declare global {
  namespace Express {
    // 👇 augment Express.User to include your JWT payload
    interface User extends JwtPayload {}

    interface Request {
      user?: User;
    }
  }
}