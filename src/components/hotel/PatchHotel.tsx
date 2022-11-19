import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar, useIonAlert, useIonModal } from '@ionic/react';
import axios from 'axios';
import React, { useRef, useState } from 'react'
import { OverlayEventDetail } from '@ionic/core/components';
import { RefetchFunction } from 'axios-hooks'
import { HotelJoinedFetch } from '../../interface/hotel';
import { Worker, WorkerJoinedFetch } from '../../interface/worker';
import { City, CityJoinedFetch } from '../../interface/city';
import { SelectWithSearchModal } from '../SelectWithSearch';
import { formatCity, formatWorker } from '../../utils/fmt';

export function PatchHotelModal(
  {selected_hotels, onDismiss}: {
    selected_hotels: Array<HotelJoinedFetch>,
    onDismiss: (data?: object | null, role?: string) => void
  }
) {
  const hotel = selected_hotels[0];

  const [workers, setWorkers] = React.useState(null as Array<WorkerJoinedFetch> | null);
  const [cities, setCities] = React.useState(null as Array<CityJoinedFetch> | null);

  const inputName = useRef<HTMLIonInputElement>(null);
  const inputDescription = useRef<HTMLIonInputElement>(null);
  const [cityInput, setCityInput] = useState(null as CityJoinedFetch | null);
  const [ownerInput, setOwnerInput] = useState(null as WorkerJoinedFetch | null);

  const [errorMessage, setErrorMessage] = useState(null as string | null);

  const [presentCityChoice, dismissCityChoice] = useIonModal(SelectWithSearchModal, {
    elements: cities,
    title: "Выберите город",
    formatter: (e: CityJoinedFetch) => formatCity(e),
    sorter: (e: CityJoinedFetch, query: string) => {
      return query.split(' ').reduce((value, element) => {
        element = element.toLowerCase();
        return value + 
          +e.name.toLowerCase().includes(element) + 10 * +(e.name.toLowerCase() == element) + 
          +e.region_name.toLowerCase().includes(element) + 10 * +(e.region_name.toLowerCase() == element) +
          +e.country_name.toLowerCase().includes(element) + 10 * +(e.country_name.toLowerCase() == element);
      }, 0);
    },
    keyer: (e: CityJoinedFetch) => e.id,
    onDismiss: (data: object | null, role: string) => dismissCityChoice(data, role),
  });

  const [presentOwnerChoice, dismissOwnerChoice] = useIonModal(SelectWithSearchModal, {
    elements: workers,
    title: "Выберите контактное лицо",
    formatter: (e: WorkerJoinedFetch) => formatWorker(e),
    sorter: (e: WorkerJoinedFetch, query: string) => {
      return query.split(' ').reduce((value, element) => {
        element = element.toLowerCase();
        return value + 
          +e.name.toLowerCase().includes(element) +
          +e.surname.toLowerCase().includes(element) +
          +e.last_name.toLowerCase().includes(element) +
          +e.phone_number.includes(element);
      }, 0);
    },
    keyer: (e: WorkerJoinedFetch) => e.id,
    onDismiss: (data: object | null, role: string) => dismissOwnerChoice(data, role),
  });

  function openCitySelectModal() {
    presentCityChoice({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          setCityInput(ev.detail.data.value);
        }
      },
    });
  }

  function openOwnerSelectModal() {
    presentOwnerChoice({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          setOwnerInput(ev.detail.data.value);
        }
      },
    });
  }

  React.useEffect(() => {
    axios
      .get("https://api.necrom.ru/worker")
      .then((response) => setWorkers(response.data));
  }, []);

  React.useEffect(() => {
    axios
      .get("https://api.necrom.ru/city?join=true")
      .then((response) => setCities(response.data));
  }, []);

  function confirm() {
    const name = inputName.current?.value;
    const description = inputDescription.current?.value

    if (name && description && cityInput && ownerInput) {
      onDismiss({
        id: hotel.id,
        name,
        description,
        city_id: cityInput.id,
        owner_id: ownerInput.id
      }, 'confirm');
    } else {
      setErrorMessage("Не все поля заполнены!")
    }
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
          <IonTitle>Изменить Данные об отеле</IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={confirm}>
              Изменить
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          {errorMessage ? <IonText color={'danger'}> {errorMessage}</IonText> : ""}
          <IonLabel position="stacked">Название</IonLabel>
          <IonInput ref={inputName} type="text" placeholder="Введите имя" value={hotel.name} required/>
          <IonLabel position="stacked">Местоположение</IonLabel>
          <IonButton disabled={cities === null} onClick={() => openCitySelectModal()}>
            {cities === null ? "Загрузка..." : (cityInput === null ? "Выбрать" : formatCity(cityInput))}
          </IonButton>
          <IonLabel position="stacked" >Владелец</IonLabel>
          <IonButton disabled={workers === null} onClick={() => openOwnerSelectModal()}>
            {workers === null ? "Загрузка..." : (ownerInput === null ? "Выбрать" : formatWorker(ownerInput))}
          </IonButton>
          <IonLabel position="stacked">Описание</IonLabel>
          <IonInput ref={inputDescription} type="text" placeholder="Введите описание" value={hotel.description} required/>
        </IonItem>
      </IonContent>
    </>
  )
}

export interface PatchHotelModalControllerProps {
  refetch_hotels: RefetchFunction<any, any>,
  selected_hotels: Array<HotelJoinedFetch>,
}

export const PatchHotelModalController: React.FC<PatchHotelModalControllerProps> = (props) => {
  const [present, dismiss] = useIonModal(PatchHotelModal, {
    selected_hotels: props.selected_hotels,
    onDismiss: (data: object | null, role: string) => dismiss(data, role),
  });
  const [presentAlert] = useIonAlert();

  function openModal() {
    present({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          axios
            .patch(`https://api.necrom.ru/hotel/${ev.detail.data.id}`, {
              name: ev.detail.data.name,
              surname: ev.detail.data.surname,
              last_name: ev.detail.data.last_name,
              email: ev.detail.data.email,
              phone_number: ev.detail.data.phone_number,
              role_id: ev.detail.data.role.id,
              db_user_email: "primitive_email@not.even.valid",
              db_user_password: "primitive_password",
            })
            .then((_) => {
              props.refetch_hotels();
              presentAlert({
                header: "Данные отеля изменены",
                buttons: ["Ок"]
              });
            })
            .catch((error) => {
              props.refetch_hotels();
              presentAlert({
                header: "Ошибка",
                subHeader: error.response.statusText,
                message: error.response.data,
                buttons: ["Ок"]
              });
            });
        }
      },
    });
  }

  return (
    <IonButton routerDirection="none" color="secondary" onClick={openModal}>
      <IonLabel>Изменить отель</IonLabel>
    </IonButton>
  )
}