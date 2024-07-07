let lastSelection = '';

document.addEventListener("selectionchange", () => {
  lastSelection = window.getSelection().toString().trim();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getSelectedText") {
    sendResponse({ selectedText: lastSelection });
  } else if (message.action === "highlightKeyword") {
    highlightKeyword(message.keyword);
  }
});

function highlightKeyword(keyword) {
  const regex = new RegExp(keyword, 'gi');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodesToHighlight = [];

  while (walker.nextNode()) {
    if (regex.test(walker.currentNode.textContent)) {
      nodesToHighlight.push(walker.currentNode);
    }
  }

  nodesToHighlight.forEach(node => {
    const highlightedNode = document.createElement('mark');
    highlightedNode.innerHTML = node.textContent.replace(regex, match => `<span class="wikipedia-summarizer-highlight">${match}</span>`);
    node.parentNode.replaceChild(highlightedNode, node);
  });
}

// Add a style for the highlight
const style = document.createElement('style');
style.textContent = `.wikipedia-summarizer-highlight { background-color: yellow; }`;
document.head.appendChild(style);

console.log("Content script loaded");