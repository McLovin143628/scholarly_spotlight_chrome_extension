let currentKeyword = '';
const summaryCache = {};

document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn.addEventListener('click', handleRefresh);
  
  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, {action: "getSelectedText"}, handleSelectedText);
  });
});

function handleRefresh() {
  if (currentKeyword) {
    showLoading();
    chrome.runtime.sendMessage({ action: "summarizeKeyword", keyword: currentKeyword });
  }
}

function handleSelectedText(response) {
  if (response && response.selectedText) {
    currentKeyword = response.selectedText;
    if (summaryCache[currentKeyword]) {
      updateUI(currentKeyword, summaryCache[currentKeyword]);
    } else {
      showLoading();
      chrome.runtime.sendMessage({ action: "summarizeKeyword", keyword: currentKeyword });
    }
  }
}

function showLoading() {
  document.getElementById('loading').hidden = false;
  document.getElementById('summary-content').textContent = '';
}

function hideLoading() {
  document.getElementById('loading').hidden = true;
}

function updateUI(keyword, summary) {
  document.getElementById("keyword").textContent = keyword;
  document.getElementById("summary-content").textContent = summary;
  hideLoading();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "showSummary") {
    const { keyword, summary, error } = message;
    currentKeyword = keyword;
    hideLoading();

    if (error) {
      updateUI(keyword, `Error: ${error}`);
    } else if (summary) {
      updateUI(keyword, summary);
      summaryCache[keyword] = summary;
    } else {
      updateUI(keyword, "No summary available.");
    }
  }
});