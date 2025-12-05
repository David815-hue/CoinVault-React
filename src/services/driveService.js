import { gapi } from 'gapi-script';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

export const initGoogleDrive = (accessToken) => {
    return new Promise((resolve, reject) => {
        gapi.load('client', () => {
            gapi.client.init({
                discoveryDocs: DISCOVERY_DOCS,
            }).then(() => {
                // Set the access token for the gapi client
                if (accessToken) {
                    gapi.client.setToken({ access_token: accessToken });
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(error => {
                console.error("Error initializing GAPI client", error);
                reject(error);
            });
        });
    });
};

export const findBackupFile = async () => {
    try {
        const response = await gapi.client.drive.files.list({
            q: "name = 'coinvault_backup.json' and trashed = false",
            fields: "files(id, name, createdTime)",
            spaces: 'drive'
        });

        const files = response.result.files;
        if (files && files.length > 0) {
            return files[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error finding backup file", error);
        throw error;
    }
};

export const downloadBackupFile = async (fileId) => {
    try {
        const response = await gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
        });
        return response.result || response.body;
    } catch (error) {
        console.error("Error downloading backup file", error);
        throw error;
    }
};

export const uploadBackupFile = async (data) => {
    try {
        console.log('☁️ uploadBackupFile recibió:', data);
        console.log('☁️ Tipo de data:', typeof data);
        console.log('☁️ Datos a stringificar:', {
            monedas: data?.monedas?.length || 0,
            billetes: data?.billetes?.length || 0,
            wishlist: data?.wishlist?.length || 0,
            albums: data?.albums?.length || 0
        });

        const fileContent = JSON.stringify(data);
        console.log('☁️ JSON string length:', fileContent.length);
        console.log('☁️ JSON preview (primeros 200 chars):', fileContent.substring(0, 200));

        const file = new Blob([fileContent], { type: 'application/json' });
        const metadata = {
            name: 'coinvault_backup.json',
            mimeType: 'application/json',
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

            let body = delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                '\r\n';

            // We need to combine the string body with the array buffer
            // Since JS strings are UTF-16, this can be tricky.
            // Using gapi.client.request might be easier if we can figure out the body format.
            // But doing a raw fetch is often more reliable for uploads.

            // Simpler approach using gapi request for small JSON files
            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n\r\n' +
                new TextDecoder().decode(e.target.result) + // Decoding might be risky for binary, but JSON is text
                close_delim;

            gapi.client.request({
                path: path,
                method: method,
                params: { uploadType: 'multipart' },
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                body: multipartRequestBody
            }).then(response => {
                resolve(response.result);
            }).catch(err => {
                reject(err);
            });
        };
    });
};
