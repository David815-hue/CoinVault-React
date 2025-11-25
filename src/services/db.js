// IndexedDB implementation for CoinVault
// This replaces SQLite WASM to fix persistence issues

const DB_NAME = 'CoinVaultDB';
const DB_VERSION = 1;
let db = null;

// Initialize IndexedDB
export const initDB = async () => {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Error opening IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('✅ IndexedDB initialized successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Create items store (for coins and bills)
            if (!database.objectStoreNames.contains('items')) {
                const itemsStore = database.createObjectStore('items', { keyPath: 'id' });
                itemsStore.createIndex('type', 'type', { unique: false });
                itemsStore.createIndex('created_at', 'created_at', { unique: false });
                console.log('Created items object store');
            }

            // Create albums store
            if (!database.objectStoreNames.contains('albums')) {
                const albumsStore = database.createObjectStore('albums', { keyPath: 'id' });
                albumsStore.createIndex('created_at', 'created_at', { unique: false });
                console.log('Created albums object store');
            }

            // Create album_items store (junction table)
            if (!database.objectStoreNames.contains('album_items')) {
                const albumItemsStore = database.createObjectStore('album_items', { keyPath: ['album_id', 'item_id'] });
                albumItemsStore.createIndex('album_id', 'album_id', { unique: false });
                albumItemsStore.createIndex('item_id', 'item_id', { unique: false });
                console.log('Created album_items object store');
            }
        };
    });
};

// Get items by type (monedas, billetes, wishlist)
export const getItems = (type) => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['items'], 'readonly');
        const store = transaction.objectStore('items');
        const index = store.index('type');
        const request = index.getAll(type);

        request.onsuccess = () => {
            const items = request.result || [];
            // Sort by created_at descending
            items.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
            resolve(items);
        };

        request.onerror = () => {
            console.error('Error getting items:', request.error);
            reject(request.error);
        };
    });
};

// Add item
export const addItem = (item, type) => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['items'], 'readwrite');
        const store = transaction.objectStore('items');

        const itemToAdd = {
            ...item,
            id: item.id || Date.now().toString(),
            type: type,
            created_at: item.created_at || Date.now(),
            favorito: item.favorito || false
        };

        const request = store.put(itemToAdd); // put = insert or replace

        request.onsuccess = () => resolve(itemToAdd);
        request.onerror = () => {
            console.error('Error adding item:', request.error);
            reject(request.error);
        };
    });
};

// Update item
export const updateItem = (item) => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['items'], 'readwrite');
        const store = transaction.objectStore('items');
        const request = store.put(item);

        request.onsuccess = () => resolve(item);
        request.onerror = () => {
            console.error('Error updating item:', request.error);
            reject(request.error);
        };
    });
};

// Delete item
export const deleteItem = (id) => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['items'], 'readwrite');
        const store = transaction.objectStore('items');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error deleting item:', request.error);
            reject(request.error);
        };
    });
};

// Toggle favorite
export const toggleFavoritoDB = (id, favorito) => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['items'], 'readwrite');
        const store = transaction.objectStore('items');
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const item = getRequest.result;
            if (item) {
                item.favorito = favorito;
                const updateRequest = store.put(item);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                reject(new Error('Item not found'));
            }
        };

        getRequest.onerror = () => reject(getRequest.error);
    });
};

// Album operations
export const getAlbums = () => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['albums'], 'readonly');
        const store = transaction.objectStore('albums');
        const request = store.getAll();

        request.onsuccess = () => {
            const albums = request.result || [];
            albums.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
            resolve(albums);
        };

        request.onerror = () => {
            console.error('Error getting albums:', request.error);
            reject(request.error);
        };
    });
};

export const createAlbum = (album) => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const albumId = Date.now().toString();
        const transaction = db.transaction(['albums', 'album_items'], 'readwrite');

        // Add album
        const albumsStore = transaction.objectStore('albums');
        const albumData = {
            id: albumId,
            title: album.title,
            description: album.description,
            color: album.color || 'indigo',
            design: album.design || 'classic',
            created_at: Date.now()
        };
        albumsStore.add(albumData);

        // Add album items
        if (album.items && album.items.length > 0) {
            const albumItemsStore = transaction.objectStore('album_items');
            album.items.forEach(itemId => {
                albumItemsStore.add({
                    album_id: albumId,
                    item_id: itemId
                });
            });
        }

        transaction.oncomplete = () => resolve(albumId);
        transaction.onerror = () => {
            console.error('Error creating album:', transaction.error);
            reject(transaction.error);
        };
    });
};

export const getAlbumItems = (albumId) => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['album_items', 'items'], 'readonly');
        const albumItemsStore = transaction.objectStore('album_items');
        const itemsStore = transaction.objectStore('items');
        const index = albumItemsStore.index('album_id');
        const request = index.getAll(albumId);

        request.onsuccess = () => {
            const albumItems = request.result || [];
            const itemIds = albumItems.map(ai => ai.item_id);

            // Get all items
            const itemPromises = itemIds.map(itemId => {
                return new Promise((res, rej) => {
                    const itemRequest = itemsStore.get(itemId);
                    itemRequest.onsuccess = () => res(itemRequest.result);
                    itemRequest.onerror = () => rej(itemRequest.error);
                });
            });

            Promise.all(itemPromises)
                .then(items => resolve(items.filter(item => item !== undefined)))
                .catch(reject);
        };

        request.onerror = () => {
            console.error('Error getting album items:', request.error);
            reject(request.error);
        };
    });
};

export const deleteAlbum = (id) => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['albums', 'album_items'], 'readwrite');

        // Delete album
        const albumsStore = transaction.objectStore('albums');
        albumsStore.delete(id);

        // Delete album items
        const albumItemsStore = transaction.objectStore('album_items');
        const index = albumItemsStore.index('album_id');
        const request = index.openCursor(IDBKeyRange.only(id));

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => {
            console.error('Error deleting album:', transaction.error);
            reject(transaction.error);
        };
    });
};
