import React, { useState } from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { CollectionProvider, useCollection } from './context/CollectionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import LoginScreen from './components/auth/LoginScreen';
import AdminPanel from './components/admin/AdminPanel';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import BackupReminderModal from './components/drive/BackupReminderModal';

const MainContent = () => {
  const { modoOscuro } = useTheme();
  const { monedas, billetes, cargando } = useCollection();
  const { isAdmin } = useAuth();

  const [vista, setVista] = useState('dashboard');
  const [tipoFormulario, setTipoFormulario] = useState('monedas');
  const [itemEditando, setItemEditando] = useState(null);
  const [imagenZoom, setImagenZoom] = useState(null);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [mostrarTemas, setMostrarTemas] = useState(false);
  const [mostrarBackupReminder, setMostrarBackupReminder] = useState(false);
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

    // Check backup reminder
    const checkBackupReminder = () => {
      const freq = localStorage.getItem('backup_reminder_frequency') || '1_week';
      if (freq === 'never') return;

      const lastShown = localStorage.getItem('last_backup_reminder_shown');
      if (!lastShown) {
        // Si no hay registro previo, lo creamos con fecha de hoy para empezar el ciclo
        // Asi no "spameamos" al primer inicio, sino que recordamos en 1 semana
        localStorage.setItem('last_backup_reminder_shown', Date.now().toString());
        return;
      }

      const now = Date.now();
      const last = parseInt(lastShown, 10);
      const timeDiff = now - last;

      let freqMs = 7 * 24 * 60 * 60 * 1000;
      if (freq === '2_weeks') freqMs = 14 * 24 * 60 * 60 * 1000;
      if (freq === '1_month') freqMs = 30 * 24 * 60 * 60 * 1000;

      if (timeDiff > freqMs) {
        setMostrarBackupReminder(true);
      }
    };

    // Pequeño delay para no interferir con cargas iniciales
    const timer = setTimeout(checkBackupReminder, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (cargando) {
    return (
      <div className={`min-h-screen ${modoOscuro ? 'bg-[var(--bg-primary-dark)]' : 'bg-[var(--bg-primary-light)]'} flex items-center justify-center`}>
        <div className="text-center">
          <Coins size={48} className="mx-auto text-[var(--color-primary)] animate-pulse mb-4" />
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

      {vista === 'admin' && isAdmin && (
        <AdminPanel onBack={() => setVista('dashboard')} />
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

      {mostrarBackupReminder && (
        <BackupReminderModal
          onClose={() => setMostrarBackupReminder(false)}
        />
      )}
    </div>
  );
};

// Protected App content - only shown when authenticated
const ProtectedApp = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto text-amber-500 animate-spin mb-4" />
          <p className="text-white text-lg">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show main app if authenticated
  return (
    <CollectionProvider>
      <MainContent />
    </CollectionProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
};

export default App;