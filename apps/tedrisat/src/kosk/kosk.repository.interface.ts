export interface IKosk {
  id: string;
  ownerId: string;
  name: string;
  handle: string | null;
  description: string | null;
  coverHue: number;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IKoskWithStats extends IKosk {
  courseCount: number;
}

export interface ICreateKosk {
  ownerId: string;
  name: string;
  handle?: string;
  description?: string;
  coverHue?: number;
  isPrivate?: boolean;
}

export interface IUpdateKosk {
  name?: string;
  handle?: string;
  description?: string;
  coverHue?: number;
  isPrivate?: boolean;
}

export interface IKoskRepository {
  findAll(): Promise<IKoskWithStats[]>;
  findById(id: string): Promise<IKoskWithStats | null>;
  create(kosk: ICreateKosk): Promise<IKosk>;
  update(id: string, updates: IUpdateKosk): Promise<IKosk | null>;
  delete(id: string): Promise<boolean>;
}
