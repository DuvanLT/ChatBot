import express from 'express';


const app = express();
const PORT = process.env.PORT || 3000;

// Datos de tu bot
const BOT_TOKEN = '7640328819:AAEfUWciE45VehMSPDXz7k-8B9zrjqsA9P0';
const CHAT_ID = '-4687358397'; // el que sacaste de getUpdates

app.use(express.json());

app.post('/webhook', async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;

  let mensaje = 'Intent no reconocido.';

  if (intent === 'ChatKIT_saludos') {
    mensaje = '¡Hola desde Dialogflow, enviado a Telegram!';
  }

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

