import { useState, useEffect } from 'react';
import localforage from 'localforage';

export const useTheme = () => {
    const [modoOscuro, setModoOscuro] = useState(false);
    const [tema, setTema] = useState('indigo'); // indigo, aurora, midnight, ocean, sunset, mint

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedDarkMode = await localforage.getItem('modoOscuro');
                const savedTema = await localforage.getItem('tema');

                if (savedDarkMode !== null) {
                    setModoOscuro(savedDarkMode);
                    if (savedDarkMode) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }

                if (savedTema) {
                    setTema(savedTema);
                    document.documentElement.setAttribute('data-theme', savedTema);
                } else {
                    document.documentElement.setAttribute('data-theme', 'indigo');
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };

        loadTheme();
    }, []);

    const toggleModoOscuro = async () => {
        const newMode = !modoOscuro;
        setModoOscuro(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        try {
            await localforage.setItem('modoOscuro', newMode);
        } catch (error) {
            console.error('Error saving dark mode:', error);
        }
    };

    const cambiarTema = async (nuevoTema) => {
        setTema(nuevoTema);
        document.documentElement.setAttribute('data-theme', nuevoTema);
        try {
            await localforage.setItem('tema', nuevoTema);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    // Legacy support for old code that uses temaColor
    const temaColor = tema;
    const cambiarTemaColor = cambiarTema;
    const themeVariant = 'standard';
    const cambiarVariant = () => { };

    return {
        modoOscuro,
        toggleModoOscuro,
        tema,
        cambiarTema,
        // Legacy exports
        temaColor,
        cambiarTemaColor,
        themeVariant,
        cambiarVariant
    };
};
