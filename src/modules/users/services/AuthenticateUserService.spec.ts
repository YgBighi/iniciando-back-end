import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '../repositories/fake/FakeUsersRepository';
import AuthenticateUserService from './AuthenticateUserService';
import CreateUserService from './CreateUserService';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let createUser: CreateUserService;
let authenticateUser: AuthenticateUserService;

describe('AuthenticateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    createUser = new CreateUserService(fakeUsersRepository, fakeHashProvider);
    authenticateUser = new AuthenticateUserService(fakeUsersRepository, fakeHashProvider);
  });

  it('should be able to authenticate', async () => {
    const user = await createUser.execute({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    });

    const response = await authenticateUser.execute({
      email: 'joaomarimo@example.com',
      password: '123456',
    });

    expect(response).toHaveProperty('token');
    expect(response.user).toEqual(user);
  });

  it('should not be able to authenticate with non existing user', async () => {
    await expect(authenticateUser.execute({
      email: 'joaomarimo@example.com',
      password: '123456',
    })).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate with non existing user', async () => {
    await createUser.execute({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    });

    await expect(authenticateUser.execute({
      email: 'joaomarimo@example.com',
      password: 'wrong-password',
    })).rejects.toBeInstanceOf(AppError);
  });
});