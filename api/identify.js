export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
          { type: 'text', text: `Identify this book cover. Respond ONLY with JSON, no markdown:\n{"title":"","author":"","genre":"one of: Fiction, Non-Fiction, Fantasy, Sci-Fi, Mystery, Thriller, Romance, Historical, Biography, Self-Help, Children, Young Adult, Horror, Literary Fiction, Poetry, Romantasy, Other","description":"2-3 sentence description if you recognize the book, otherwise empty string"}` }
        ]}]
      })
    });

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '{}';
    return res.status(200).json(JSON.parse(text.replace(/```json|```/g, '').trim()));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
