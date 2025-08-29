import express from 'express';
import {
  createResource,
  listResources,
  getResource,
  updateResource,
  deleteResource,
} from '../controllers/resource.controller';
import { validateRequest } from '../middleware/validate.middleware';
import {
  CreateResourceDto,
  QueryResourcesFilterDto,
  ResourceIdDto,
  UpdateResourceDto,
} from '../dtos/resource.dto';

const router = express.Router();

/**
 * @openapi
 * /api/resources/create:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceDto'
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post('/create', validateRequest(CreateResourceDto), createResource);

/**
 * @openapi
 * /api/resources/list:
 *   get:
 *     summary: List resources
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: owner
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resources found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       500:
 *         description: Server error
 */
router.get(
  '/list',
  validateRequest(QueryResourcesFilterDto, 'query'),
  listResources
);

/**
 * @openapi
 * /api/resources/get-resource:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: ResourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 *
 */
router.get(
  '/get-resource',
  validateRequest(ResourceIdDto, 'query'),
  getResource
);

/**
 * @openapi
 * /api/resources/update:
 *   put:
 *     summary: Update a resource by ID
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateResourceDto'
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 *
 */
router.put('/update', validateRequest(UpdateResourceDto), updateResource);

/**
 * @openapi
 * /api/resources/delete:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResourceIdDto'
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 *
 */
router.delete('/delete', validateRequest(ResourceIdDto), deleteResource);

export default router;
