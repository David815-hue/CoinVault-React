import React from 'react';
import { Home, Coins, Banknote, List, Palette } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const NavBar = ({ vista, setVista, setMostrarTemas }) => {
    const { modoOscuro } = useTheme();

    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Inicio' },
        { id: 'monedas', icon: Coins, label: 'Monedas' },
        { id: 'billetes', icon: Banknote, label: 'Billetes' }
    ];

    return (
        <nav className={`fixed bottom-0 left-0 right-0 ${modoOscuro
            ? 'bg-gray-900/60 border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-white/60 border-white/40 shadow-[0_-4px_30px_rgba(0,0,0,0.1)]'
            } backdrop-blur-xl border-t z-50 transition-all duration-300 pb-safe`}
        >
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-around items-center h-20">
                    {navItems.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => setVista(id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group ${vista === id
                                ? 'text-[var(--color-primary)] transform -translate-y-1'
                                : modoOscuro
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={24} className={`mb-1 transition-transform group-hover:scale-110 ${vista === id ? 'fill-current' : ''}`} />
                            <span className="text-xs font-medium">{label}</span>
                        </button>
                    ))}

                    <button
                        onClick={() => setVista('wishlist')}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group ${vista === 'wishlist'
                            ? 'text-[var(--color-primary)] transform -translate-y-1'
                            : modoOscuro
                                ? 'text-gray-400 hover:text-gray-200'
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <List size={24} className={`mb-1 transition-transform group-hover:scale-110 ${vista === 'wishlist' ? 'fill-current' : ''}`} />
                        <span className="text-xs font-medium">Deseos</span>
                    </button>

                    <button
                        onClick={() => setMostrarTemas(true)}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group ${modoOscuro
                            ? 'text-[var(--color-primary)] hover:brightness-110'
                            : 'text-[var(--color-primary)] hover:brightness-90'
                            }`}
                    >
                        <Palette size={24} className="mb-1 transition-transform group-hover:rotate-12" />
                        <span className="text-xs font-medium">Temas</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
