
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;
  const token = process.env.GITHUB_TOKEN;   // stored safely in Vercel, never visible

  const fileRes = await fetch('https://api.github.com/repos/Mejor-Vida/Mejor-Vida-HTML/contents/index.html', {
    headers: { Authorization: `token ${token}` }
  });
  const fileData = await fileRes.json();
  const sha = fileData.sha;

  await fetch('https://api.github.com/repos/Mejor-Vida/Mejor-Vida-HTML/contents/index.html', {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'AI update',
      content: btoa(unescape(encodeURIComponent(code))),
      sha
    })
  });

  res.status(200).json({ success: true });
}

export const config = { api: { bodyParser: true } };
