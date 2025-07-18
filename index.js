import express from 'express';
import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const BOT_TOKEN = process.env.BOTOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const auth = new GoogleAuth({
  credentials: {
    type: process.env.TYPE,  
    project_id: process.env.GOOGLE_PROJECT_ID,
    google_private_key: process.env.GOOGLE_PRIVATE_KEY,
    token_uri: process.env.TOKEN_URI,
    client_id: process.env.CLIENT_ID,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
});


const getToken = async () => {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  console.log('🟢 Token obtenido correctamente');
  return tokenResponse.token;
};

const llamarDialogflow = async (mensaje, sessionId) => {
  const token = await getToken();

  console.log('📡 Enviando a Dialogflow:', mensaje);

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

  if (res.ok) {
    console.log('🟢 Respuesta de Dialogflow:', JSON.stringify(json, null, 2));
  } else {
    console.error('❌ Error al llamar a Dialogflow:', json);
  }

  return json?.queryResult?.fulfillmentText || 'Lo siento, no entendí eso.';
};

app.get('/', (req, res) => {
  res.send('✅ Webhook de Telegram y Dialogflow activo.');
});

app.post('/telegram', async (req, res) => {
  const mensaje = req.body.message?.text;
  const chatId = process.env.CHAT_ID;

  if (!mensaje || !chatId) {
    console.warn('⚠️ Mensaje o chatId faltante');
    return res.sendStatus(400);
  }

  console.log(`📨 Mensaje recibido de Telegram: "${mensaje}"`);

  try {
    const respuesta = await llamarDialogflow(mensaje, chatId);

    console.log(`📤 Enviando a Telegram: "${respuesta}"`);

    const r = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: respuesta,
      }),
    });

    if (!r.ok) {
      const errorText = await r.text();
      console.error('❌ Error al enviar a Telegram:', errorText);
    } else {
      console.log('✅ Mensaje enviado a Telegram');
    }
  } catch (err) {
    console.error('🔥 Error general en webhook:', err);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

