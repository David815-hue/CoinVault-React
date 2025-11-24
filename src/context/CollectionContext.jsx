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
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const savedMonedas = await localforage.getItem('coleccion-monedas');
            const savedBilletes = await localforage.getItem('coleccion-billetes');

            if (savedMonedas) {
                setMonedas(savedMonedas);
            }
            if (savedBilletes) {
                setBilletes(savedBilletes);
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
        cargando,
        guardarMonedas,
        guardarBilletes,
        toggleFavorito,
        calcularValorTotal
    };

    return (
        <CollectionContext.Provider value={value}>
            {children}
        </CollectionContext.Provider>
    );
};
