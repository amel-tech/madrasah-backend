import { Test, TestingModule } from '@nestjs/testing';
import { ExampleController } from '../../../src/example/example.controller';
import { ExampleService } from '../../../src/example/example.service';
import { CreateExampleDto } from '../../../src/example/dto/create-example.dto';
import { ExampleResponseDto } from '../../../src/example/dto/example-response.dto';
import { MedarisResponse } from '@madrasah/common';

describe('ExampleController', () => {
  let controller: ExampleController;
  let service: ExampleService;

  const mockExampleService = {
    getAllExamples: jest.fn(),
    getExampleById: jest.fn(),
    createExample: jest.fn(),
    deleteExample: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [
        {
          provide: ExampleService,
          useValue: mockExampleService,
        },
      ],
    }).compile();

    controller = module.get<ExampleController>(ExampleController);
    service = module.get<ExampleService>(ExampleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllExamples', () => {
    it('should return an array of examples wrapped in MedarisResponse', async () => {
      // Arrange
      const mockExamples: ExampleResponseDto[] = [
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

      mockExampleService.getAllExamples.mockResolvedValue(mockExamples);

      // Act
      const result = await controller.getAllExamples();

      // Assert
      expect(service.getAllExamples).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MedarisResponse.success(mockExamples));
      expect(result.data).toHaveLength(2);
      expect(result.success).toBe(true);
    });

    it('should return empty array when no examples exist', async () => {
      // Arrange
      mockExampleService.getAllExamples.mockResolvedValue([]);

      // Act
      const result = await controller.getAllExamples();

      // Assert
      expect(service.getAllExamples).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MedarisResponse.success([]));
      expect(result.data).toHaveLength(0);
      expect(result.success).toBe(true);
    });
  });

  describe('getExampleById', () => {
    it('should return a single example wrapped in MedarisResponse', async () => {
      // Arrange
      const mockExample: ExampleResponseDto = {
        id: 1,
        name: 'Example 1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      const exampleId = 1;

      mockExampleService.getExampleById.mockResolvedValue(mockExample);

      // Act
      const result = await controller.getExampleById(exampleId);

      // Assert
      expect(service.getExampleById).toHaveBeenCalledWith(exampleId);
      expect(service.getExampleById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MedarisResponse.success(mockExample));
      expect(result.data).toEqual(mockExample);
      expect(result.success).toBe(true);
    });

    it('should throw error when example not found', async () => {
      // Arrange
      const exampleId = 999;
      const error = new Error('Example not found');

      mockExampleService.getExampleById.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getExampleById(exampleId)).rejects.toThrow(error);
      expect(service.getExampleById).toHaveBeenCalledWith(exampleId);
      expect(service.getExampleById).toHaveBeenCalledTimes(1);
    });
  });

  describe('createExample', () => {
    it('should create and return a new example wrapped in MedarisResponse', async () => {
      // Arrange
      const createExampleDto: CreateExampleDto = {
        name: 'New Example',
      };

      const mockCreatedExample: ExampleResponseDto = {
        id: 1,
        name: 'New Example',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockExampleService.createExample.mockResolvedValue(mockCreatedExample);

      // Act
      const result = await controller.createExample(createExampleDto);

      // Assert
      expect(service.createExample).toHaveBeenCalledWith(createExampleDto);
      expect(service.createExample).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MedarisResponse.success(mockCreatedExample));
      expect(result.data).toEqual(mockCreatedExample);
      expect(result.success).toBe(true);
    });

    it('should handle validation errors', async () => {
      // Arrange
      const createExampleDto: CreateExampleDto = {
        name: 'New Example',
      };
      const validationError = new Error('Validation failed');

      mockExampleService.createExample.mockRejectedValue(validationError);

      // Act & Assert
      await expect(controller.createExample(createExampleDto)).rejects.toThrow(
        validationError,
      );
      expect(service.createExample).toHaveBeenCalledWith(createExampleDto);
      expect(service.createExample).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteExample', () => {
    it('should delete example and return true wrapped in MedarisResponse', async () => {
      // Arrange
      const exampleId = 1;
      mockExampleService.deleteExample.mockResolvedValue(true);

      // Act
      const result = await controller.deleteExample(exampleId);

      // Assert
      expect(service.deleteExample).toHaveBeenCalledWith(exampleId);
      expect(service.deleteExample).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MedarisResponse.success(true));
      expect(result.data).toBe(true);
      expect(result.success).toBe(true);
    });

    it('should return false when example does not exist', async () => {
      // Arrange
      const exampleId = 999;
      mockExampleService.deleteExample.mockResolvedValue(false);

      // Act
      const result = await controller.deleteExample(exampleId);

      // Assert
      expect(service.deleteExample).toHaveBeenCalledWith(exampleId);
      expect(service.deleteExample).toHaveBeenCalledTimes(1);
      expect(result).toEqual(MedarisResponse.success(false));
      expect(result.data).toBe(false);
      expect(result.success).toBe(true);
    });
  });
});
