import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonText, IonTitle, IonToolbar, useIonAlert, useIonModal } from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';
import React from 'react';
import { AxiosError } from 'axios';
import { process_error_hint } from '../../utils/process_erros_hints';
import API from '../../utils/server';
import Employee from '../../interface/employee';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { employeesR } from '../../redux/store';
import presentNoAuthAlert from '../../utils/present_no_auth_alert';

export function DeleteEmployeesModal(
  {onDismiss}: {
    onDismiss: (data?: object | null, role?: string) => void
  }
) {
  const employees = useAppSelector(state => state.employees);
  const selectedEmployees = employees.status === "ok" ? employees.selected : [];

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => {onDismiss(null, "cancel")}}>
              Отмена
            </IonButton>
          </IonButtons>
          <IonTitle>Удаление Сотрудников</IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={() => {onDismiss(selectedEmployees, "confirm")}}>
              Удалить
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" >
        <IonText color="danger">{`Точно удалить сотрудников? (${selectedEmployees.length})`}</IonText>
        <IonList>
          {selectedEmployees.map((employee) => {
            return <IonItem key={employee.id}>{`- ${employee.person!.surname} ${employee.person!.name} ${employee.person!.last_name}`}</IonItem>
          })}
        </IonList>
      </IonContent>
    </>
  )
}

export const DeleteEmployeesModalController: React.FC = () => {
  const auth = useAppSelector(state => state.auth);

  const dispatch = useAppDispatch();
  
  const [present, dismiss] = useIonModal(DeleteEmployeesModal, {
    onDismiss: (data: Array<Employee> | null, role: string) => dismiss(data, role),
  });
  const [presentAlert] = useIonAlert();

  function openModal() {
    present({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          if (auth === null) {
            return presentNoAuthAlert(presentAlert);
          }

          Promise.allSettled(ev.detail.data.map(async (employee: Employee) => {
            await API
              .delete_with_auth(auth, `employee?id=eq.${employee.id}`)
          }))
          .then((results) => {
            for (const result of results) {
              if (result.status === "rejected" && result.reason instanceof AxiosError) {
                dispatch(employeesR.fetch(auth));
                presentAlert({
                  header: "Ошибка",
                  subHeader: result.reason.response?.statusText,
                  message: process_error_hint(result.reason.response!),
                  buttons: ["Ок"]
                });
                return;
              }
            }
            dispatch(employeesR.fetch(auth));
            presentAlert({
              header: "Сотрудники удалены",
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