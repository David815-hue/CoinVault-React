import { gapi } from 'gapi-script';
import pako from 'pako';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const initGoogleDrive = (accessToken) => {
    return new Promise((resolve, reject) => {
        // Timeout para evitar que se quede cargando infinitamente
        const timeoutId = setTimeout(() => {
            reject(new Error("Timeout initializing Google Drive API"));
        }, 10000); // 10 segundos timeout

        const loadGapi = () => {
            if (typeof gapi === 'undefined') {
                console.error("GAPI script not loaded");
                // Intentar cargar el script si no existe
                const script = document.createElement('script');
                script.src = "https://apis.google.com/js/api.js";
                script.onload = () => loadGapi();
                script.onerror = () => {
                    clearTimeout(timeoutId);
                    reject(new Error("Failed to load GAPI script"));
                };
                document.body.appendChild(script);
                return;
            }

            gapi.load('client', () => {
                gapi.client.init({
                    discoveryDocs: DISCOVERY_DOCS,
                }).then(() => {
                    clearTimeout(timeoutId);
                    if (accessToken) {
                        gapi.client.setToken({ access_token: accessToken });
                        console.log("GAPI Client initialized and token set");
                        resolve(true);
                    } else {
                        console.log("GAPI Client initialized without token");
                        resolve(false);
                    }
                }).catch(error => {
                    clearTimeout(timeoutId);
                    console.error("Error initializing GAPI client", error);
                    reject(error);
                });
            });
        };

        // Si ya está cargado y listo, intentar usarlo
        if (typeof gapi !== 'undefined' && gapi.client) {
            // Verificar si ya está inicializado o intentar reusar
            try {
                if (accessToken) gapi.client.setToken({ access_token: accessToken });
                clearTimeout(timeoutId);
                resolve(true);
            } catch (e) {
                // Si falla, intentar cargar de nuevo
                loadGapi();
            }
        } else {
            loadGapi();
        }
    });
};

export const findBackupFile = async () => {
    try {
        // Try to find compressed backup first (.json.gz)
        let response = await gapi.client.drive.files.list({
            q: "name = 'coinvault_backup.json.gz' and trashed = false",
            fields: "files(id, name, createdTime)",
            spaces: 'drive'
        });

        let files = response.result.files;
        if (files && files.length > 0) {
            return files[0];
        }

        // Fallback: search for old uncompressed backup
        response = await gapi.client.drive.files.list({
            q: "name = 'coinvault_backup.json' and trashed = false",
            fields: "files(id, name, createdTime)",
            spaces: 'drive'
        });

        files = response.result.files;
        if (files && files.length > 0) {
            return files[0];
        }

        return null;
    } catch (error) {
        console.error("Error finding backup file", error);
        throw error;
    }
};

export const downloadBackupFile = async (fileId) => {
    try {
        // Get file info to check if compressed
        const fileInfo = await gapi.client.drive.files.get({
            fileId: fileId,
            fields: 'name,mimeType'
        });

        const fileName = fileInfo.result.name;
        const shouldBeCompressed = fileName.endsWith('.gz') || fileInfo.result.mimeType === 'application/gzip';

        console.log(`📥 Descargando: ${fileName} (Debería estar comprimido: ${shouldBeCompressed})`);

        // Get access token
        const token = gapi.auth.getToken().access_token;

        // Use XMLHttpRequest with arraybuffer to avoid UTF-8 corruption
        const arrayBuffer = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.responseType = 'arraybuffer'; // Critical: prevents UTF-8 interpretation

            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(new Error(`HTTP error! status: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send();
        });

        // Always download as ArrayBuffer to inspect the data
        const data = new Uint8Array(arrayBuffer);

        // Check GZIP magic number (0x1F 0x8B)
        const isActuallyGZIP = data.length >= 2 && data[0] === 0x1F && data[1] === 0x8B;

        console.log(`🔍 Verificación:`, {
            tamaño: data.length,
            primerosByte: Array.from(data.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
            esGZIPReal: isActuallyGZIP,
            deberiaSerGZIP: shouldBeCompressed
        });

        // If it's actually GZIP, decompress it
        if (isActuallyGZIP) {
            console.log('🗜️ GZIP detectado, descomprimiendo...');
            try {
                const decompressed = pako.ungzip(data, { to: 'string' });
                console.log('✅ Descompresión exitosa');
                return JSON.parse(decompressed);
            } catch (decompressError) {
                console.error('❌ Error descomprimiendo:', decompressError);
                throw new Error('No se pudo descomprimir el backup');
            }
        }

        // Not actually GZIP, treat as plain text/JSON
        console.log('📄 No es GZIP, parseando como JSON...');
        const text = new TextDecoder().decode(data);
        return JSON.parse(text);
    } catch (error) {
        console.error("Error downloading backup file", error);
        throw error;
    }
};


export const uploadBackupFile = async (data) => {
    try {
        // Convert data to JSON string
        const jsonString = JSON.stringify(data);

        // Compress with GZIP
        const compressed = pako.gzip(jsonString);
        console.log(`📦 Backup: ${(jsonString.length / 1024).toFixed(0)} KB → ${(compressed.length / 1024).toFixed(0)} KB (${((1 - compressed.length / jsonString.length) * 100).toFixed(0)}% reducción)`);

        // Create blob with compressed data
        const file = new Blob([compressed], { type: 'application/gzip' });
        const metadata = {
            name: 'coinvault_backup.json.gz',
            mimeType: 'application/gzip',
            description: 'CoinVault compressed backup (GZIP)'
        };

        const existingFile = await findBackupFile();

        if (existingFile) {
            // Update existing file
            const path = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`;
            const method = 'PATCH';
            return await uploadFileMultipart(path, method, metadata, file);
        } else {
            // Create new file
            const path = 'https://www.googleapis.com/upload/drive/v3/files';
            const method = 'POST';
            return await uploadFileMultipart(path, method, metadata, file);
        }
    } catch (error) {
        console.error("Error uploading backup file", error);
        throw error;
    }
};

// Helper function to upload file using multipart/related
const uploadFileMultipart = (path, method, metadata, file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const contentType = file.type || 'application/octet-stream';

            // Build multipart body properly for binary data
            const metadataPart = delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n\r\n';

            // Convert metadata string to Uint8Array
            const encoder = new TextEncoder();
            const metadataBytes = encoder.encode(metadataPart);
            const fileBytes = new Uint8Array(e.target.result);
            const closingBytes = encoder.encode(close_delim);

            // Combine all parts into single Uint8Array
            const totalLength = metadataBytes.length + fileBytes.length + closingBytes.length;
            const combined = new Uint8Array(totalLength);
            combined.set(metadataBytes, 0);
            combined.set(fileBytes, metadataBytes.length);
            combined.set(closingBytes, metadataBytes.length + fileBytes.length);

            // Get access token
            const token = gapi.auth.getToken().access_token;

            // Use XMLHttpRequest to send binary data
            const xhr = new XMLHttpRequest();
            xhr.open(method, path + '?uploadType=multipart');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.setRequestHeader('Content-Type', 'multipart/related; boundary="' + boundary + '"');

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error during upload'));
            xhr.send(combined);
        };
    });
};
