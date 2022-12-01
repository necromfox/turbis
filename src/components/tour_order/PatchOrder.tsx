import { useIonAlert, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonText, IonTitle, IonToolbar, useIonModal, IonGrid, IonRow, IonCol, IonList } from '@ionic/react';
import React, { useEffect, useState } from 'react'
import { OverlayEventDetail } from '@ionic/core/components';
import { process_error_hint } from '../../utils/process_erros_hints';
import { AuthProps } from '../../interface/props/auth';
import API from '../../utils/server';
import { SelectWithSearchModal } from '../SelectWithSearch';
import Client from '../../interface/client';
import { citiesR, toursR, tourOrderPaymentTypesR, useAppDispatch, useAppSelector, tourOrdersR } from '../../redux/store';
import { clientsR, personsR } from '../../redux/store';
import presentNoAuthAlert from '../../utils/present_no_auth_alert';
import CurrencyInput from 'react-currency-input-field';
import 'react-data-table-component-extensions/dist/index.css'
import { SelectTourModal } from './SelectTourModal';
import { formatClient, formatTourOrderPaymentType, formatTourOrderTourEntryFirst, formatTourOrderTourEntrySecond } from '../../utils/fmt';
import TourOrderPaymentType from '../../interface/tour_order_payment_type';
import TourOrderTourEntry from '../../interface/tour_order_entry';
import { AxiosError } from 'axios';

export function PatchOrderModal(
  {auth, onDismiss}: AuthProps & {
    onDismiss: (data?: object | null, role?: string) => void
  }
) {
  const tourOrders = useAppSelector(state => state.tourOrders);

  const tourOrder = tourOrders.status === "ok" ? tourOrders.selected[0] : null;
  const entries = tourOrders.status === "ok" ? 
    tourOrders.data
    .filter(e => e.group_id === tourOrder?.group_id)
    .map(e => {return {
      tour: e.tour,
      price: e.price, 
      peopleCount: e.people_count
    }}) : [];

  const [tourOrderPaymentTypes, persons] = useAppSelector(state => [state.tourOrderPaymentTypes, state.persons]);
  const dispatch = useAppDispatch();

  const [inputPaymentType, setInputPaymentType] = useState(tourOrder?.payment_type as TourOrderPaymentType | null);
  const [inputClient, setInputClient] = useState(tourOrder?.client as Client | null);
  const [errorMessage, setErrorMessage] = useState(null as string | null);
  const [inputEntries, setInputEntries] = useState(entries as TourOrderTourEntry[]);
  const [presentClientChoice, dismissClientChoice] = useIonModal(SelectWithSearchModal, {
    acquirer: () => {
      const clients = useAppSelector(state => state.clients)
      return clients.status === "ok" ? clients.data : null
    },
    title: "Выберите клиента",
    formatter: formatClient,
    sorter: (e: Client, query: string) => {
      return query.split(' ').reduce((value, element) => {
        element = element.toLowerCase();
        return value + 
          +e.person!.name.toLowerCase().includes(element) + 10 * +(e.person!.name.toLowerCase() === element) + 
          +e.person!.surname.toLowerCase().includes(element) + 10 * +(e.person!.surname.toLowerCase() === element) +
          +e.person!.last_name.toLowerCase().includes(element) + 10 * +(e.person!.last_name.toLowerCase() === element);
      }, 0);
    },
    keyer: (e: Client) => e.id,
    onDismiss: (data: object | null, role: string) => dismissClientChoice(data, role),
  });

  const [presentPaymentTypeChoice, dismissPaymentTypeChoice] = useIonModal(SelectWithSearchModal, {
    acquirer: () => {
      const tourOrderPaymentTypes = useAppSelector(state => state.tourOrderPaymentTypes)
      return tourOrderPaymentTypes.status === "ok" ? tourOrderPaymentTypes.data : null
    },
    title: "Выберите тип оплаты",
    formatter: formatTourOrderPaymentType,
    sorter: (e: TourOrderPaymentType, query: string) => {
      return query.split(' ').reduce((value, element) => {
        element = element.toLowerCase();
        return value + 
          +e.name.toLowerCase().includes(element) + 10 * +(e.name.toLowerCase() === element)
      }, 0);
    },
    keyer: (e: TourOrderPaymentType) => e.id,
    onDismiss: (data: object | null, role: string) => dismissPaymentTypeChoice(data, role),
  });

  function openPaymentTypeSelectModal() {
    presentPaymentTypeChoice({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          setInputPaymentType(ev.detail.data.value);
        }
      },
    });
  }

  function openPersonSelectModal() {
    presentClientChoice({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          setInputClient(ev.detail.data.value);
        }
      },
    });
  }

  useEffect(() => {
    dispatch(clientsR.fetch(auth));
    dispatch(personsR.fetch(auth));
    dispatch(toursR.fetch(auth));
    dispatch(citiesR.fetch(auth));
    dispatch(tourOrderPaymentTypesR.fetch(auth));
  }, []);

  function confirm() {
    if (inputEntries.length === 0) {
      return setErrorMessage("Должен быть заказан хотя бы 1 тур!");
    }

    if (inputPaymentType && inputClient) {
      onDismiss({
        client: inputClient,
        paymentType: inputPaymentType,
        entries: inputEntries
      }, 'confirm');
    } else {
      setErrorMessage("Не все поля заполнены!")
    }
  }

  const [presentTourChoice, dismissTourChoice] = useIonModal(SelectTourModal, {
    onDismiss: (data: object | null, role: string) => dismissTourChoice(data, role),
  });

  function openTourOrderSelectModal() {
    presentTourChoice({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          if (inputEntries.map(e => e.tour).includes(ev.detail.data.value)) {
            return setErrorMessage("Тур уже присутствует среди заказов!");
          }
          setInputEntries(tours => [...tours, ev.detail.data.value]);
        }
      },
    });
  }

  function handleTourRemoval(entry: TourOrderTourEntry) {
    setInputEntries(e => e.filter(l => l !== entry));
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => {onDismiss(null, "cancel")}}>
              Отмена
            </IonButton>
          </IonButtons>
          <IonTitle>Изменить заказ</IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={confirm}>
              Создать
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          {errorMessage ? <IonText color={'danger'}> {errorMessage}</IonText> : ""}
          <IonLabel position="stacked">Клиент</IonLabel>
          <IonButton disabled={persons === null} onClick={() => openPersonSelectModal()}>
            {persons === null ? "Загрузка..." : (inputClient === null ? "Выбрать" : formatClient(inputClient))}
          </IonButton>
          <IonLabel position="stacked">Вид оплаты</IonLabel>
          <IonButton disabled={tourOrderPaymentTypes === null} onClick={() => openPaymentTypeSelectModal()}>
            {tourOrderPaymentTypes === null ? "Загрузка..." : (inputPaymentType === null ? "Выбрать" : formatTourOrderPaymentType(inputPaymentType))}
          </IonButton>
          <IonLabel position="stacked">Заказанные туры</IonLabel>
          {inputEntries.length === 0 ? "" :
            <>
              <br/>
              <IonList lines='none'>
                {
                  inputEntries.map((e) => {
                    return (
                      <IonItem key={e.tour.id}>
                        <IonLabel>
                          <h2>{formatTourOrderTourEntryFirst(e)}</h2>
                          <p>{formatTourOrderTourEntrySecond(e)}</p>
                        </IonLabel>
                        <IonButton slot="end" color="danger" onClick={() => handleTourRemoval(e)}>
                          <IonLabel>Удалить</IonLabel>
                        </IonButton>
                      </IonItem>
                    )
                  })
                }
              </IonList>
            </>
          }
          <IonButton routerDirection="none" onClick={() => openTourOrderSelectModal()}>
            Добавить тур для заказа
          </IonButton>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked" >Общая стоимость заказа.</IonLabel>
          <CurrencyInput suffix="₽" disabled value={inputEntries.reduce((value, el) => value + el.price * el.peopleCount, 0)}></CurrencyInput>
        </IonItem>
      </IonContent>
    </>
  )
}

