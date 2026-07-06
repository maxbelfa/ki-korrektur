// Vercel Serverless Function
// Nimmt die gleiche Anfrage entgegen, die das Frontend bisher direkt an
// https://api.anthropic.com/v1/messages geschickt hat, hängt aber den
// geheimen API-Key servseitig an. Der Key landet NIE im Browser-Code.
//
// Einrichtung:
// 1. Diese Datei unter dem Pfad  api/analyze.js  in eurem Projekt ablegen
//    (der Ordnername "api" ist Pflicht, Vercel erkennt ihn automatisch).
// 2. Bei Vercel unter Project Settings -> Environment Variables eine
//    Variable ANTHROPIC_API_KEY mit eurem echten Key aus console.anthropic.com anlegen.
// 3. Neu deployen.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Nur POST-Anfragen erlaubt.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'ANTHROPIC_API_KEY ist auf dem Server nicht gesetzt. In den Vercel-Projekteinstellungen unter Environment Variables anlegen und neu deployen.'
    });
    return;
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Aufruf der Anthropic-API: ' + err.message });
  }
}
