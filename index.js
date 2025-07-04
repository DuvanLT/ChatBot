
import express from 'express';
import { GoogleAuth } from 'google-auth-library';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configura tu bot de Telegram
const BOT_TOKEN = '7640328819:AAEfUWciE45VehMSPDXz7k-8B9zrjqsA9P0'; // reemplaza con el real
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Configura tu archivo de clave y proyecto de Dialogflow
const auth = new GoogleAuth({
  keyFile: './chatkit-yfkj-9c7b7cfc8088', // asegúrate de tenerlo en la raíz
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
});

const getToken = async () => {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
};

const llamarDialogflow = async (mensaje, sessionId) => {
  const token = await getToken();

  const res = await fetch(`https://dialogflow.googleapis.com/v2/projects/chatkit-yfkj/agent/sessions/${sessionId}:detectIntent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      queryInput: {
        text: {
          text: mensaje,
          languageCode: 'es', // cambia si usas otro idioma
        },
      },
    }),
  });

  const json = await res.json();
  return json.queryResult.fulfillmentText || 'Lo siento, no entendí eso.';
};

// Ruta principal para verificar si corre
app.get('/', (req, res) => {
  res.send('✅ Webhook de Telegram y Dialogflow activo.');
});

// Webhook de Telegram (mensajes entrantes)
app.post('/telegram', async (req, res) => {
  const mensaje = req.body.message?.text;
  const chatId = req.body.message?.chat?.id;

  if (!mensaje || !chatId) {
    return res.sendStatus(400);
  }

  console.log(`📨 Mensaje recibido: ${mensaje}`);

  // Enviar a Dialogflow
  const respuesta = await llamarDialogflow(mensaje, chatId);

  // Enviar la respuesta a Telegram
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: respuesta,
      }),
    });
    console.log(`✅ Respuesta enviada: ${respuesta}`);
  } catch (err) {
    console.error('❌ Error al enviar mensaje a Telegram:', err);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});


