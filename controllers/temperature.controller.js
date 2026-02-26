import sendMessage from '../model/llama.js';

export const getTemperature = async (line) => {
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
    return response.message.content;
}