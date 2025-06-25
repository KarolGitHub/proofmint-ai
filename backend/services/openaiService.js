const axios = require('axios');

/**
 * Extracts structured metadata (dates, signatories, clauses) from document text using OpenAI or local model.
 * @param {string} text - The document text to analyze.
 * @param {string} provider - 'openai' or 'local'.
 * @param {string} language - Language code (e.g., 'en', 'es').
 * @returns {Promise<Object>} - Extracted metadata as JSON.
 */
async function extractMetadata(text, provider = 'openai', language = 'en') {
  if (provider === 'local') {
    // Placeholder for local AI model logic
    return {
      message:
        'Local AI processing is not yet implemented. Please use provider: "openai".',
    };
  }
  // Compose a prompt for OpenAI to extract metadata
  const prompt = `Extract the following structured metadata from the document text below:
- All dates (as ISO format if possible)
- All signatories (names of people or organizations signing the document)
- All clauses (title and text for each clause, if present)

The document is in language: ${language}. Return the result as a JSON object with keys: dates (array), signatories (array), clauses (array of {title, text}).

Document text:
"""
${text}
"""`;

  // Call OpenAI API (GPT-3.5/4)
  const apiKey = process.env.OPENAI_API_KEY || '';
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

/**
 * Extracts all clauses (title and text) from document text using OpenAI or local model.
 * @param {string} text - The document text to analyze.
 * @param {string} provider - 'openai' or 'local'.
 * @param {string} language - Language code (e.g., 'en', 'es').
 * @returns {Promise<Object>} - Extracted clauses as JSON.
 */
async function extractClauses(text, provider = 'openai', language = 'en') {
  if (provider === 'local') {
    return {
      message:
        'Local AI processing is not yet implemented. Please use provider: "openai".',
    };
  }
  const prompt = `Extract all clauses from the following document text. For each clause, return its title (if present) and the full text of the clause. The document is in language: ${language}. Return the result as a JSON array of objects with keys: title, text.

Document text:
"""
${text}
"""`;

  const apiKey = process.env.OPENAI_API_KEY || '';
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
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    let clauses;
    try {
      clauses = JSON.parse(content);
    } catch (e) {
      clauses = { raw: content };
    }
    return clauses;
  } catch (error) {
    console.error(
      'OpenAI API error:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Failed to extract clauses from OpenAI');
  }
}

/**
 * Classifies the type of document using OpenAI or local model.
 * @param {string} text - The document text to analyze.
 * @param {string} provider - 'openai' or 'local'.
 * @param {string} language - Language code (e.g., 'en', 'es').
 * @returns {Promise<Object>} - Document type classification as JSON.
 */
async function classifyDocumentType(
  text,
  provider = 'openai',
  language = 'en'
) {
  if (provider === 'local') {
    return {
      message:
        'Local AI processing is not yet implemented. Please use provider: "openai".',
    };
  }
  const prompt = `Classify the type of the following document. Possible types include: contract, invoice, NDA, receipt, letter, agreement, or other. The document is in language: ${language}. Return the result as a JSON object with a single key 'type' and a short explanation as 'reason'.

Document text:
"""
${text}
"""`;

  const apiKey = process.env.OPENAI_API_KEY || '';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert legal document classifier.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    let docType;
    try {
      docType = JSON.parse(content);
    } catch (e) {
      docType = { raw: content };
    }
    return docType;
  } catch (error) {
    console.error(
      'OpenAI API error:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Failed to classify document type with OpenAI');
  }
}

module.exports = {
  extractMetadata,
  extractClauses,
  classifyDocumentType,
};
