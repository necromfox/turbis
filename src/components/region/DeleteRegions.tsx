import { IonButton, IonButtons, IonContent, IonHeader, IonLabel, IonTitle, IonToolbar, useIonAlert, useIonModal } from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';
import React, { Dispatch } from 'react';
import { AxiosError } from 'axios';
import { process_error_hint } from '../../utils/process_erros_hints';
import { AuthProps } from '../../interface/props/auth';
import API from '../../utils/server';
import Region from '../../interface/region';
import { useAppSelector } from '../../redux/store';

export function DeleteRegionsModal(
  {selected_regions, onDismiss}: {
    selected_regions: Array<Region>
    onDismiss: (data?: object | null, role?: string) => void
  }
) {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => {onDismiss(null, "cancel")}}>
              Отмена
            </IonButton>
          </IonButtons>
          <IonTitle>Удаление Регионов</IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={() => {onDismiss(selected_regions, "confirm")}}>
              Удалить
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" >
        {/* Модалка */}
        {/* <IonText color="danger">{`Точно удалить регионы? (${selected_regions.length})`}</IonText>
        <IonList>
          {selected_regions.map((region) => {
            return <IonItem key={region.id}>{`- ${region.name} ${region.country_name}`}</IonItem>
          })}
        </IonList> */}
      </IonContent>
    </>
  )
}

export type RemoveRegionsModalControllerProps = {
  selected_regions: Array<Region>,
  set_selected_regions: Dispatch<React.SetStateAction<Array<Region>>>
}

export const DeleteRegionsModalController: React.FC<RemoveRegionsModalControllerProps> = (props) => {
  const auth = useAppSelector(state => state.auth);

  const [present, dismiss] = useIonModal(DeleteRegionsModal, {
    selected_workers: props.selected_regions,
    onDismiss: (data: Array<Region> | null, role: string) => dismiss(data, role),
  });
  const [presentAlert] = useIonAlert();

  function openModal() {
    present({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          props.set_selected_regions([]);
          Promise.allSettled(ev.detail.data.map(async (region: Region) => {
            await API
              .delete_with_auth(auth!, `region?id=eq.${region.id}`)
          }))
          .then((results) => {
            for (const result of results) {
              if (result.status == "rejected" && result.reason instanceof AxiosError) {
                presentAlert({
                  header: "Ошибка",
                  subHeader: result.reason.response?.statusText,
                  message: process_error_hint(result.reason.response!),
                  buttons: ["Ок"]
                });
                return;
              }
            }
            presentAlert({
              header: "Регионы удалены",
              buttons: ["Ок"]
            });
            window.location.reload()
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