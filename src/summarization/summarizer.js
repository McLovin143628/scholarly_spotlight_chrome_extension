let summarizer;

async function initializeSummarizer() {
  if (!summarizer) {
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.5.0/dist/transformers.min.js');
    summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
  }
}

export async function summarizeSnippet(snippet) {
  try {
    await initializeSummarizer();
    const preparedSnippet = prepareSnippet(snippet);

    const summary = await summarizer(preparedSnippet, {
      max_length: 150,
      min_length: 40,
      do_sample: false,
    });

    return summary[0].summary_text;
  } catch (error) {
    console.error("Error in summarizeSnippet:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}

function prepareSnippet(snippet) {
  const cleanedSnippet = stripHtmlTags(snippet);
  return cleanedSnippet.substring(0, 1000); // Limit input length
}

function stripHtmlTags(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

console.log("Summarizer module loaded");