const { pipeline } = require("transformers");

async function summarizeSnippet(snippet) {
  // Pre-process snippet (if necessary)
  const preparedSnippet = prepareSnippet(snippet);

  // Load summarization model (adjust model name based on your choice)
  const summarizer = pipeline("summarization", model="facebook/bart-base");

  // Call summarization function with parameters
  const summary = await summarizer(preparedSnippet, {
    num_beams: 5, // Adjust beam search for better quality (optional)
    max_length: generateSummaryLength(), // Dynamic summary length
    min_length: 5, // Minimum summary length (5 sentences)
  });

  return summary[0]["generated_text"]; // Extract generated summary text
}

function prepareSnippet(snippet) {
  // Remove HTML tags (if necessary)
  const cleanedSnippet = stripHtmlTags(snippet);

  // Limit snippet length (if library has character limit)
  const maxLength = 500; // Adjust this value based on your library's limit (if any)
  const limitedSnippet = cleanedSnippet.substring(0, maxLength);

  return limitedSnippet;
}

// Function to strip HTML tags (replace with your preferred implementation)
function stripHtmlTags(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function generateSummaryLength() {
  // Generate random summary length between 5 and 10 (inclusive)
  return Math.floor(Math.random() * (10 - 5 + 1)) + 5;
}

// Example usage
async function main() {
  const snippet = "This is a snippet of text containing... It also discusses a concept that might be explained in more detail on a Wikipedia page.";
  const summary = await summarizeSnippet(snippet);
  console.log(summary);
}

main();
