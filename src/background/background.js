import { fetchWikipediaSnippet } from './wikipedia_api.js';
import { summarizeSnippet } from './summarizer.js';

const RATE_LIMIT_INTERVAL = 5000; // 5 seconds
let lastRequestTime = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "summarizeKeyword") {
    handleSummarizeKeyword(message.keyword);
  }
});

async function handleSummarizeKeyword(keyword) {
  const currentTime = Date.now();
  if (currentTime - lastRequestTime < RATE_LIMIT_INTERVAL) {
    sendErrorMessage(keyword, "Please wait a few seconds before making another request.");
    return;
  }
  lastRequestTime = currentTime;

  try {
    const summary = await summarizeWikipediaArticle(keyword);
    chrome.runtime.sendMessage({ action: "showSummary", keyword, summary });
  } catch (error) {
    console.error("Error summarizing keyword:", error);
    sendErrorMessage(keyword, "Failed to summarize keyword. Please try again later.");
  }
}

async function summarizeWikipediaArticle(keyword) {
  const snippet = await fetchWikipediaSnippet(keyword);
  if (!snippet) {
    throw new Error("No Wikipedia snippet found for the keyword.");
  }
  return await summarizeSnippet(snippet);
}

function sendErrorMessage(keyword, errorMessage) {
  chrome.runtime.sendMessage({ action: "showSummary", keyword, error: errorMessage });
}

console.log("Background script loaded");