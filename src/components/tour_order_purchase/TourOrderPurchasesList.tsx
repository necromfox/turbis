import React from "react";
import 'react-data-table-component-extensions/dist/index.css';
import { tourOrderPaymentsR, useAppDispatch } from "../../redux/store";
import { Table } from "../table_management/Table";
import TourOrderPayment from "../../interface/tour_order_payment";

const listColumns = [
  {
    name: "ID",
    selector: "id",
    sortable: true,
    wrap: true
  },
  {
    name: "Название отеля",
    selector: "order.hotel.name",
    sortable: true,
    wrap: true,
  },
  {
    name: "Бронь номеров подтверждена",
    selector: "reservations_confirmed",
    sortable: true,
    wrap: true,
  }
];

export const TourOrderPurchasesList: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <Table 
      title="Список записей об продажах заказов туров:"
      selector={state => state.tourOrderPayments}
      columns={listColumns as any}
      selectRowsCallback={selected => dispatch(tourOrderPaymentsR.select(selected.selectedRows as TourOrderPayment[]))}
    />
  );
}