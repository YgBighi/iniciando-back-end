import Appointment from '../infra/typeorm/entities/Appointments';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import { startOfHour, isBefore, getHours, addHours } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import parseJSON from 'date-fns/parseJSON';

interface IRequest {
  provider_id: string,
  user_id: string,
  date: Date,
}

function convertDateToUTC(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}

function convertHourInTimeZoneLocal(date: Date) {
  var currentTimeZoneOffsetInHours = (date.getTimezoneOffset()) / 60;

  return currentTimeZoneOffsetInHours;
}

@injectable()
class CreateAppointmentService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository
  ) { }

  public async execute({ date, provider_id, user_id }: IRequest): Promise<Appointment> {
    const appointmentDate = startOfHour(date);
    // const dateNow = convertDateToUTC(new Date(Date.now()));
    // const getHoursInUTC = getHours(appointmentDate) + convertHourInTimeZoneLocal(appointmentDate);

    if (isBefore(appointmentDate, Date.now())) {
      throw new AppError("You can't create an appointment on a past date.");
    }

    if (user_id === provider_id) {
      throw new AppError("You can't create an appointment with yourself.");
    }

    if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
      throw new AppError(
        'You can only create appontments between 8am and 5pm.',
      );
    }

    const findAppointmentInSameDate = await this.appointmentsRepository.findByDate(
      appointmentDate);


    if (findAppointmentInSameDate) {
      throw new AppError('This appointment is already booked');
    }

    const appointment = await this.appointmentsRepository.create({
      provider_id,
      user_id,
      date: appointmentDate,
    });

    return appointment;
  }
}

export default CreateAppointmentService;