import express from 'express';
import { GoogleAuth } from 'google-auth-library';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const auth = new GoogleAuth({
  keyFile: './chatkit-yfkj-9c7b7cfc8088',
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
          languageCode: 'es',
        },
      },
    }),
  });

  const json = await res.json();

// Datos de tu bot
const BOT_TOKEN = '7640328819:AAEfUWciE45VehMSPDXz7k-8B9zrjqsA9P0';
const CHAT_ID = '-4687358397'; // el que sacaste de getUpdates


app.post('/webhook', async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  let mensaje = req.body.queryResult.fulfillmentText;

  // Enviar a Telegram
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensaje,
      }),
    });

    if (!r.ok) {
      console.error('Error al enviar a Telegram:', await r.text());
    }
  } catch (err) {
    console.error('Fallo al conectar con Telegram:', err);
  }

  // Respuesta a Dialogflow
  res.json({
    fulfillmentText: mensaje,
  });
});

app.get('/', (req, res) => {
  res.send('Webhook de Dialogflow corriendo.');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

