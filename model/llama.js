export default const sendMessage = async (prompt) => {
    try {
        const response = await ollama.chat({
            model: 'llama3.1:8b',
            messages: [{role: 'user', 
                content: prompt
            }],
        })

        return response;
    }catch(err){
        console.error(err);
    }
}