import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/webhook', (req, res) => {
  const intent = req.body.queryResult.intent.displayName;

  console.log('Intent detectado:', intent);

  if (intent === 'saludo') {
    return res.json({
      fulfillmentText: '¡Hola desde Render!',
    });
  }

  res.json({
    fulfillmentText: 'Intent no reconocido.',
  });
});

app.get('/', (req, res) => {
  res.send('Webhook de Dialogflow corriendo.');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
