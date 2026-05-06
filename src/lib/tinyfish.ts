const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const TINYFISH_API_URL = 'https://api.tinyfish.ai/v1';

export async function fetchContent(url: string): Promise<string> {
    if (!TINYFISH_API_KEY) {
        throw new Error('TINYFISH_API_KEY is not configured');
    }

    try {
        const response = await fetch(`${TINYFISH_API_URL}/fetch_content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TINYFISH_API_KEY}`,
            },
            body: JSON.stringify({
                url,
                max_length: 10000, // Limit response size
            }),
        });

        if (!response.ok) {
            throw new Error(`TinyFish API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract the markdown content from response
        if (data.content) {
            return data.content;
        } else if (data.text) {
            return data.text;
        } else {
            throw new Error('Unexpected response format from TinyFish');
        }
    } catch (error) {
        console.error('TinyFish fetch error:', error);
        throw error;
    }
}
