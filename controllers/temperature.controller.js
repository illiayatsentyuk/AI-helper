import sendMessage from '../model/llama.js';

export const setTemperature = async (line) => {
    const data = JSON.parse(line)
        const prompt =  `
        Question: The temperature is ${data.temperature} degrees Celsius and the humidity is ${data.humidity}%.
        Instruction: REMEMBER the temperature and humidity and give response only with one word "REMEMBERED". 
        Constraint: No conversational filler, no markdown, no quotes
        Response:
      `
    const response = await sendMessage(prompt)
    return response.message.content;
}

export const getTemperature = async () => {
    const prompt = `
    Question: What is the temperature and humidity?
    Instruction: Output the exact phrase "<temperature>,<humidity>" and nothing else. If you don't know the temperature and humidity, output "0,0". 
    Do not any other text or punctuation. Do not use any other words or phrases.
    Constraint: No conversational filler, no markdown, no quotes
    Response:
    `
    const response = await sendMessage(prompt)
    const temperature = response.message.content.split(',')[0].trim()
    const humidity = response.message.content.split(',')[1].trim()
    return {temperature: temperature, humidity: humidity, response: response.message.content};
}