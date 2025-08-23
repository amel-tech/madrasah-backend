import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateExampleDto } from '../../src/example/dto/create-example.dto';
import { DatabaseService } from '../../src/database/database.service';
import { createTestApp } from '../helpers/test-app.helper';

describe('ExampleController (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    app = await createTestApp();

    databaseService = app.get<DatabaseService>(DatabaseService);
  });

  beforeEach(async () => {
    // Clean up database before each test
    if (databaseService?.db) {
      try {
        await databaseService.db.execute('DELETE FROM examples');
      } catch (error) {
        // If table doesn't exist or other errors, continue with tests
        console.warn('Database cleanup failed:', error);
      }
    }
  });

  describe('/examples (GET)', () => {
    it('should return empty array when no examples exist', () => {
      return request(app.getHttpServer())
        .get('/examples')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data).toHaveLength(0);
        });
    });

    it('should return examples when they exist', async () => {
      // First create an example
      const createDto: CreateExampleDto = {
        name: 'Test Example',
      };

      await request(app.getHttpServer())
        .post('/examples')
        .send(createDto)
        .expect(201);

      // Then get all examples
      return request(app.getHttpServer())
        .get('/examples')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('name', 'Test Example');
          expect(res.body.data[0]).toHaveProperty('createdAt');
          expect(res.body.data[0]).toHaveProperty('updatedAt');
        });
    });
  });

  describe('/examples/:id (GET)', () => {
    it('should return 404 when example does not exist', () => {
      return request(app.getHttpServer())
        .get('/examples/999')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Example with id 999 not found');
        });
    });

    it('should return example when it exists', async () => {
      // First create an example
      const createDto: CreateExampleDto = {
        name: 'Test Example',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/examples')
        .send(createDto)
        .expect(201);

      const createdId = createResponse.body.data.id;

      // Then get the example by ID
      return request(app.getHttpServer())
        .get(`/examples/${createdId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id', createdId);
          expect(res.body.data).toHaveProperty('name', 'Test Example');
          expect(res.body.data).toHaveProperty('createdAt');
          expect(res.body.data).toHaveProperty('updatedAt');
        });
    });

    it('should return 400 for invalid ID format', () => {
      return request(app.getHttpServer())
        .get('/examples/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Validation failed');
        });
    });
  });

  describe('/examples (POST)', () => {
    it('should create a new example with valid data', () => {
      const createDto: CreateExampleDto = {
        name: 'New Test Example',
      };

      return request(app.getHttpServer())
        .post('/examples')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('name', 'New Test Example');
          expect(res.body.data).toHaveProperty('createdAt');
          expect(res.body.data).toHaveProperty('updatedAt');
        });
    });

    it('should return 400 for missing name', () => {
      return request(app.getHttpServer())
        .post('/examples')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('context');
          expect(res.body.context).toHaveProperty('errors');
          expect(Array.isArray(res.body.context.errors)).toBe(true);
          expect(res.body.context.errors[0]).toHaveProperty('property', 'name');
          expect(res.body.context.errors[0]).toHaveProperty(
            'constraints.isNotEmpty',
            'name should not be empty',
          );
        });
    });

    it('should return 400 for empty name', () => {
      return request(app.getHttpServer())
        .post('/examples')
        .send({ name: '' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('context');
          expect(res.body.context).toHaveProperty('errors');
          expect(Array.isArray(res.body.context.errors)).toBe(true);
          expect(res.body.context.errors[0]).toHaveProperty('property', 'name');
          expect(res.body.context.errors[0]).toHaveProperty(
            'constraints.isNotEmpty',
            'name should not be empty',
          );
        });
    });

    it('should return 400 for name that is too long', () => {
      const longName = 'a'.repeat(256); // Exceeds maxLength of 255

      return request(app.getHttpServer())
        .post('/examples')
        .send({ name: longName })
        .expect(400)
        .expect((res) => {
          expect(res.body.context).toHaveProperty('errors');
          expect(Array.isArray(res.body.context.errors)).toBe(true);
          expect(res.body.context.errors[0]).toHaveProperty('property', 'name');
          expect(res.body.context.errors[0]).toHaveProperty(
            'constraints.maxLength',
            'name must be shorter than or equal to 255 characters',
          );
        });
    });

    it('should return 400 for non-string name', () => {
      return request(app.getHttpServer())
        .post('/examples')
        .send({ name: 123 })
        .expect(400)
        .expect((res) => {
          expect(res.body.context).toHaveProperty('errors');
          expect(Array.isArray(res.body.context.errors)).toBe(true);
          expect(res.body.context.errors[0]).toHaveProperty('property', 'name');
          expect(res.body.context.errors[0]).toHaveProperty(
            'constraints.isString',
            'name must be a string',
          );
        });
    });
  });

  describe('/examples/:id (DELETE)', () => {
    it('should delete an existing example', async () => {
      // First create an example
      const createDto: CreateExampleDto = {
        name: 'Example to Delete',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/examples')
        .send(createDto)
        .expect(201);

      const createdId = createResponse.body.data.id;

      // Then delete the example
      await request(app.getHttpServer())
        .delete(`/examples/${createdId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data', true);
        });

      // Verify it was deleted
      return request(app.getHttpServer())
        .get(`/examples/${createdId}`)
        .expect(404);
    });

    it('should return false when deleting non-existent example', () => {
      return request(app.getHttpServer())
        .delete('/examples/999')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data', false);
        });
    });

    it('should return 400 for invalid ID format', () => {
      return request(app.getHttpServer())
        .delete('/examples/invalid-id')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Validation failed');
        });
    });
  });

  afterAll(async () => {
    // Clean up database after all tests
    if (databaseService?.db) {
      try {
        await databaseService.db.execute('DELETE FROM examples');
      } catch (error) {
        console.warn('Final database cleanup failed:', error);
      }
    }

    await app.close();
  });
});
