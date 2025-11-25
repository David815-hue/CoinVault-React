// Platform-aware database implementation
// Uses IndexedDB on web and SQLite on mobile
import { Capacitor } from '@capacitor/core';
import * as indexedDBImpl from './db.js';

let sqliteImpl = null;

// Lazy load SQLite implementation only on native platforms
const getSQLiteImpl = async () => {
    if (sqliteImpl) return sqliteImpl;

    if (Capacitor.isNativePlatform()) {
        const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite');

        const sqlite = new SQLiteConnection(CapacitorSQLite);
        const DB_NAME = 'CoinVaultDB';
        let db = null;

        sqliteImpl = {
            initDB: async () => {
                if (db) return db;

                try {
                    // Create or open database
                    const ret = await sqlite.checkConnectionsConsistency();
                    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;

                    if (ret.result && isConn) {
                        db = await sqlite.retrieveConnection(DB_NAME, false);
                    } else {
                        db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
                    }

                    await db.open();

                    // Create tables
                    const createTables = `
                        CREATE TABLE IF NOT EXISTS items (
                            id TEXT PRIMARY KEY,
                            type TEXT NOT NULL,
                            nombre TEXT,
                            descripcion TEXT,
                            denominacion TEXT,
                            fotoFrontal TEXT,
                            fotoTrasera TEXT,
                            ano TEXT,
                            pais TEXT,
                            material TEXT,
                            estado TEXT,
                            valorComprado TEXT,
                            valorVenta TEXT,
                            favorito INTEGER DEFAULT 0,
                            created_at INTEGER
                        );
                        
                        CREATE TABLE IF NOT EXISTS albums (
                            id TEXT PRIMARY KEY,
                            title TEXT NOT NULL,
                            description TEXT,
                            color TEXT DEFAULT 'indigo',
                            design TEXT DEFAULT 'classic',
                            created_at INTEGER
                        );
                        
                        CREATE TABLE IF NOT EXISTS album_items (
                            album_id TEXT NOT NULL,
                            item_id TEXT NOT NULL,
                            PRIMARY KEY (album_id, item_id)
                        );
                    `;

                    await db.execute(createTables);
                    console.log('✅ SQLite database initialized');
                    return db;
                } catch (error) {
                    console.error('Error initializing SQLite:', error);
                    throw error;
                }
            },

            getItems: async (type) => {
                if (!db) await sqliteImpl.initDB();
                const result = await db.query('SELECT * FROM items WHERE type = ? ORDER BY created_at DESC', [type]);
                return result.values || [];
            },

            addItem: async (item, type) => {
                if (!db) await sqliteImpl.initDB();
                const id = item.id || Date.now().toString();
                const query = `INSERT OR REPLACE INTO items (
                    id, type, nombre, descripcion, denominacion, fotoFrontal, fotoTrasera,
                    ano, pais, material, estado, valorComprado, valorVenta, favorito, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                await db.run(query, [
                    id, type, item.nombre, item.descripcion, item.denominacion,
                    item.fotoFrontal, item.fotoTrasera, item.ano, item.pais,
                    item.material, item.estado, item.valorComprado, item.valorVenta,
                    item.favorito ? 1 : 0, item.created_at || Date.now()
                ]);

                return { ...item, id, type };
            },

            updateItem: async (item) => {
                if (!db) await sqliteImpl.initDB();
                const query = `UPDATE items SET 
                    nombre = ?, descripcion = ?, denominacion = ?, fotoFrontal = ?, fotoTrasera = ?,
                    ano = ?, pais = ?, material = ?, estado = ?, valorComprado = ?, valorVenta = ?, favorito = ?
                    WHERE id = ?`;

                await db.run(query, [
                    item.nombre, item.descripcion, item.denominacion, item.fotoFrontal, item.fotoTrasera,
                    item.ano, item.pais, item.material, item.estado, item.valorComprado, item.valorVenta,
                    item.favorito ? 1 : 0, item.id
                ]);

                return item;
            },

            deleteItem: async (id) => {
                if (!db) await sqliteImpl.initDB();
                await db.run('DELETE FROM items WHERE id = ?', [id]);
            },

            toggleFavoritoDB: async (id, favorito) => {
                if (!db) await sqliteImpl.initDB();
                await db.run('UPDATE items SET favorito = ? WHERE id = ?', [favorito ? 1 : 0, id]);
            },

            getAlbums: async () => {
                if (!db) await sqliteImpl.initDB();
                const result = await db.query('SELECT * FROM albums ORDER BY created_at DESC');
                return result.values || [];
            },

            createAlbum: async (album) => {
                if (!db) await sqliteImpl.initDB();
                const albumId = Date.now().toString();

                await db.run(
                    'INSERT INTO albums (id, title, description, color, design, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                    [albumId, album.title, album.description, album.color || 'indigo', album.design || 'classic', Date.now()]
                );

                if (album.items && album.items.length > 0) {
                    for (const itemId of album.items) {
                        await db.run(
                            'INSERT INTO album_items (album_id, item_id) VALUES (?, ?)',
                            [albumId, itemId]
                        );
                    }
                }

                return albumId;
            },

            getAlbumItems: async (albumId) => {
                if (!db) await sqliteImpl.initDB();
                const result = await db.query(`
                    SELECT i.* FROM items i
                    INNER JOIN album_items ai ON i.id = ai.item_id
                    WHERE ai.album_id = ?
                `, [albumId]);
                return result.values || [];
            },

            deleteAlbum: async (id) => {
                if (!db) await sqliteImpl.initDB();
                await db.run('DELETE FROM albums WHERE id = ?', [id]);
                await db.run('DELETE FROM album_items WHERE album_id = ?', [id]);
            }
        };
    }

    return sqliteImpl;
};

// Export unified API
export const initDB = async () => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.initDB();
    } else {
        return indexedDBImpl.initDB();
    }
};

export const getItems = async (type) => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.getItems(type);
    } else {
        return indexedDBImpl.getItems(type);
    }
};

export const addItem = async (item, type) => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.addItem(item, type);
    } else {
        return indexedDBImpl.addItem(item, type);
    }
};

export const updateItem = async (item) => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.updateItem(item);
    } else {
        return indexedDBImpl.updateItem(item);
    }
};

export const deleteItem = async (id) => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.deleteItem(id);
    } else {
        return indexedDBImpl.deleteItem(id);
    }
};

export const toggleFavoritoDB = async (id, favorito) => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.toggleFavoritoDB(id, favorito);
    } else {
        return indexedDBImpl.toggleFavoritoDB(id, favorito);
    }
};

export const getAlbums = async () => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.getAlbums();
    } else {
        return indexedDBImpl.getAlbums();
    }
};

export const createAlbum = async (album) => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.createAlbum(album);
    } else {
        return indexedDBImpl.createAlbum(album);
    }
};

export const getAlbumItems = async (albumId) => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.getAlbumItems(albumId);
    } else {
        return indexedDBImpl.getAlbumItems(albumId);
    }
};

export const deleteAlbum = async (id) => {
    if (Capacitor.isNativePlatform()) {
        const impl = await getSQLiteImpl();
        return impl.deleteAlbum(id);
    } else {
        return indexedDBImpl.deleteAlbum(id);
    }
};
