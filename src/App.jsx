import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import { CollectionProvider, useCollection } from './context/CollectionContext';
import { useTheme } from './hooks/useTheme';
import NavBar from './components/layout/NavBar';
import Dashboard from './components/dashboard/Dashboard';
import VistaLista from './components/collection/VistaLista';
import Formulario from './components/editor/Formulario';
import ModalZoom from './components/collection/ModalZoom';
import ModalFavoritos from './components/collection/ModalFavoritos';
import VistaWishlist from './components/collection/VistaWishlist';
import ModalTemas from './components/layout/ModalTemas';
import Slideshow from './components/collection/Slideshow';
import VistaAlbumes from './components/albums/VistaAlbumes';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const MainContent = () => {
  const { modoOscuro, toggleModoOscuro } = useTheme();
  const { monedas, billetes, cargando, guardarMonedas, guardarBilletes } = useCollection();

  const [vista, setVista] = useState('dashboard');
  const [tipoFormulario, setTipoFormulario] = useState('monedas');
  const [itemEditando, setItemEditando] = useState(null);
  const [imagenZoom, setImagenZoom] = useState(null);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [mostrarTemas, setMostrarTemas] = useState(false);
  const [modoSlideshow, setModoSlideshow] = useState(false);
  const [tipoSlideshow, setTipoSlideshow] = useState('monedas');

  const iniciarSlideshow = (tipo) => {
    setTipoSlideshow(tipo);
    setModoSlideshow(true);
  };

  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.hide().catch(console.error);
    }
  }, []);

  if (cargando) {
    return (
      <div className={`min-h-screen ${modoOscuro ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} flex items-center justify-center`}>
        <div className="text-center">
          <Coins size={48} className="mx-auto text-amber-500 animate-pulse mb-4" />
          <p className={`text-xl ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Cargando colección...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      <NavBar
        vista={vista}
        setVista={setVista}
        setMostrarTemas={setMostrarTemas}
      />


      {vista === 'dashboard' && (
        <Dashboard
          setVista={setVista}
          setMostrarFavoritos={setMostrarFavoritos}
        />
      )}

      {vista === 'monedas' && (
        <VistaLista
          tipo="monedas"
          setVista={setVista}
          setItemEditando={setItemEditando}
          setTipoFormulario={setTipoFormulario}
          setImagenZoom={setImagenZoom}
          iniciarSlideshow={iniciarSlideshow}
        />
      )}

      {vista === 'billetes' && (
        <VistaLista
          tipo="billetes"
          setVista={setVista}
          setItemEditando={setItemEditando}
          setTipoFormulario={setTipoFormulario}
          setImagenZoom={setImagenZoom}
          iniciarSlideshow={iniciarSlideshow}
        />
      )}

      {vista === 'albumes' && (
        <VistaAlbumes />
      )}

      {vista === 'wishlist' && (
        <VistaWishlist
          setVista={setVista}
        />
      )}

      {vista === 'formulario' && (
        <Formulario
          tipoFormulario={tipoFormulario}
          itemEditando={itemEditando}
          setVista={setVista}
          setItemEditando={setItemEditando}
        />
      )}

      {imagenZoom && (
        <ModalZoom
          imagen={imagenZoom}
          onClose={() => setImagenZoom(null)}
        />
      )}

      {mostrarFavoritos && (
        <ModalFavoritos
          onClose={() => setMostrarFavoritos(false)}
          setItemEditando={setItemEditando}
          setTipoFormulario={setTipoFormulario}
          setVista={setVista}
          setImagenZoom={setImagenZoom}
        />
      )}



      {mostrarTemas && (
        <ModalTemas
          onClose={() => setMostrarTemas(false)}
        />
      )}

      {modoSlideshow && (
        <Slideshow
          tipo={tipoSlideshow}
          onClose={() => setModoSlideshow(false)}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <CollectionProvider>
      <MainContent />
    </CollectionProvider>
  );
};

export default App;