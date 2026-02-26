import ollama from 'ollama'
import express from 'express'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import bodyParser from 'body-parser'
import sendMessage from './model/llama.js'
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
        const data = JSON.parse(line)
        console.log('Temperature:', data)
        const prompt =  `
        Question: The temperature is ${data.temperature} degrees Celsius.
        Instruction: REMEMBER the temperature and give response only with one word "REMEMBERED". 
        Constraint: No conversational filler, no markdown, no quotes
        Response:
      `
        const response = await sendMessage(prompt)
        console.log(response.message.content)
        return
      }
      const data = JSON.parse(line)
      console.log('Sensors:', data)
      const prompt =  `
        Question: ${data.question}
        Instruction: Output the exact phrase "LED_TRUE_ON"(if question is true) or "LED_FALSE_ON"(if question is false) and nothing else. 
        Constraint: No conversational filler, no markdown, no quotes
        Response:
      `
      const response = await sendMessage(prompt)
      console.log(response.message.content)
      sendToArduino(response.message.content)
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
  const { prompt } = req.body;
  const response = await sendMessage(prompt)
  console.log(response.message.content)
  sendToArduino(response.message.content)
  res.send(response.message.content)
})

app.post('/gate', (req, res) => {
  activateSensorGate(5000)
  res.send('Sensor gate active for 5 seconds')
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})