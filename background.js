chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {
      console.log('Tab updated:', tab.url);
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }, () => {
        console.log('Content script injected');
      });
    }
  });
});

const openedTabs = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  const currentTime = Date.now();

  if (message.links && Array.isArray(message.links)) {
    message.links.forEach(url => {
      if (!url.includes('solscan.io') && !url.includes('pump.fun') && !url.includes('dexscreener.com')) {
        chrome.tabs.query({}, (tabs) => {
          const tabExists = tabs.some(tab => tab.url === url);
          if (!tabExists && !openedTabs.has(url)) {
            console.log('Opening link:', url);
            chrome.tabs.create({ url, active: false }, (newTab) => {
              console.log('Tab created:', newTab);
              openedTabs.set(url, newTab.id);
              chrome.scripting.executeScript({
                target: { tabId: newTab.id },
                files: ['content.js']
              }, () => {
                console.log('Content script injected into new tab');
              });
            });
          } else {
            console.log('Tab already open:', url);
          }
        });
      } else {
        console.log('Excluded link:', url);
      }
    });

    // Open the additional link in Google Lens
    const additionalLink = message.additionalLink;
    if (additionalLink) {
      const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(additionalLink)}`;
      chrome.tabs.query({}, (tabs) => {
        const tabExists = tabs.some(tab => tab.url === googleLensUrl);
        if (!tabExists && !openedTabs.has(googleLensUrl)) {
          console.log('Opening additional link in Google Lens:', googleLensUrl);
          chrome.tabs.create({ url: googleLensUrl, active: false }, (newTab) => {
            console.log('Additional tab created:', newTab);
            openedTabs.set(googleLensUrl, newTab.id);
            chrome.scripting.executeScript({
              target: { tabId: newTab.id },
              files: ['content.js']
            }, () => {
              console.log('Content script injected into additional tab');
            });
          });
        } else {
          console.log('Additional tab already open:', googleLensUrl);
        }
      });
    }

    // Send the links back to the popup
    chrome.runtime.sendMessage({ links: message.links });
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  for (const [url, id] of openedTabs.entries()) {
    if (id === tabId) {
      openedTabs.delete(url);
      console.log('Tab closed, removed link from openedTabs:', url);
      break;
    }
  }
});