const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.use(cors());
app.use(express.json());

const token = 'EAATZBRkrgjUEBO033BGZBJWnVlo5WsR2ckoDciAZCOWNQ40DqdEWcIuhEhsHwAeN62o3jeGCQ1yA9EJdLwrnyjvoIwojMdmoHZAwHaqAACsaOMQwjOlsjNRTGwm8flTflLM3XIb5E5oPMqALvTGAMcTuiS5uZBgqV4VSePlkjjmZAGfY1lu5HLDZCBQPnkVEdfo8xZCOWKbaXRW8RVmMMd5EAdKhmrlIKZCgCUK8ZD';
const phoneNumberId = '597150736823959';
// const phoneNumberId = '985575657064027';
// const phoneNumberId = '+1 555 136 8377';
// const phoneNumberId = '+15551368377';
// Rota para enviar mensagem de texto via API do WhatsApp
app.post('/send-message', async (req, res) => {
  const { to, message } = req.body;
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data);
    res.status(500).json(error.response.data);
  }
});

app.use((req, res, next) => {
  console.log('🔔 Nova requisição recebida:', req.method, req.url);
  next();
});

// Webhook para receber mensagens e notificações do WhatsApp
app.post('/webhook', (req, res) => {
  console.log('Webhook POST');
  const body = req.body;
  console.log('Webhook recebido:', JSON.stringify(body, null, 2));

  io.emit('nova-mensagem', body);
  res.sendStatus(200);
});

// Endpoint para verificação inicial do Webhook
app.get('/webhook', (req, res) => {
  console.log('Webhook GET');
  const verify_token = "531FE70FFD685C69B24F7262A30A391CC8ACDA";
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === verify_token) {
    console.log('WEBHOOK VERIFICADO');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
