const axios = require('axios');

/**
 * Extracts structured metadata (dates, signatories, clauses) from document text using OpenAI.
 * @param {string} text - The document text to analyze.
 * @returns {Promise<Object>} - Extracted metadata as JSON.
 */
async function extractMetadata(text) {
  // Compose a prompt for OpenAI to extract metadata
  const prompt = `Extract the following structured metadata from the document text below:
- All dates (as ISO format if possible)
- All signatories (names of people or organizations signing the document)
- All clauses (title and text for each clause, if present)

Return the result as a JSON object with keys: dates (array), signatories (array), clauses (array of {title, text}).

Document text:
"""
${text}
"""`;

  // Call OpenAI API (GPT-3.5/4)
  const apiKey = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert legal document parser.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Try to parse the model's response as JSON
    const content = response.data.choices[0].message.content;
    let metadata;
    try {
      metadata = JSON.parse(content);
    } catch (e) {
      // If not valid JSON, return as text
      metadata = { raw: content };
    }
    return metadata;
  } catch (error) {
    console.error(
      'OpenAI API error:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Failed to extract metadata from OpenAI');
  }
}

module.exports = {
  extractMetadata,
};
