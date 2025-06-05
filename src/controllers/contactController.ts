import { Request, Response, NextFunction } from 'express';
import { IdentityService } from '../services/identityService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const identityService = new IdentityService(prisma);

export const identify = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, phoneNumber } = req.body;
    
    // Process the identification request
    const result = await identityService.identifyContact(email, phoneNumber);
    
    // Return the formatted response
    return res.status(200).json({
      contact: result
    });
  } catch (error) {
    next(error);
  }
};