import Tour from "./tour";
import TourOrder from "./tour_order";
import TourOrderPurchase from "./tour_order_purchase";

export class TourOrderTurnoverEntry {
  tour_id: number;
  ordered: TourOrder[];
  selled: TourOrderPurchase[];
  tour?: Tour;

  constructor(args: {[Property in keyof TourOrderTurnoverEntry]: TourOrderTurnoverEntry[Property]}) {
    this.tour_id = args.tour_id;
    this.ordered = args.ordered;
    this.selled = args.selled;
    this.tour = args.tour;
  }
}


export class TourOrderTurnover {
  total_money_received: number;
  entries: TourOrderTurnoverEntry[];

  constructor(args: {[Property in keyof TourOrderTurnover]: TourOrderTurnover[Property]}) {
    this.total_money_received = args.total_money_received;
    this.entries = args.entries;
  }
}

export default TourOrderTurnover;
