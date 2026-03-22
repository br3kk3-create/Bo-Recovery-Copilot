export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');

    const call = (userMessage) =>
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: body.system,
          messages: [{ role: 'user', content: userMessage }],
        }),
      }).then(r => r.json());

    // Run all 3 AI calls in parallel
    const [briefData, researchData, docData] = await Promise.all([
      call(body.briefPrompt),
      call(body.researchPrompt),
      call(body.docPrompt),
    ]);

    return new Response(JSON.stringify({ briefData, researchData, docData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/.netlify/functions/chat' };
