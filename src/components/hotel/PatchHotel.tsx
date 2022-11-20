import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonText, IonTextarea, IonTitle, IonToolbar, useIonAlert, useIonModal } from '@ionic/react';
import axios from 'axios';
import React, { useRef, useState } from 'react'
import { OverlayEventDetail } from '@ionic/core/components';
import { RefetchFunction } from 'axios-hooks'
import { HotelJoinedFetch } from '../../interface/hotel';
import { WorkerJoinedFetch } from '../../interface/worker';
import { CityJoinedFetch } from '../../interface/city';
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
  const inputDescription = useRef<HTMLIonTextareaElement>(null);
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
          +e.name.toLowerCase().includes(element) + 10 * +(e.name.toLowerCase() === element) + 
          +e.region_name.toLowerCase().includes(element) + 10 * +(e.region_name.toLowerCase() === element) +
          +e.country_name.toLowerCase().includes(element) + 10 * +(e.country_name.toLowerCase() === element);
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
      .then((response) => {
        setWorkers(response.data);
        setOwnerInput(response.data.find((e: WorkerJoinedFetch) => e.id === hotel.owner_id));
      });
  }, [hotel.owner_id]);

  React.useEffect(() => {
    axios
      .get("https://api.necrom.ru/city?join=true")
      .then((response) => {
        setCities(response.data);
        setCityInput(response.data.find((e: CityJoinedFetch) => e.id === hotel.city_id));
      });
  }, [hotel.city_id]);

  function confirm() {
    const name = inputName.current?.value;
    const description = inputDescription.current?.value

    if (name && description && cityInput && ownerInput) {
      if (description.length > 500) {
        setErrorMessage("Описание отеля должно быть меньше 500 символов.")
      } else if (name.toString().length > 200) {
        setErrorMessage("Название отеля должно быть меньше 200 символов.")
      } else {
        onDismiss({
          id: hotel.id,
          name,
          description,
          city_id: cityInput.id,
          owner_id: ownerInput.id
        }, 'confirm');
      }
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
          <IonInput ref={inputName} clearInput={true} type="text" placeholder="Введите имя" value={hotel.name} required/>
          <IonLabel position="stacked">Местоположение</IonLabel>
          <IonButton disabled={cities === null} onClick={() => openCitySelectModal()}>
            {cities === null ? "Загрузка..." : (cityInput === null ? "Выбрать" : formatCity(cityInput))}
          </IonButton>
          <IonLabel position="stacked" >Владелец</IonLabel>
          <IonButton disabled={workers === null} onClick={() => openOwnerSelectModal()}>
            {workers === null ? "Загрузка..." : (ownerInput === null ? "Выбрать" : formatWorker(ownerInput))}
          </IonButton>
          <IonLabel position="stacked">Описание</IonLabel>
          <IonTextarea ref={inputDescription} auto-grow={true} value={hotel.description} placeholder="Введите описание" required/>
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
              description: ev.detail.data.description,
              city_id: ev.detail.data.city_id,
              owner_id: ev.detail.data.owner_id,
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