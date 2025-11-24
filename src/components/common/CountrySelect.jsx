import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const CountrySelect = ({ value, onChange, countries, placeholder = "Seleccionar país" }) => {
    const { modoOscuro } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const filteredCountries = useMemo(() => {
        return countries.filter(country =>
            country.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [countries, searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (country) => {
        onChange(country);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${modoOscuro
                    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    : 'bg-white border-gray-300 hover:border-indigo-500'
                    }`}
            >
                <span className={!value ? 'text-gray-400' : ''}>
                    {value || placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {value && (
                        <button
                            onClick={handleClear}
                            className={`p-1 rounded-full hover:bg-gray-200 ${modoOscuro ? 'hover:bg-gray-500' : ''}`}
                        >
                            <X size={16} className="text-gray-400" />
                        </button>
                    )}
                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className={`absolute z-50 w-full mt-2 rounded-xl shadow-2xl overflow-hidden border ${modoOscuro ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                    <div className={`p-3 border-b ${modoOscuro ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar país..."
                                className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none ${modoOscuro
                                    ? 'bg-gray-700 text-white placeholder-gray-400'
                                    : 'bg-gray-100 text-gray-800 placeholder-gray-500'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                                <div
                                    key={country}
                                    onClick={() => handleSelect(country)}
                                    className={`px-4 py-3 cursor-pointer text-sm transition-colors ${value === country
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : modoOscuro
                                            ? 'text-gray-200 hover:bg-gray-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        } ${value === country && modoOscuro ? 'bg-indigo-900 text-indigo-200' : ''}`}
                                >
                                    {country}
                                </div>
                            ))
                        ) : (
                            <div className={`px-4 py-6 text-center text-sm ${modoOscuro ? 'text-gray-400' : 'text-gray-500'}`}>
                                No se encontraron países
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CountrySelect;
