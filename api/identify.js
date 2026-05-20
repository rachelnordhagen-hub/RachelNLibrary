export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image in request body' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'No API key found' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            { type: 'text', text: `Identify this book cover. Respond ONLY with JSON, no markdown:\n{"title":"","author":"","genre":"Fiction","description":""}` }
          ]
        }]
      })
    });

    const data = await response.json();
    
    // Return everything so we can see what's happening
    return res.status(200).json({ 
      status: response.status,
      data: data 
    });

  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
