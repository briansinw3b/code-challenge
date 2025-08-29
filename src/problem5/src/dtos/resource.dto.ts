import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsMongoId,
  Matches,
} from 'class-validator';

/**
 * @openapi
 * components:
 *   schemas:
 *     ResourceIdDto:
 *       type: object
 *       required:
 *         - resourceId
 *       properties:
 *         resourceId:
 *           type: string
 *           description: The ID of the resource to update
 *           example: "5f81b3d6d2d4d0d1d3d7d9d5"
 *
 */
export class ResourceIdDto {
  @IsMongoId()
  resourceId: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateResourceDto:
 *       type: object
 *       required:
 *         - owner
 *         - type
 *         - details
 *         - amount
 *       properties:
 *         owner:
 *           type: string
 *           description: The owner of the resource
 *           example: "John Doe"
 *         type:
 *           type: string
 *           description: Type of resource
 *           example: "Book"
 *         details:
 *           type: string
 *           description: Details about the resource
 *           example: "The Great Gatsby"
 *         amount:
 *           type: integer
 *           minimum: 1
 *           description: The number of resources
 *           example: 10
 */
export class CreateResourceDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/)
  owner: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9\s]+$/)
  type: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9\s,.-]+$/)
  details: string;

  @IsInt()
  @Min(1)
  amount: number;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     UpdateResourceDto:
 *       type: object
 *       required:
 *         - ResourceId
 *       properties:
 *         ResourceId:
 *           type: string
 *           description: The ID of the resource to update
 *           example: "5f81b3d6d2d4d0d1d3d7d9d5"
 *         owner:
 *           type: string
 *           description: The owner of the resource
 *           example: "John Doe"
 *         type:
 *           type: string
 *           description: Type of resource
 *           example: "Book"
 *         details:
 *           type: string
 *           description: Details about the resource
 *           example: "The Great Gatsby"
 *         amount:
 *           type: integer
 *           minimum: 1
 *           description: The number of resources
 *
 */
export class UpdateResourceDto extends ResourceIdDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s]+$/)
  owner?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s]+$/)
  type?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s,.-]+$/)
  details?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  amount?: number;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     QueryResourcesFilterDto:
 *       type: object
 *       properties:
 *         owner:
 *           type: string
 *           description: The owner of the resource
 *           example: "John Doe"
 *         type:
 *           type: string
 *           description: Type of resource
 *           example: "Book"
 *
 */
export class QueryResourcesFilterDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s]+$/)
  owner?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9\s]+$/)
  type?: string;
}
