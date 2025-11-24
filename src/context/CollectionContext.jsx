import React, { createContext, useState, useEffect, useContext } from 'react';
import localforage from 'localforage';

const CollectionContext = createContext();

export const useCollection = () => {
    const context = useContext(CollectionContext);
    if (!context) {
        throw new Error('useCollection debe usarse dentro de un CollectionProvider');
    }
    return context;
};

export const CollectionProvider = ({ children }) => {
    const [monedas, setMonedas] = useState([]);
    const [billetes, setBilletes] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const savedMonedas = await localforage.getItem('coleccion-monedas');
            const savedBilletes = await localforage.getItem('coleccion-billetes');
            const savedWishlist = await localforage.getItem('coleccion-wishlist');

            if (savedMonedas) {
                setMonedas(savedMonedas);
            }
            if (savedBilletes) {
                setBilletes(savedBilletes);
            }
            if (savedWishlist) {
                setWishlist(savedWishlist);
            }
        } catch (error) {
            console.log('Primera vez usando la app o error al cargar:', error);
        } finally {
            setCargando(false);
        }
    };

    const guardarMonedas = async (nuevasMonedas) => {
        try {
            await localforage.setItem('coleccion-monedas', nuevasMonedas);
            setMonedas(nuevasMonedas);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar. Intenta de nuevo.');
        }
    };

    const guardarBilletes = async (nuevosBilletes) => {
        try {
            await localforage.setItem('coleccion-billetes', nuevosBilletes);
            setBilletes(nuevosBilletes);
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar. Intenta de nuevo.');
        }
    };

    const guardarWishlist = async (nuevaWishlist) => {
        try {
            await localforage.setItem('coleccion-wishlist', nuevaWishlist);
            setWishlist(nuevaWishlist);
        } catch (error) {
            console.error('Error al guardar wishlist:', error);
        }
    };

    const addToWishlist = async (item) => {
        const newItem = { ...item, id: Date.now().toString() };
        const newWishlist = [...wishlist, newItem];
        await guardarWishlist(newWishlist);
    };

    const removeFromWishlist = async (id) => {
        const newWishlist = wishlist.filter(item => item.id !== id);
        await guardarWishlist(newWishlist);
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
        if (tipo === 'monedas') {
            const nuevasMonedas = monedas.map(m =>
                m.id === id ? { ...m, favorito: !m.favorito } : m
            );
            await guardarMonedas(nuevasMonedas);
        } else {
            const nuevosBilletes = billetes.map(b =>
                b.id === id ? { ...b, favorito: !b.favorito } : b
            );
            await guardarBilletes(nuevosBilletes);
        }
    };

    const calcularValorTotal = () => {
        const totalMonedas = monedas.reduce((sum, m) => sum + (parseFloat(m.valorComprado) || 0), 0);
        const totalBilletes = billetes.reduce((sum, b) => sum + (parseFloat(b.valorComprado) || 0), 0);
        return { totalMonedas, totalBilletes, total: totalMonedas + totalBilletes };
    };

    const value = {
        monedas,
        billetes,
        wishlist,
        cargando,
        guardarMonedas,
        guardarBilletes,
        addToWishlist,
        removeFromWishlist,
        downloadWishlist,
        toggleFavorito,
        calcularValorTotal
    };

    return (
        <CollectionContext.Provider value={value}>
            {children}
        </CollectionContext.Provider>
    );
};
