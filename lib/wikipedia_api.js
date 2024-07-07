async function fetchWikipediaSnippet(keyword) {
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&exsentences=2&titles=${encodedKeyword}`;
  
    const response = await fetch(url);
    const data = await response.json();
  
    // Attempt to extract snippet from the first response
    let snippet = extractSnippetFromResponse(data);
  
    // Handle cases where the first page might not be relevant
    if (!snippet) {
      // Check for disambiguation suggestion in the initial response
      const disambiguatedTitle = getDisambiguationSuggestion(data);
      if (disambiguatedTitle) {
        const disambiguatedUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&exsentences=2&titles=${disambiguatedTitle}`;
  
        const disambiguatedResponse = await fetch(disambiguatedUrl);
        const disambiguatedData = await disambiguatedResponse.json();
  
        snippet = extractSnippetFromResponse(disambiguatedData);
      } else {
        // No disambiguation suggestion or initial fetch failed, consider broader search
        const broaderSearchQuery = broadenSearchQuery(keyword);
        const broaderSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&exsentences=2&titles=${broaderSearchQuery}`;
  
        const broaderSearchResponse = await fetch(broaderSearchUrl);
        const broaderSearchData = await broaderSearchResponse.json();
  
        snippet = extractSnippetFromResponse(broaderSearchData);
      }
    }
  
    return snippet;
  }
  
  function extractSnippetFromResponse(data) {
    const pages = data.query && data.query.pages;
    if (!pages) {
      return null; // No page found for the keyword
    }
  
    const pageId = Object.keys(pages)[0];
    const snippet = pages[pageId].extract;
  
    return snippet;
  }
  
  function getDisambiguationSuggestion(data) {
    const redirects = data.query && data.query.redirects;
    if (redirects && redirects.length > 0) {
      const from = redirects[0].from;
      return from.replace(/^([^:]*):/, ""); // Extract the disambiguated title
    }
    return null;
  }
  
  function broadenSearchQuery(keyword) {
    // Implement logic to broaden the search query (more sophisticated techniques)
    const parts = keyword.split(" ");
  
    // Option 1: Remove least frequent words (heuristic approach)
    if (parts.length > 1) {
      const wordCounts = {};
      for (const part of parts) {
        wordCounts[part] = (wordCounts[part] || 0) + 1;
      }
      const leastFrequentWord = Object.keys(wordCounts).reduce((a, b) =>
        wordCounts[a] < wordCounts[b] ? a : b
      );
      return parts.filter(part => part !== leastFrequentWord).join(" ");
    }
  
    // Option 2: Explore stemming or synonyms (using external libraries)
    // You can explore libraries like Natural available through npm (`npm install natural`)
    // for stemming or synonym expansion to broaden the search query.
  
    return keyword; // No changes if only one word or Option 1 fails
  }
  
  module.exports = { fetchWikipediaSnippet };
  