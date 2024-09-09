import { DatabaseService } from '../../database/database.service';

export class BaseService<CreateDto, UpdateDto> {
  constructor(
    protected databaseService: DatabaseService,
    protected readonly modelName: string,
  ) {}

  findMany() {
    return this.databaseService[this.modelName].findMany();
  }

  create(data: CreateDto) {
    return this.databaseService[this.modelName].create({ data });
  }

  findById(id: number) {
    return this.databaseService[this.modelName].findUnique({ where: { id } });
  }

  findOrFailById(id: number) {
    return this.databaseService[this.modelName].findUniqueOrThrow({
      where: { id },
    });
  }
  updateOrFailById(id: number, data: UpdateDto) {
    return this.databaseService[this.modelName].update({
      where: { id },
      data,
    });
  }
  deleteOrFailById(id: number) {
    return this.databaseService[this.modelName].delete({ where: { id } });
  }

  findWithPagination(page: number = 1, pageSize: number = 10) {
    return this.databaseService[this.modelName].findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
}
