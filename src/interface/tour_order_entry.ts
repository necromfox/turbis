import { formatDate } from "../utils/fmt";
import Tour from "./tour";

export class TourOrderTourEntry {
  tour: Tour;
  price: number;
  people_count: number;
  id?: number;

  constructor(args: {[Property in keyof TourOrderTourEntry]: TourOrderTourEntry[Property]}) {
    this.tour = args.tour;
    this.price = args.price;
    this.people_count = args.people_count;
    this.id = args.id;
  }

  static formatHeader(entry: TourOrderTourEntry): string {
    let desc = `${entry.tour.hotel?.name} ${entry.tour.hotel?.city?.name}`;
    let descShort = desc.slice(0, 20);
    if (descShort !== desc) {
      descShort += "...";
    }
  
    return `${descShort}, (с ${formatDate(entry.tour.arrival_date)} по ${formatDate(entry.tour.departure_date)})`;
  }

  static formatDetails(entry: TourOrderTourEntry): string {
    return `${entry.people_count} чел. по ${entry.price} руб. = ${entry.people_count * entry.price} руб.`;
  }
};

export default TourOrderTourEntry;
