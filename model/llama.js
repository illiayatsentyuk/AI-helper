import ollama from 'ollama'
const messages = []


export default async function sendMessage(prompt) {
    try {
        messages.push({role: 'user', content: prompt})
        const response = await ollama.chat({
            model: 'llama3.1:8b',
            messages: messages,
        })
        messages.push({role: 'assistant', content: response.message.content})
        console.log(`LLM response: ${response.message.content}`)
        return response;
    }catch(err){
        console.error(err);
    }
}