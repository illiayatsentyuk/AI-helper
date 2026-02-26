import ollama from 'ollama'
import express from 'express'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import bodyParser from 'body-parser'
import sendMessage from './model/llama.js'
import { getQuestion } from './controllers/questions.controller.js'
import { setTemperature, getTemperature } from './controllers/temperature.controller.js'
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
        const temperature = await setTemperature(line)
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

app.use(bodyParser.json())

app.post('/', async (req, res) => {
  const { prompt: _prompt } = req.body;
  const prompt = `Question: ${_prompt}
Instruction: Answer in one short sentence that informs about the question. Use a natural phrase like "Now in your room --- degrees" (or similar wording). Include the relevant number or fact in the sentence. No markdown, no quotes, no extra filler—only this one sentence.
Response: `
  const response = await sendMessage(prompt)
  sendToArduino(response.message.content)
  res.send(response.message.content)
})

app.get('/temperature', async (req, res) => {
  try{
    const {temperature, humidity, response} = await getTemperature()
    sendToArduino(`{"temperature": ${temperature}, "humidity": ${humidity}}`)
    res.send(response)
  }catch(e){
    console.error(e)
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