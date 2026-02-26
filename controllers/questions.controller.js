import sendMessage from '../model/llama.js';

export const getQuestion = async (line) => {
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
    return response.message.content;
}