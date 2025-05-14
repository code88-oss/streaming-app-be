import { User } from '../entities/user.entity';

export interface UserRepositoryInterface {
  findByEmailOrUsername(identifier: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
}
