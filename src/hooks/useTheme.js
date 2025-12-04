import { useState, useEffect } from 'react';
import localforage from 'localforage';

export const useTheme = () => {
    const [modoOscuro, setModoOscuro] = useState(false);
    const [temaColor, setTemaColor] = useState('indigo'); // indigo, emerald, rose, amber, cyan
    const [themeVariant, setThemeVariant] = useState('standard'); // standard, compact, glass, neo, retro

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedDarkMode = await localforage.getItem('modoOscuro');
                const savedColorTheme = await localforage.getItem('temaColor');
                const savedVariant = await localforage.getItem('themeVariant');

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

                if (savedVariant) {
                    setThemeVariant(savedVariant);
                    document.documentElement.setAttribute('data-variant', savedVariant);
                } else {
                    document.documentElement.setAttribute('data-variant', 'standard');
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

    const cambiarVariant = async (variant) => {
        setThemeVariant(variant);
        document.documentElement.setAttribute('data-variant', variant);
        try {
            await localforage.setItem('themeVariant', variant);
        } catch (error) {
            console.error('Error saving theme variant:', error);
        }
    };

    return {
        modoOscuro,
        toggleModoOscuro,
        temaColor,
        cambiarTemaColor,
        themeVariant,
        cambiarVariant
    };
};
