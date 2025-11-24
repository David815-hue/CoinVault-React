import React from 'react';
import { Home, Coins, Banknote, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const NavBar = ({ vista, setVista }) => {
    const { modoOscuro, toggleModoOscuro } = useTheme();

    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Inicio' },
        { id: 'monedas', icon: Coins, label: 'Monedas' },
        { id: 'billetes', icon: Banknote, label: 'Billetes' }
    ];

    return (
        <nav className={`fixed bottom-0 left-0 right-0 ${modoOscuro ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t shadow-lg z-50`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-around items-center h-16">
                    {navItems.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setVista(id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${vista === id
                                    ? 'text-indigo-600'
                                    : modoOscuro
                                        ? 'text-gray-400 hover:text-gray-200'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={24} />
                            <span className="text-xs mt-1">{label}</span>
                        </button>
                    ))}

                    <button
                        onClick={toggleModoOscuro}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${modoOscuro
                                ? 'text-gray-400 hover:text-gray-200'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {modoOscuro ? <Sun size={24} /> : <Moon size={24} />}
                        <span className="text-xs mt-1">Modo</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
