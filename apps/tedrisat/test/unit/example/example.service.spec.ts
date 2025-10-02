import { Test, TestingModule } from '@nestjs/testing';
import { ExampleService } from '../../../src/example/example.service';
import { ExampleRepository } from '../../../src/example/example.repository';
import { CreateExampleDto } from '../../../src/example/dto/create-example.dto';
import { IExample } from '../../../src/example/example.interface';
import { ExampleNotFoundError } from '../../../src/example/errors/example-not-found.error';

describe('ExampleService', () => {
  let service: ExampleService;
  let repository: ExampleRepository;

  const mockExampleRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: ExampleRepository,
          useValue: mockExampleRepository,
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    repository = module.get<ExampleRepository>(ExampleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllExamples', () => {
    it('should return an array of examples', async () => {
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

      mockExampleRepository.findAll.mockResolvedValue(mockExamples);

      // Act
      const result = await service.getAllExamples();

      // Assert
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockExamples);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no examples exist', async () => {
      // Arrange
      mockExampleRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.getAllExamples();

      // Assert
      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockExampleRepository.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getAllExamples()).rejects.toThrow(error);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getExampleById', () => {
    it('should return an example when found', async () => {
      // Arrange
      const mockExample: IExample = {
        id: 1,
        name: 'Example 1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      const exampleId = 1;

      mockExampleRepository.findById.mockResolvedValue(mockExample);

      // Act
      const result = await service.getExampleById(exampleId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(exampleId);
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockExample);
    });

    it('should throw ExampleNotFoundError when example is not found', async () => {
      // Arrange
      const exampleId = 999;
      mockExampleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getExampleById(exampleId)).rejects.toThrow(
        ExampleNotFoundError,
      );
      await expect(service.getExampleById(exampleId)).rejects.toThrow(
        'Example with id 999 not found',
      );
      expect(repository.findById).toHaveBeenCalledWith(exampleId);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const exampleId = 1;
      const error = new Error('Database connection failed');
      mockExampleRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(service.getExampleById(exampleId)).rejects.toThrow(error);
      expect(repository.findById).toHaveBeenCalledWith(exampleId);
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('createExample', () => {
    it('should create and return a new example', async () => {
      // Arrange
      const createExampleDto: CreateExampleDto = {
        name: 'New Example',
      };

      const mockCreatedExample: IExample = {
        id: 1,
        name: 'New Example',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockExampleRepository.create.mockResolvedValue(mockCreatedExample);

      // Act
      const result = await service.createExample(createExampleDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createExampleDto);
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreatedExample);
    });

    it('should handle repository errors during creation', async () => {
      // Arrange
      const createExampleDto: CreateExampleDto = {
        name: 'New Example',
      };
      const error = new Error('Database constraint violation');
      mockExampleRepository.create.mockRejectedValue(error);

      // Act & Assert
      await expect(service.createExample(createExampleDto)).rejects.toThrow(
        error,
      );
      expect(repository.create).toHaveBeenCalledWith(createExampleDto);
      expect(repository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteExample', () => {
    it('should delete example and return true when successful', async () => {
      // Arrange
      const exampleId = 1;
      mockExampleRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.deleteExample(exampleId);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(exampleId);
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should return false when example does not exist', async () => {
      // Arrange
      const exampleId = 999;
      mockExampleRepository.delete.mockResolvedValue(false);

      // Act
      const result = await service.deleteExample(exampleId);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(exampleId);
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });

    it('should handle repository errors during deletion', async () => {
      // Arrange
      const exampleId = 1;
      const error = new Error('Database connection failed');
      mockExampleRepository.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(service.deleteExample(exampleId)).rejects.toThrow(error);
      expect(repository.delete).toHaveBeenCalledWith(exampleId);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
