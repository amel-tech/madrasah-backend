export interface IExample {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateExample {
  name: string;
}

export interface IExampleRepository {
  findAll(): Promise<IExample[]>;
  findById(id: number): Promise<IExample | null>;
  create(user: ICreateExample): Promise<IExample>;
  delete(id: number): Promise<boolean>;
}
