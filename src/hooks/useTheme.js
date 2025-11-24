import { useState, useEffect } from 'react';
import localforage from 'localforage';

export const useTheme = () => {
    const [modoOscuro, setModoOscuro] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedDarkMode = await localforage.getItem('modoOscuro');
                if (savedDarkMode !== null) {
                    setModoOscuro(savedDarkMode);
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
        try {
            await localforage.setItem('modoOscuro', newMode);
        } catch (error) {
            console.error('Error saving dark mode:', error);
        }
    };

    return {
        modoOscuro,
        toggleModoOscuro
    };
};
