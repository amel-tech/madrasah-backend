import { Test, TestingModule } from '@nestjs/testing';
import { ExampleRepository } from '../../../src/example/example.repository';
import { DatabaseService } from '../../../src/database/database.service';
import {
  IExample,
  ICreateExample,
} from '../../../src/example/example.interface';

describe('ExampleRepository', () => {
  let repository: ExampleRepository;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ExampleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ExampleRepository>(ExampleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all examples', async () => {
      // Arrange
      const mockExamples: IExample[] = [
        {
          id: 1,
          name: 'Example 1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          name: 'Example 2',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockExamples);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockExamples);
    });

    it('should return empty array when no examples exist', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.findAll()).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    it('should return an example when found', async () => {
      // Arrange
      const mockExample: IExample = {
        id: 1,
        name: 'Example 1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      const exampleId = 1;

      mockRepository.findById.mockResolvedValue(mockExample);

      // Act
      const result = await repository.findById(exampleId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(exampleId);
      expect(result).toEqual(mockExample);
    });

    it('should return null when example is not found', async () => {
      // Arrange
      const exampleId = 999;
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await repository.findById(exampleId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(exampleId);
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const exampleId = 1;
      const error = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.findById(exampleId)).rejects.toThrow(error);
    });
  });

  describe('create', () => {
    it('should create and return a new example', async () => {
      // Arrange
      const createExample: ICreateExample = {
        name: 'New Example',
      };

      const mockCreatedExample: IExample = {
        id: 1,
        name: 'New Example',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockRepository.create.mockResolvedValue(mockCreatedExample);

      // Act
      const result = await repository.create(createExample);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createExample);
      expect(result).toEqual(mockCreatedExample);
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const createExample: ICreateExample = {
        name: 'New Example',
      };
      const error = new Error('Database constraint violation');
      mockRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.create(createExample)).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delete example and return true when successful', async () => {
      // Arrange
      const exampleId = 1;
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await repository.delete(exampleId);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(exampleId);
      expect(result).toBe(true);
    });

    it('should return false when example does not exist', async () => {
      // Arrange
      const exampleId = 999;
      mockRepository.delete.mockResolvedValue(false);

      // Act
      const result = await repository.delete(exampleId);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(exampleId);
      expect(result).toBe(false);
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      const exampleId = 1;
      const error = new Error('Database connection failed');
      mockRepository.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.delete(exampleId)).rejects.toThrow(error);
    });
  });
});
