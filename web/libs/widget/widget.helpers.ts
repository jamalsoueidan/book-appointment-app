import { IProductModel } from "@models/product.model";
import { GetCartsByStaffReturn } from "@services/cart.service";
import {
  addMinutes,
  format,
  isBefore,
  isWithinInterval,
  subMinutes,
} from "date-fns";
import {
  GetByStaffAndTagReturn,
  GetByTagReturn,
} from "../../database/services/schedule.service";
import {
  GetBookingsByProductAndStaffReturn,
  GetBookingsByProductReturn,
} from "./../../database/services/booking.service";

export interface ScheduleHourStaff {
  _id: string;
  fullname: string;
}

export interface ScheduleHour {
  start: Date;
  end: Date;
  staff: ScheduleHourStaff;
}

export interface ScheduleDate {
  date: string;
  hours: ScheduleHour[];
}

interface ScheduleReduceProduct
  extends Pick<IProductModel, "duration" | "buffertime"> {}

const scheduleReduce =
  (product: ScheduleReduceProduct) =>
  (
    previous: Array<ScheduleDate>,
    current: GetByStaffAndTagReturn | GetByTagReturn
  ): Array<ScheduleDate> => {
    const end = new Date(current.end);
    const duration = product.duration || 60;
    const buffertime = product.buffertime || 0;

    // we push start time everytime
    let start = new Date(current.start);
    const date = format(start, "yyyy-MM-dd");

    let previousHours = previous.find((p) => p.date === date);
    let hours = previousHours?.hours || [];
    while (isBefore(addMinutes(start, 1), end)) {
      hours.push({
        start: start,
        end: addMinutes(start, duration + buffertime),
        staff: current.staff,
      });

      start = addMinutes(start, duration + buffertime);
    }

    if (!previousHours) {
      previous.push({ date, hours });
    }
    return previous;
  };

const scheduleCalculateBooking = (
  book:
    | GetBookingsByProductReturn
    | GetBookingsByProductAndStaffReturn
    | GetCartsByStaffReturn
): ((schedule: ScheduleDate) => ScheduleDate) => {
  const { start, end, staff } = book;
  return (schedule: ScheduleDate): ScheduleDate => {
    return {
      ...schedule,
      hours: schedule.hours.filter((hour) => {
        if (hour.staff._id.toString() !== staff.toString()) {
          return true;
        }

        if (isWithinInterval(addMinutes(start, 1), hour)) {
          console.log("eliminate", start, end, hour.start, hour.end);
          return false;
        }

        if (isWithinInterval(subMinutes(end, 1), hour)) {
          console.log("eliminate", start, end, hour.start, hour.end);
          return false;
        }

        return true;
      }),
    };
  };
};

export default { scheduleCalculateBooking, scheduleReduce };
