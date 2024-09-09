import { Test, TestingModule } from '@nestjs/testing';
import { BaseService } from '../common/service/base.service';
import { DatabaseService } from '../database/database.service';

type CreateDto = { name: string };
type UpdateDto = { name?: string };

describe('BaseService', () => {
  let service: BaseService<CreateDto, UpdateDto>;
  let databaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const mockModel = {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockDatabaseService = {
      user: mockModel,
    } as unknown as jest.Mocked<DatabaseService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: BaseService,
          useFactory: (dbService: DatabaseService) =>
            new BaseService(dbService, 'user'),
          inject: [DatabaseService],
        },
      ],
    }).compile();

    service = module.get<BaseService<CreateDto, UpdateDto>>(BaseService);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return the found entity', async () => {
      const mockEntity = { id: 1, name: 'Test' };
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(
        mockEntity,
      );

      const result = await service.findById(1);
      expect(result).toEqual(mockEntity);
      expect(databaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if entity is not found', async () => {
      (databaseService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findById(1);
      expect(result).toBeNull();
    });
  });

  describe('findOrFailById', () => {
    it('should return the found entity', async () => {
      const mockEntity = { id: 1, name: 'Test' };
      (databaseService.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        mockEntity,
      );

      const result = await service.findOrFailById(1);
      expect(result).toEqual(mockEntity);
      expect(databaseService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw an error if entity is not found', async () => {
      (databaseService.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.findOrFailById(1)).rejects.toThrow(Error);
    });
  });

  describe('updateOrFailById', () => {
    it('should update and return the entity', async () => {
      const mockEntity = { id: 1, name: 'Updated' };
      (databaseService.user.update as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.updateOrFailById(1, { name: 'Updated' });
      expect(result).toEqual(mockEntity);
      expect(databaseService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated' },
      });
    });

    it('should throw an error if entity is not found', async () => {
      (databaseService.user.update as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        service.updateOrFailById(1, { name: 'Updated' }),
      ).rejects.toThrow(Error);
    });
  });

  describe('deleteOrFailById', () => {
    it('should delete the entity', async () => {
      const mockEntity = { id: 1, name: 'Deleted' };
      (databaseService.user.delete as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.deleteOrFailById(1);
      expect(result).toEqual(mockEntity);
      expect(databaseService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw an error if entity is not found', async () => {
      (databaseService.user.delete as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );

      await expect(service.deleteOrFailById(1)).rejects.toThrow(Error);
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated results', async () => {
      const mockEntities = [
        { id: 1, name: 'Test1' },
        { id: 2, name: 'Test2' },
      ];
      (databaseService.user.findMany as jest.Mock).mockResolvedValue(
        mockEntities,
      );

      const result = await service.findWithPagination(2, 10);
      expect(result).toEqual(mockEntities);
      expect(databaseService.user.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
      });
    });
  });
});