import OpenAI from "openai";

const API_KEY = "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"; // Key provided by user

const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true // Required for client-side usage
});

export const obtenerInfoIA = async (item, tipo) => {
    const prompt = `
    Actúa como un experto numismático. Proporciona información breve, histórica y curiosa sobre este artículo de colección:
    
    Tipo: ${tipo === 'monedas' ? 'Moneda' : 'Billete'}
    Nombre: ${item.nombre}
    País: ${item.pais}
    Año: ${item.ano}
    ${item.denominacion ? `Denominación: ${item.denominacion}` : ''}
    ${item.descripcion ? `Descripción adicional: ${item.descripcion}` : ''}

    Formato de respuesta (en JSON):
    {
        "historia": "Breve historia del artículo (max 300 caracteres)",
        "curiosidades": ["Curiosidad 1", "Curiosidad 2"],
        "valor_estimado": "Estimación de valor en el mercado de coleccionistas (general)",
        "rareza": "Nivel de rareza (Común, Escaso, Raro, Muy Raro)"
    }
    Responde SOLO con el JSON válido.
    `;

    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: "Eres un asistente experto en numismática que responde siempre en formato JSON válido." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Error al consultar Groq:", error);
        throw error;
    }
};
