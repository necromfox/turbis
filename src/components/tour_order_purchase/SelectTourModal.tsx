// import { IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonText, IonTitle, IonToolbar, useIonModal } from "@ionic/react";
// import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
// import { useEffect, useState } from "react";
// import { SelectWithSearchModal } from "../SelectWithSearch";
// import Tour from "../../interface/tour";
// import { useAppSelector } from "../../redux/store";

// function isNaturalNumber(n: any): boolean {
//   let ns = n.toString();
//   var n1 = Math.abs(n),
//       n2 = parseInt(ns, 10);
//   return !ns.includes(',') && !ns.includes('-') && !isNaN(n1) && n2 === n1 && n1.toString() === n.toString();
// }

// export function SelectTourModal(
//   {
//     onDismiss
//   }: {
//     onDismiss: (data?: object | null, role?: string) => void
//   }
// ) {
//   const tours = useAppSelector(state => state.tours);
//   const [errorMessage, setErrorMessage] = useState(null as string | null);
//   const [inputPeopleCount, setInputPeopleCount] = useState(0 as number);
//   const [inputTourPrice, setInputTourPrice] = useState(null as number | null);
//   const [inputTour, setInputTour] = useState(null as Tour | null);
//   const [inputReservationsConfirmed, setInputReservationsConfirmed] = useState(false);
//   const [totalCost, setTotalCost] = useState(null as number | null);

//   function confirm() {
//     if (inputPeopleCount <= 0) {
//       return setErrorMessage("Кол-во людей должно быть натуральным числом");
//     }

//     if (inputTourPrice !== null && totalCost !== null && inputTour !== null) {
//       onDismiss({
//         value: {
//           tour: inputTour,
//           price: inputTourPrice,
//           peopleCount: inputPeopleCount,
//           reservationsConfirmed: inputReservationsConfirmed
//         }
//       }, 'confirm');
//     } else {
//       setErrorMessage("Элемент не выбран");
//     }
//   }

//   const [presentTourChoice, dismissTourChoice] = useIonModal(SelectWithSearchModal, {
//     acquirer: () => {
//       const tour = useAppSelector(state => state.tours)
//       return tour.status === "ok" ? tour.data : null
//     },
//     title: "Выберите тур",
//     formatter: Tour.format,
//     sorter: (e: Tour, query: string) => {
//       return query.split(' ').reduce((value, element) => {
//         element = element.toLowerCase();
//         return value +
//           +e.hotel!.name!.toLowerCase().includes(element) + 
//           +e.hotel!.city!.name!.toLowerCase().includes(element) +
//           +e.cost!.toString().toLowerCase().includes(element);
//       }, 0);
//     },
//     keyer: (e: Tour) => e.id,
//     onDismiss: (data: object | null, role: string) => dismissTourChoice(data, role),
//   });

//   useEffect(() => {
//     if (inputTour !== null) {
//       setInputTourPrice(inputTour.cost);
//     }
//   }, [inputTour]);

//   useEffect(() => {
//     if (inputTourPrice !== null && isNaturalNumber(inputPeopleCount)) {
//       setTotalCost(Number((inputTourPrice * inputPeopleCount).toFixed(2)));
//     }
//   }, [inputTourPrice, inputPeopleCount]);

//   function openTourSelectModal() {
//     presentTourChoice({
//       onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
//         if (ev.detail.role === 'confirm') {
//           setInputTour(ev.detail.data.value);
//         }
//       },
//     });
//   }


//   function handlePeopleCountChange(text: string) {
//     if (isNaturalNumber(text)) {
//       setInputPeopleCount(Number(text))
//     } else {
//       setInputPeopleCount(Math.floor(Number(text)))
//       setErrorMessage("Кол-во человек должно быть натуральным значением!");
//     }
//   }

//   return (
//     <>
//       <IonHeader>
//         <IonToolbar>
//           <IonButtons slot="start">
//             <IonButton onClick={() => {onDismiss(null, "cancel")}}>
//               {"Отмена"}
//             </IonButton>
//           </IonButtons>
//           <IonTitle>{"Добавление тура в заказ"}</IonTitle>
//           <IonButtons slot="end">
//             <IonButton strong={true} onClick={confirm}>
//               {"Подвердить"}
//             </IonButton>
//           </IonButtons>
//         </IonToolbar>
//       </IonHeader>

//       <IonContent className="ion-padding">
//         <IonItem lines='none'>
//           {errorMessage ? <IonText color={'danger'}> {errorMessage}</IonText> : ""}
//           <IonLabel position="stacked">Тур: </IonLabel>
//             <IonButton disabled={tours === null} onClick={() => openTourSelectModal()}>
//               {tours === null ? "Загрузка..." : (inputTour === null ? "Выбрать" : Tour.format(inputTour))}
//             </IonButton>
//           <IonLabel position="stacked" >Цена (в рублях)</IonLabel><br/>
//           <IonInput type="number" value={inputTourPrice} onIonChange={((event) =>{setInputTourPrice(Number(event.detail.value))})}/>
//           <IonLabel position="stacked" >Кол-во человек</IonLabel><br/>
//           <IonInput type="number" inputmode="numeric" value={inputPeopleCount} onIonChange={(event) =>{handlePeopleCountChange(event.detail.value!)}}/>
//           <IonLabel position="stacked" >Общая стоимость</IonLabel><br/>
//           <IonInput value={totalCost === null ? "" : `= ${totalCost}₽`} disabled/>
//         </IonItem>
//         <IonItem lines='none'>
//           <IonCheckbox slot="start" onIonChange={(ev) => setInputReservationsConfirmed(ev.detail.value)}></IonCheckbox>
//           <IonLabel>Бронь номеров подтверждена в отеле</IonLabel>
//         </IonItem>
//       </IonContent>
//     </>
//   )
// }
export {}
