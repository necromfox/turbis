import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonText, IonTitle, IonToolbar, useIonAlert, useIonModal } from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';
import React from 'react';
import { AxiosError } from 'axios';
import { process_error_hint } from '../../utils/process_erros_hints';
import API from '../../utils/server';
import { tourOrderPaymentsR, useAppDispatch, useAppSelector } from '../../redux/store';
import presentNoAuthAlert from '../../utils/present_no_auth_alert';
import TourOrderPayment from '../../interface/tour_order_payment';
import Person from '../../interface/person';

export function DeleteTourOrderPaymentModal(
  {onDismiss}: {
    onDismiss: (data?: object | null, role?: string) => void
  }
) {
  const tourOrderPayments = useAppSelector(state => state.tourOrderPayments);
  const selectedTourOrderPayments = tourOrderPayments.status === "ok" ? tourOrderPayments.selected : [];
  console.log(selectedTourOrderPayments)
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => {onDismiss(null, "cancel")}}>
              Отмена
            </IonButton>
          </IonButtons>
          <IonTitle>Удаление записей об оплате заказов</IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={() => {onDismiss(selectedTourOrderPayments, "confirm")}}>
              Удалить
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" >
        <IonText color="danger">{`Точно удалить записи об оплате заказов? (${selectedTourOrderPayments.length})`}</IonText>
        <IonList>
          {selectedTourOrderPayments.map((t:any) => {
            return <IonItem key={t.id}>{`- ID: ${t?.id}, ${t.order?.tour.hotel?.name} - оплачено: ${t.id} ${Person.format(t.order.client.person)} <${t.order.client.type?.name}>`}</IonItem>
          })}
        </IonList>
      </IonContent>
    </>
  )
}

export const DeleteTourOrderPaymentModalController: React.FC = () => {
  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const [present, dismiss] = useIonModal(DeleteTourOrderPaymentModal, {
    onDismiss: (data: Array<TourOrderPayment> | null, role: string) => dismiss(data, role),
  });
  const [presentAlert] = useIonAlert();

  function openModal() {
    present({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          if (auth === null) {
            return presentNoAuthAlert(presentAlert);
          }
          console.log(ev.detail.data)
          Promise.allSettled(ev.detail.data.map(async (tour_order_payment: TourOrderPayment) => {
            await API
              .delete_with_auth(auth!, `tour_order_payment?id=eq.${tour_order_payment.id}`)
          }))
          .then((results) => {
            for (const result of results) {
              if (result.status === "rejected" && result.reason instanceof AxiosError) {
                dispatch(tourOrderPaymentsR.fetch(auth));
                presentAlert({
                  header: "Ошибка",
                  subHeader: result.reason.response?.statusText,
                  message: process_error_hint(result.reason.response!),
                  buttons: ["Ок"]
                });
                return;
              }
            }
            dispatch(tourOrderPaymentsR.fetch(auth));
            presentAlert({
              header: "записи об оплате туров удалены",
              buttons: ["Ок"]
            });
          })
        }
      },
    });
  }

  return (
    <IonButton routerDirection="none" color="danger" onClick={openModal}>
      <IonLabel>Удалить</IonLabel>
    </IonButton>
  )
}