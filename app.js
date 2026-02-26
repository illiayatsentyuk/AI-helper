import ollama from 'ollama'
import express from 'express'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import bodyParser from 'body-parser'
import sendMessage from './model/llama.js'
import { getQuestion } from './controllers/questions.controller.js'
import { getTemperature } from './controllers/temperature.controller.js'
const app = express()

const port = new SerialPort({
  path: 'COM3', // Linux: /dev/ttyUSB0
  baudRate: 9600,
})
function sendToArduino(text) {
  port.write(text + '\n')
}

const parser = port.pipe(
    new ReadlineParser({ delimiter: '\n' })
)

let sensorGateActive = false
let sensorGateTimeout = null

function activateSensorGate(durationMs = 6000) {
  sensorGateActive = true
  if (sensorGateTimeout) {
    clearTimeout(sensorGateTimeout)
  }
  sensorGateTimeout = setTimeout(() => {
    sensorGateActive = false
    sensorGateTimeout = null
  }, durationMs)
}

parser.on('data', async (line) => {
    if (!sensorGateActive) {
      return
    }
    try {
      if(line.includes('temperature')) {
        const temperature = await getTemperature(line)
        sendToArduino(temperature)
      }
      else{
        const question = await getQuestion(line)
        sendToArduino(question)
      }
    } catch (e) {
      console.log('Не JSON:', line)
    }
  })

port.on('open', () => {
  console.log('Arduino connected')
})

// port.on('data', data => {
//   console.log('[ARDUINO]', data.toString())
// })

app.use(bodyParser.json())

app.post('/', async (req, res) => {
  const { prompt: _prompt } = req.body;
  const prompt = `Question: ${_prompt}
Instruction: Answer only the question above. Give a direct, informative answer. No preamble, no markdown, no quotes, no conversational filler—only the answer that informs about the question.
Response: `
  const response = await sendMessage(prompt)
  console.log(response.message.content)
  sendToArduino(response.message.content)
  res.send(response.message.content)
})

app.get('/temperature', async (req, res) => {
  try{
    const prompt = `
    Question: What is the temperature and humidity?
    Instruction: Output the exact phrase "<temperature>,<humidity>" and nothing else. If you don't know the temperature and humidity, output "0,0". 
    Do not any other text or punctuation. Do not use any other words or phrases.
    Constraint: No conversational filler, no markdown, no quotes
    Response:
    `
    const data = await sendMessage(prompt)
    const temperature = data.message.content.split(',')[0].trim()
    const humidity = data.message.content.split(',')[1].trim()
    sendToArduino(`{"temperature": ${temperature}, "humidity": ${humidity}}`)
    res.send({"temperature": temperature, "humidity": humidity})
  }catch(e){
    return res.status(400).send('Error getting temperature and humidity')
  }
})

app.post('/gate', (req, res) => {
  activateSensorGate(5000)
  res.send('Sensor gate active for 5 seconds')
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})