export const PatchOrderModalController: React.FC = () => {
  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const [present, dismiss] = useIonModal(PatchOrderModal, {
    auth: auth!,
    onDismiss: (data: object | null, role: string) => dismiss(data, role),
  });
  const [presentAlert] = useIonAlert();

  function openModal() {
    present({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          if (auth === null) {
            return presentNoAuthAlert(presentAlert);
          }
          
          Promise.allSettled(ev.detail.data.entries.map(async (e: TourOrderTourEntry) => {
            await API
              .patch_with_auth(auth!, `tour_order?id=eq.${ev.detail.data.id}`, {
                client_id: ev.detail.data.client.id,
                payment_type_id: ev.detail.data.paymentType.id,
                tour_id: e.tour.id,
                price: e.price,
                people_count: e.peopleCount
              })
          }))
          .then((results) => {
            for (const result of results) {
              if (result.status === "rejected" && result.reason instanceof AxiosError) {
                dispatch(clientsR.fetch(auth));
                presentAlert({
                  header: "Ошибка",
                  subHeader: result.reason.response?.statusText,
                  message: process_error_hint(result.reason.response!),
                  buttons: ["Ок"]
                });
                return;
              }
            }
            dispatch(tourOrdersR.fetch(auth));
            presentAlert({
              header: "Заказы добавлены",
              buttons: ["Ок"]
            });
          })
        }
      },
    });
  }

  return (
    <IonButton routerDirection="none" color="secondary" onClick={openModal}>
      <IonLabel>Изменить заказ</IonLabel>
    </IonButton>
  )
}