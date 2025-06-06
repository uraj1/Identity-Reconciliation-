import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateIdentifyInput = [
  // Email is optional but if provided must be valid
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  // Phone number is optional but if provided must be a string
  body('phoneNumber')
    .optional()
    .isString()
    .withMessage('Phone number must be a string'),
  
  // At least one of email or phoneNumber must be provided by the user
  body()
    .custom((body) => {
      if (!body.email && !body.phoneNumber) {
        throw new Error('At least one of email or phoneNumber is required');
      }
      return true;
    }),
  
  // Check for validation errors
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];