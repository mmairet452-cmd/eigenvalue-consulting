export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_KEY;
  if (!resendKey) return res.status(500).json({ error: 'RESEND_KEY not configured' });

  const { name, email, company, service, message } = req.body;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'website@eigenvalueconsulting.com',
        to: 'max@maxeconsulting.com',
        reply_to: email,
        subject: `New inquiry: ${name} — ${service}`,
        html: `
          <h2 style="color:#0F2318;font-family:Georgia,serif">New inquiry from eigenvalueconsulting.com</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> <a href="mailto:${email}">${email}</a></p>
          <p><b>Company:</b> ${company}</p>
          <p><b>Service:</b> ${service}</p>
          <p><b>Message:</b><br>${message}</p>
          <hr/>
          <p style="color:#6B6B6B;font-size:12px">Sent from eigenvalueconsulting.com contact form</p>
        `
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
