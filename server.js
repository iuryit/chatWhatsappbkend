const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

const port = process.env.PORT || 3000;
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


// Verificar webhook (GET)
app.get('/webhook', (req, res) => {
  const verifyToken = 'EAATZBRkrgjUEBO033BGZBJWnVlo5WsR2ckoDciAZCOWNQ40DqdEWcIuhEhsHwAeN62o3jeGCQ1yA9EJdLwrnyjvoIwojMdmoHZAwHaqAACsaOMQwjOlsjNRTGwm8flTflLM3XIb5E5oPMqALvTGAMcTuiS5uZBgqV4VSePlkjjmZAGfY1lu5HLDZCBQPnkVEdfo8xZCOWKbaXRW8RVmMMd5EAdKhmrlIKZCgCUK8ZD';

  // Pegando parâmetros da query string
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK VERIFICADO COM SUCESSO!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});


// Receber mensagens (POST)
app.post('/webhook', (req, res) => {
  console.log('Webhook recebido:', JSON.stringify(req.body, null, 2));
  // io.emit('nova-mensagem', body);
  res.sendStatus(200);
});

app.use((req, res, next) => {
  console.log('🔔 Nova requisição recebida:', req.method, req.url);
  next();
});

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
