export interface IKosk {
  id: string;
  ownerId: string;
  name: string;
  handle: string | null;
  description: string | null;
  coverHue: number;
  isPrivate: boolean;
  field: string | null;
  level: string | null;
  tags: string[];
  verified: boolean;
  featured: boolean;
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IKoskWithStats extends IKosk {
  courseCount: number;
  studentCount: number;
  muderrisCount: number;
  followerCount: number;
  isFollowing: boolean;
}

export interface IPaginatedKosks {
  items: IKoskWithStats[];
  total: number;
  page: number;
  limit: number;
}

export interface ICreateKosk {
  ownerId: string;
  name: string;
  handle?: string;
  description?: string;
  coverHue?: number;
  isPrivate?: boolean;
  field?: string;
  level?: string;
  tags?: string[];
  verified?: boolean;
  featured?: boolean;
  rating?: number;
  ratingCount?: number;
}

export interface IUpdateKosk {
  name?: string;
  handle?: string;
  description?: string;
  coverHue?: number;
  isPrivate?: boolean;
  field?: string;
  level?: string;
  tags?: string[];
  verified?: boolean;
  featured?: boolean;
  rating?: number;
  ratingCount?: number;
}

export interface IKoskRepository {
  findAll(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<IKoskWithStats[]>;
  count(): Promise<number>;
  findById(id: string, userId: string): Promise<IKoskWithStats | null>;
  findOwnerId(id: string): Promise<string | null>;
  create(kosk: ICreateKosk): Promise<IKosk>;
  update(id: string, updates: IUpdateKosk): Promise<IKosk | null>;
  delete(id: string): Promise<boolean>;
  follow(userId: string, koskId: string): Promise<boolean>;
  unfollow(userId: string, koskId: string): Promise<boolean>;
}
