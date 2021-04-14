import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import authConfig from '@config/Auth';
import AppError from '@shared/errors/AppError';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default function ensureAuthenticaterd(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  //VALIDACAO DO TOKEN JWT

  const autHeader = request.headers.authorization;

  if (!autHeader) {
    throw new AppError('JWT token is missing', 401)
  }

  //O formato do Token -> Bearer token

  const [, token] = autHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret)

    const { sub } = decoded as ITokenPayload;

    request.user = {
      id: sub,
    }

    return next();
  } catch (err) {
    throw new AppError('Invalid JWT token', 401)
  }
}