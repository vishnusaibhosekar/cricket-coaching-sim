const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;

export async function fetchContent(url: string): Promise<string> {
    if (!TINYFISH_API_KEY) {
        throw new Error('TINYFISH_API_KEY is not configured');
    }

    try {
        const response = await fetch('https://api.fetch.tinyfish.ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': TINYFISH_API_KEY,
            },
            body: JSON.stringify({
                urls: [url],
            }),
        });

        if (!response.ok) {
            throw new Error(`TinyFish API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract the markdown content from results array
        if (data.results && data.results.length > 0) {
            return data.results[0].text || data.results[0].content || '';
        } else if (data.errors && data.errors.length > 0) {
            throw new Error(`TinyFish errors: ${JSON.stringify(data.errors)}`);
        } else {
            throw new Error('Unexpected response format from TinyFish');
        }
    } catch (error) {
        console.error('TinyFish fetch error:', error);
        throw error;
    }
}
