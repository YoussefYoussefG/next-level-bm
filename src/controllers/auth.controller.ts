import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler, sendSuccess, sendCreated } from '../utils/helpers';

// -----------------------------------------------------------------------------
// Auth Controller
// Thin layer: receives requests, calls service, formats response.
// All error handling is delegated to the asyncHandler wrapper.
// -----------------------------------------------------------------------------

/** POST /api/v1/auth/register */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendCreated(res, result);
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result);
});

/** GET /api/v1/auth/me */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.userId);
  sendSuccess(res, user);
});

/** POST /api/v1/auth/refresh */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  sendSuccess(res, result);
});
