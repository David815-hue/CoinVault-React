import { useState, useEffect } from 'react';
import localforage from 'localforage';

export const useTheme = () => {
    const [modoOscuro, setModoOscuro] = useState(false);
    const [temaColor, setTemaColor] = useState('indigo'); // indigo, emerald, rose, amber, cyan

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedDarkMode = await localforage.getItem('modoOscuro');
                const savedColorTheme = await localforage.getItem('temaColor');

                if (savedDarkMode !== null) {
                    setModoOscuro(savedDarkMode);
                    if (savedDarkMode) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                }

                if (savedColorTheme) {
                    setTemaColor(savedColorTheme);
                    document.documentElement.setAttribute('data-theme', savedColorTheme);
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

    const cambiarTemaColor = async (color) => {
        setTemaColor(color);
        document.documentElement.setAttribute('data-theme', color);
        try {
            await localforage.setItem('temaColor', color);
        } catch (error) {
            console.error('Error saving color theme:', error);
        }
    };

    return {
        modoOscuro,
        toggleModoOscuro,
        temaColor,
        cambiarTemaColor
    };
};
