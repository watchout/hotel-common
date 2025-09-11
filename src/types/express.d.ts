import { HierarchicalJWTPayload } from '../auth/types';

declare global {
  namespace Express {
    interface Request {
      user?: HierarchicalJWTPayload;
    }
  }
}