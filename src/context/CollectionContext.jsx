import React, { createContext, useState, useEffect, useContext } from 'react';
import localforage from 'localforage';
import { initDB, getItems, addItem, updateItem, deleteItem, toggleFavoritoDB, getAlbums, createAlbum, deleteAlbum, getAlbumItems } from '../services/platformDB';
import { syncUserStats } from '../services/firebase';
import { useAuth } from './AuthContext';

const CollectionContext = createContext();

export const useCollection = () => {
    const context = useContext(CollectionContext);
    if (!context) {
        throw new Error('useCollection debe usarse dentro de un CollectionProvider');
    }
    return context;
};

export const CollectionProvider = ({ children }) => {
    const { user } = useAuth();
    const [monedas, setMonedas] = useState([]);
    const [billetes, setBilletes] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [cargando, setCargando] = useState(true);

    const refreshData = async () => {
        try {
            const [monedasData, billetesData, wishlistData, albumsData] = await Promise.all([
                getItems('monedas'),
                getItems('billetes'),
                getItems('wishlist'),
                getAlbums()
            ]);
            setMonedas(monedasData);
            setBilletes(billetesData);
            setWishlist(wishlistData);
            setAlbums(albumsData);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                await initDB();

                // Check if migration is needed
                const existingMonedas = await getItems('monedas');
                const existingBilletes = await getItems('billetes');

                if (existingMonedas.length === 0 && existingBilletes.length === 0) {
                    console.log('Checking for localForage data to migrate...');
                    const savedMonedas = await localforage.getItem('coleccion-monedas');
                    const savedBilletes = await localforage.getItem('coleccion-billetes');
                    const savedWishlist = await localforage.getItem('coleccion-wishlist');

                    if (savedMonedas && Array.isArray(savedMonedas)) {
                        console.log(`Migrating ${savedMonedas.length} coins...`);
                        for (const m of savedMonedas) await addItem(m, 'monedas');
                    }
                    if (savedBilletes && Array.isArray(savedBilletes)) {
                        console.log(`Migrating ${savedBilletes.length} bills...`);
                        for (const b of savedBilletes) await addItem(b, 'billetes');
                    }
                    if (savedWishlist && Array.isArray(savedWishlist)) {
                        console.log(`Migrating ${savedWishlist.length} wishlist items...`);
                        for (const w of savedWishlist) await addItem(w, 'wishlist');
                    }
                }

                await refreshData();
            } catch (error) {
                console.error('Error initializing DB:', error);
            } finally {
                setCargando(false);
            }
        };
        init();
    }, []);

    // Sync stats to Firestore (once per day)
    useEffect(() => {
        const syncStats = async () => {
            if (!cargando && user) {
                await syncUserStats(user.uid, user.email, {
                    monedas: monedas.length,
                    billetes: billetes.length,
                    albums: albums.length
                });
            }
        };
        syncStats();
    }, [cargando, user, monedas.length, billetes.length, albums.length]);

    const agregarItem = async (item, tipo) => {
        try {
            await addItem(item, tipo);
            await refreshData();
            return true;
        } catch (error) {
            console.error('Error adding item:', error);
            return false;
        }
    };

    const actualizarItem = async (item) => {
        try {
            await updateItem(item);
            await refreshData();
            return true;
        } catch (error) {
            console.error('Error updating item:', error);
            return false;
        }
    };

    const eliminarItem = async (id) => {
        try {
            await deleteItem(id);
            await refreshData();
            return true;
        } catch (error) {
            console.error('Error deleting item:', error);
            return false;
        }
    };

    const addToWishlist = async (item) => {
        const newItem = { ...item, id: Date.now().toString() };
        await addItem(newItem, 'wishlist');
        await refreshData();
    };

    const removeFromWishlist = async (id) => {
        await deleteItem(id);
        await refreshData();
    };

    const downloadWishlist = () => {
        const textContent = wishlist.map(item =>
            `Nombre: ${item.nombre}\nPaís: ${item.pais}\nDenominación: ${item.denominacion}\n-------------------`
        ).join('\n\n');

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mi-wishlist-monedas.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const toggleFavorito = async (id, tipo) => {
        const list = tipo === 'monedas' ? monedas : billetes;
        const item = list.find(i => i.id === id);
        if (item) {
            await toggleFavoritoDB(id, !item.favorito);
            await refreshData();
        }
    };

    const calcularValorTotal = () => {
        const totalMonedas = monedas.reduce((sum, m) => sum + (parseFloat(m.valorComprado) || 0), 0);
        const totalBilletes = billetes.reduce((sum, b) => sum + (parseFloat(b.valorComprado) || 0), 0);
        return { totalMonedas, totalBilletes, total: totalMonedas + totalBilletes };
    };

    const exportarBackup = async () => {
        try {
            const backupData = {
                monedas,
                billetes,
                wishlist,
                fecha: new Date().toISOString(),
                version: '1.0'
            };

            const jsonString = JSON.stringify(backupData, null, 2);

            if (Capacitor.isNativePlatform()) {
                const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
                const { Share } = await import('@capacitor/share');

                // 1. Pedir nombre del archivo
                let fileName = window.prompt("Nombre del archivo de backup:", `coinvault-backup-${new Date().toISOString().slice(0, 10)}`);

                if (!fileName) return false; // Usuario canceló

                if (!fileName.endsWith('.json')) {
                    fileName += '.json';
                }

                // 2. Escribir archivo en Cache (temporalmente)
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: jsonString,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8
                });

                // 3. Compartir el archivo para que el usuario elija dónde guardarlo
                await Share.share({
                    title: 'Guardar Backup',
                    text: 'Guarda tu copia de seguridad de CoinVault',
                    url: result.uri,
                    dialogTitle: 'Guardar Backup en...'
                });

                return true;
            } else {
                // Web implementation
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `coinvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                return true;
            }
        } catch (error) {
            console.error('Error al exportar backup:', error);
            return false;
        }
    };

    const importarBackup = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.monedas) {
                        for (const m of data.monedas) await addItem(m, 'monedas');
                    }
                    if (data.billetes) {
                        for (const b of data.billetes) await addItem(b, 'billetes');
                    }
                    if (data.wishlist) {
                        for (const w of data.wishlist) await addItem(w, 'wishlist');
                    }

                    await refreshData();
                    resolve({ success: true, message: 'Backup restaurado correctamente' });
                } catch (error) {
                    console.error('Error al importar backup:', error);
                    resolve({ success: false, message: 'Error al procesar el archivo de backup' });
                }
            };
            reader.onerror = () => resolve({ success: false, message: 'Error al leer el archivo' });
            reader.readAsText(file);
        });
    };

    const crearNuevoAlbum = async (album) => {
        try {
            await createAlbum(album);
            await refreshData();
            return true;
        } catch (error) {
            console.error('Error creating album:', error);
            return false;
        }
    };

    const eliminarAlbumExistente = async (id) => {
        try {
            await deleteAlbum(id);
            await refreshData();
            return true;
        } catch (error) {
            console.error('Error deleting album:', error);
            return false;
        }
    };

    const obtenerItemsAlbum = async (albumId) => {
        try {
            return await getAlbumItems(albumId);
        } catch (error) {
            console.error('Error fetching album items:', error);
            return [];
        }
    };

    const value = React.useMemo(() => ({
        monedas,
        billetes,
        wishlist,
        albums,
        cargando,
        agregarItem,
        actualizarItem,
        eliminarItem,
        addToWishlist,
        removeFromWishlist,
        downloadWishlist,
        toggleFavorito,
        calcularValorTotal,
        exportarBackup,
        importarBackup,
        crearNuevoAlbum,
        eliminarAlbumExistente,
        obtenerItemsAlbum
    }), [monedas, billetes, wishlist, albums, cargando]);

    return (
        <CollectionContext.Provider value={value}>
            {children}
        </CollectionContext.Provider>
    );
};
