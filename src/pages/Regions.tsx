import { IonButtons, IonHeader, IonItem, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Page.css';
import {
  IonContent,
} from '@ionic/react';
import React from 'react';
import { RegionsList } from '../components/region/RegionsList';;
import Region from '../interface/region';

const Page: React.FC = () => {
  const [_, set_selected_regions] = React.useState(Array<Region>);
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonItem lines="none">
            <IonTitle>Регионы</IonTitle>
          </IonItem>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <RegionsList on_selected_change={set_selected_regions}></RegionsList>
      </IonContent>
    </IonPage>
  );
};

export default Page;
