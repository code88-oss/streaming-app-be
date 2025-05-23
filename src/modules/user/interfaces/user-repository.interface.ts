import { User } from '../entities/user.entity';

export interface UserRepositoryInterface {
  findByEmailOrUsername(identifier: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
