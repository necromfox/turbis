import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar, useIonAlert, useIonModal } from '@ionic/react';
import React, { useEffect, useState } from 'react'
import { EmployeeRole } from '../../interface/employee_role';
import { OverlayEventDetail } from '@ionic/core/components';
import { process_error_hint } from '../../utils/process_erros_hints';
import API from '../../utils/server';
import { Person } from '../../interface/person';
import { SelectWithSearchModal } from '../SelectWithSearch';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { employeesR, employeeRolesR, personsR } from '../../redux/store';
import presentNoAuthAlert from '../../utils/present_no_auth_alert';
import { AuthProps } from '../../interface/props/auth';

export function PatchEmployeeModal(
  {auth, onDismiss}: AuthProps & {
    onDismiss: (data?: object | null, role?: string) => void
  }
) {
  const [employees, employeeRoles, persons] = useAppSelector(state => [state.employees, state.employeeRoles, state.persons]);
  const dispatch = useAppDispatch();

  const employee = employees.status === "ok" ? employees.selected[0] : null;

  const [inputRole, setInputRole] = useState(employee!.role as EmployeeRole | null);
  const [inputPerson, setInputPerson] = useState(employee!.person as Person | null);
  const [errorMessage, setErrorMessage] = useState(null as string | null);

  const [presentPersonChoice, dismissPersonChoice] = useIonModal(SelectWithSearchModal, {
    acquirer: () => {
      const persons = useAppSelector(state => state.persons)
      return persons.status === "ok" ? persons.data : null
    },
    title: "Выберите контактное лицо",
    formatter: Person.format,
    sorter: (e: Person, query: string) => {
      return query.split(' ').reduce((value, element) => {
        element = element.toLowerCase();
        return value + 
          +e.name.toLowerCase().includes(element) + 10 * +(e.name.toLowerCase() === element) + 
          +e.surname.toLowerCase().includes(element) + 10 * +(e.surname.toLowerCase() === element) +
          +e.last_name.toLowerCase().includes(element) + 10 * +(e.last_name.toLowerCase() === element);
      }, 0);
    },
    keyer: (e: Person) => e.id,
    onDismiss: (data: object | null, role: string) => dismissPersonChoice(data, role),
  });

  function openPersonSelectModal() {
    presentPersonChoice({
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          setInputPerson(ev.detail.data.value);
        }
      },
    });
  }

  function confirm() {
    if (inputRole && inputPerson) {
      onDismiss({
        id: employee!.id,
        role: inputRole,
        person: inputPerson
      }, 'confirm');
    } else {
      setErrorMessage("Не все поля заполнены!")
    }
  }

  useEffect(() => {
    dispatch(employeeRolesR.fetch(auth));
    dispatch(personsR.fetch(auth));
  }, []);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => {onDismiss(null, "cancel")}}>
              Отмена
            </IonButton>
          </IonButtons>
          <IonTitle>Изменить сотрудника</IonTitle>
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
          <IonLabel position="stacked" >Контактное лицо</IonLabel>
          <IonButton disabled={persons === null} onClick={() => openPersonSelectModal()}>
            {persons === null ? "Загрузка..." : (inputPerson === null ? "Выбрать" : Person.format(inputPerson))}
          </IonButton>
          <IonLabel position="stacked" >Роль</IonLabel>
          <IonSelect placeholder="Выбрать" onIonChange={(ev) => setInputRole(ev.target.value)}>
            {
              employeeRoles.status === "ok" ? 
                employeeRoles.data.map((element) => {
                  return <IonSelectOption key={element.name} value={element}>{element.name}</IonSelectOption>
                }) :
                <IonText>Загрузка...</IonText>
            }
          </IonSelect>
        </IonItem>
      </IonContent>
    </>
  )
}

export const PatchEmployeesModalController: React.FC = () => {
  const auth = useAppSelector(state => state.auth);

  const dispatch = useAppDispatch();
  
  const [present, dismiss] = useIonModal(PatchEmployeeModal, {
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
          
          API
            .patch_with_auth(auth!, `employee?id=eq.${ev.detail.data.id}`, {
              role_id: ev.detail.data.role.id,
              person_id: ev.detail.data.person.id,
            })
            .then((_) => {
              presentAlert({
                header: "Данные сотрудника изменены",
                buttons: ["Ок"]
              });
            })
            .catch((error) => {
              presentAlert({
                header: "Ошибка",
                subHeader: error.response.statusText,
                message: process_error_hint(error.response),
                buttons: ["Ок"]
              });
            })
            .finally(() => {
              dispatch(employeesR.fetch(auth));
            });
        }
      },
    });
  }

  return (
    <IonButton routerDirection="none" color="secondary" onClick={openModal}>
      <IonLabel>Изменить сотрудника</IonLabel>
    </IonButton>
  )
}