import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../db';
import routes from '../routes/index';
import { logger } from '../middleware/logger.middleware';
import Resource from '../models/resource.model';

const app = express();
app.use(express.json());
app.use(logger);
app.use('/api', routes);

describe('Resource API', () => {
  describe('POST /api/resources/create', () => {
    it('should create a resource with valid input', async () => {
      const response = await request(app).post('/api/resources/create').send({
        owner: 'Brian',
        type: 'Book',
        details: 'The Great Gatsby',
        amount: 10,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.owner).toBe('Brian');
      expect(response.body.type).toBe('Book');
      expect(response.body.details).toBe('The Great Gatsby');
      expect(response.body.amount).toBe(10);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/resources/create')
        .send({ owner: 'Brian', type: 'Book', amount: 3000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          property: 'details',
          constraints: expect.objectContaining({
            isString: 'details must be a string',
          }),
        })
      );
    });
  });

  describe('GET /api/resources/list', () => {
    beforeEach(async () => {
      await Resource.create([
        {
          owner: 'Brian',
          type: 'Book',
          details: 'The Great Gatsby',
          amount: 10,
        },
        { owner: 'John', type: 'Candle', details: 'A candle', amount: 5 },
        {
          owner: 'Jane',
          type: 'Book',
          details: 'Pride and Prejudice',
          amount: 3,
        },
      ]);
    });

    it('should list all resources', async () => {
      const response = await request(app).get('/api/resources/list');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            owner: 'Brian',
            type: 'Book',
            details: 'The Great Gatsby',
            amount: 10,
          }),
          expect.objectContaining({
            owner: 'John',
            type: 'Candle',
            details: 'A candle',
            amount: 5,
          }),
          expect.objectContaining({
            owner: 'Jane',
            type: 'Book',
            details: 'Pride and Prejudice',
            amount: 3,
          }),
        ])
      );
    });

    it('should filter resources by owner', async () => {
      const response = await request(app).get('/api/resources/list?owner=John');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ owner: 'John' })])
      );
    });

    it('should filter resource by type', async () => {
      const response = await request(app).get('/api/resources/list?type=Book');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].type).toBe('Book');
    });

    it('should return 400 for invalid type query', async () => {
      const response = await request(app).get('/api/resources/list?type=??%%');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          property: 'type',
          constraints: expect.objectContaining({
            matches: 'type must match /^[a-zA-Z0-9\\s]+$/ regular expression',
          }),
        })
      );
    });
  });

  describe('GET /api/resources/get-resource', () => {
    let resourceId: string;

    beforeEach(async () => {
      const resource = await Resource.create({
        owner: 'Brian',
        type: 'Book',
        details: 'The Great Gatsby',
        amount: 10,
      });
      resourceId = resource._id.toString();
    });

    it('should get a resource by ID', async () => {
      const response = await request(app).get(
        `/api/resources/get-resource?resourceId=${resourceId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        owner: 'Brian',
        type: 'Book',
        details: 'The Great Gatsby',
        amount: 10,
      });
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app).get(
        `/api/resources/get-resource?resourceId=${new mongoose.Types.ObjectId()}`
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Resource not found');
    });
  });

  describe('PUT /api/resources/update', () => {
    let resourceId: string;

    beforeEach(async () => {
      const resource = await Resource.create({
        owner: 'Brian',
        type: 'Book',
        details: 'The Great Gatsby',
        amount: 10,
      });
      resourceId = resource._id.toString();
    });

    it('should update a resource with valid input', async () => {
      const response = await request(app)
        .put(`/api/resources/update`)
        .send({ resourceId: resourceId, owner: 'John', type: 'Candle' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        owner: 'John',
        type: 'Candle',
        details: 'The Great Gatsby',
        amount: 10,
      });
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .put(`/api/resources/update`)
        .send({ resourceId: resourceId, owner: 'John', type: '??%%%' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          property: 'type',
          constraints: expect.objectContaining({
            matches: 'type must match /^[a-zA-Z0-9\\s]+$/ regular expression',
          }),
        })
      );
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .put(`/api/resources/update`)
        .send({ resourceId: new mongoose.Types.ObjectId(), owner: 'John' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Resource not found');
    });
  });

  describe('DELETE /api/resources/delete', () => {
    let resourceId: string;

    beforeEach(async () => {
      const resource = await Resource.create({
        owner: 'Brian',
        type: 'Book',
        details: 'The Great Gatsby',
        amount: 10,
      });
      resourceId = resource._id.toString();
    });

    it('should delete a resource', async () => {
      const response = await request(app)
        .delete(`/api/resources/delete`)
        .send({ resourceId: resourceId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Resource deleted successfully');

      const resource = await Resource.findById(resourceId);
      expect(resource).toBeNull();
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .delete(`/api/resources/delete`)
        .send({ resourceId: new mongoose.Types.ObjectId() });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Resource not found');
    });
  });
});
