module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
          const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
          if (!response.ok) return res.status(response.status).json({ error: `Failed: ${response.status}` });
          const html = await response.text();
          const result = { asin: extractAsin(url), title: '', brand: '', packageType: '', mainImageUrl: '', price: '', success: false };
          const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
          if (titleMatch) result.title = titleMatch[1];
          const brandMatch = html.match(/data-brand-name="([^"]+)"/);
          if (brandMatch) result.brand = brandMatch[1];
          else { const m = result.title.match(/^([^-]+?)\s[-–]/); if (m) result.brand = m[1].trim(); }
          const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
          if (imageMatch) result.mainImageUrl = imageMatch[1];
          const priceMatch = html.match(/\$(\d+\.\d{2})/);
          if (priceMatch) result.price = `$${priceMatch[1]}`;
          const pkgKeywords = ['pouch','bottle','box','jar','pack','case','bag','container','can'];
          for (const kw of pkgKeywords) if (result.title.toLowerCase().includes(kw)) { result.packageType = kw.charAt(0).toUpperCase() + kw.slice(1); break; }
          result.success = !!result.title;
          res.status(200).json(result);
    } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'Scrape failed', details: error.message });
    }
};
function extractAsin(url) {
    const patterns = [/\/dp\/([A-Z0-9]{10})/, /\/product\/([A-Z0-9]{10})/, /\/gp\/product\/([A-Z0-9]{10})/];
    for (const p of patterns) { const m = url.match(p); if (m && m[1]) return m[1]; }
    return 'unknown';
}
