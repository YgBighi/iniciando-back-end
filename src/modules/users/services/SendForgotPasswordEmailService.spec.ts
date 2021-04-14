import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '../repositories/fake/FakeUsersRepository';
import FakeUserTokensRepository from '../repositories/fake/FakeUserTokensRepository';
import FakeMailProvider from '@shared/container/providers/MailProvider/fakes/FakeMailProvider';
import SendForgotPasswordEmailService from './SendForgotPasswordEmailService';

let fakeUsersRepository: FakeUsersRepository;
let fakeMailProvider: FakeMailProvider;
let fakeUserTokensRepository: FakeUserTokensRepository;
let sendForgotPasswordEmail: SendForgotPasswordEmailService;

describe('SendForgotPasswordEmail', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeMailProvider = new FakeMailProvider();
    fakeUserTokensRepository = new FakeUserTokensRepository();

    sendForgotPasswordEmail = new SendForgotPasswordEmailService(
      fakeUsersRepository,
      fakeMailProvider,
      fakeUserTokensRepository,
    );
  });

  it('should be able to recover the password using the email', async () => {


    const sendMail = jest.spyOn(fakeMailProvider, 'sendMail');

    await fakeUsersRepository.create({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    })

    await sendForgotPasswordEmail.execute({
      email: 'joaomarimo@example.com',
    });

    expect(sendMail).toHaveBeenCalled();
  });

  it('should not able to recover a non-existing user password', async () => {
    await expect(
      sendForgotPasswordEmail.execute({
        email: 'joaomarimo@example.com',
      })).rejects.toBeInstanceOf(AppError);
  });

  it('should generate a forgot password token', async () => {
    const generateToken = jest.spyOn(fakeUserTokensRepository, 'generate');

    const user = await fakeUsersRepository.create({
      name: 'Joao Marimo',
      email: 'joaomarimo@example.com',
      password: '123456',
    })

    await sendForgotPasswordEmail.execute({
      email: 'joaomarimo@example.com',
    });

    expect(generateToken).toHaveBeenCalledWith(user.id);
  });
});
