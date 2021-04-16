import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '../repositories/fake/FakeUsersRepository';
import UpdateProfileService from './UpdateProfileService';
import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let updateProfile: UpdateProfileService;

describe('UpdateProfile', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    updateProfile = new UpdateProfileService(
      fakeUsersRepository,
      fakeHashProvider
    );
  });
  it('should be able to update the profile', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    });

    const updatedUser = await updateProfile.execute({
      user_id: user.id,
      name: 'Zé Bomimo',
      email: 'zebomimo@example.com',
    });

    expect(updatedUser.name).toBe('Zé Bomimo');
    expect(updatedUser.email).toBe('zebomimo@example.com');
  });

  it('should not be able to change the email to another user email', async () => {
    await fakeUsersRepository.create({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    });

    const user = await fakeUsersRepository.create({
      name: 'Maria Maria',
      email: 'teste@example.com',
      password: '123456',
    });

    await expect(updateProfile.execute({
      user_id: user.id,
      name: 'Zé Bomimo',
      email: 'joaomarimo@example.com',
    })).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to update the password', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    });

    const updatedUser = await updateProfile.execute({
      user_id: user.id,
      name: 'Zé Bomimo',
      email: 'zebomimo@example.com',
      old_password: '123456',
      password: '123123',
    });

    expect(updatedUser.password).toBe('123123');
  });

  it('should be able to update the password without old password', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    });

    await expect(updateProfile.execute({
      user_id: user.id,
      name: 'Zé Bomimo',
      email: 'zebomimo@example.com',
      password: '123123',
    })).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to update the password with wrong old password', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    });

    await expect(updateProfile.execute({
      user_id: user.id,
      name: 'Zé Bomimo',
      email: 'zebomimo@example.com',
      old_password: 'wrong-old-password',
      password: '123123',
    })).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able update the profile from non-existing user', async () => {
    await expect(updateProfile.execute({
      user_id: 'non-existing',
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123123',
    })).rejects.toBeInstanceOf(AppError);
  });
});