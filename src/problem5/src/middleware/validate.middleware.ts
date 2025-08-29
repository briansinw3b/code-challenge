import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export const validateRequest = (
  dtoClass: any,
  source: 'body' | 'query' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req[source]);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const formattedErrors = errors.map((error: ValidationError) => ({
          property: error.property,
          constraints: error.constraints,
        }));
        return res
          .status(400)
          .json({ message: 'Validation failed', errors: formattedErrors });
      }

      // Attach validated DTO to request for use in controller
      if (Object.keys(dto).length > 0 && source === 'body') req[source] = dto;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Validation error', error });
    }
  };
};
