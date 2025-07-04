import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Pega aquí tu URL del workflow de Teams
const TEAMS_FLOW_URL = 'https://prod-39.westus.logic.azure.com:443/workflows/c221f323038f4f408df0098fa48007b3/triggers/manual/paths/invoke?api-version=2016-06-01';

app.use(express.json());

app.post('/webhook', async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const session = req.body.session;

  let mensaje = 'Intent no reconocido.';

  if (intent === 'ChatKIT_saludos') {
    mensaje = '¡Hola desde Dialogflow, enviado a Teams!';
  }

  // Enviar mensaje a Power Automate / Teams
  try {
    const r = await fetch(TEAMS_FLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: mensaje,
        session: session, // opcional, para identificar usuario
      }),
    });

    if (!r.ok) {
      console.error('Error al enviar a Teams:', await r.text());
    }
  } catch (err) {
    console.error('Fallo conexión a Teams Flow:', err);
  }

  // Responder a Dialogflow
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

