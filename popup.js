document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM content loaded');
  
  const fetchLinkButton = document.getElementById('fetch-link-button');
  const openSocialsButton = document.getElementById('open-socials-button');
  const checkXReuseButton = document.getElementById('check-x-reuse-button');
  const linksContainer = document.getElementById('links-container');
  const messageContainer = document.getElementById('message-container');
  const buyMeACoffeeLabel = document.getElementById('buy-me-a-coffee');


  const displayLinks = (links) => {
    linksContainer.innerHTML = '';
    const xComLinks = [...new Set(links.filter(link => link.startsWith('https://x.com/') || link.startsWith('https://twitter.com/')))]; // Remove duplicates
    if (xComLinks.length > 0) {
      xComLinks.forEach(link => {
        const linkElement = document.createElement('div');
        let displayLink = link.replace('https://x.com/', '').replace('https://twitter.com/', '');
        if (displayLink.includes('/')) {
          displayLink = displayLink.split('/')[0];
        }
        if (displayLink.includes('?')) {
          displayLink = displayLink.split('?')[0];
        }
        linkElement.textContent = displayLink;
        linksContainer.appendChild(linkElement);

        // Copy the displayed link to the clipboard
        navigator.clipboard.writeText(displayLink).then(() => {
          console.log(`Copied to clipboard: ${displayLink}`);
          messageContainer.style.color = 'green';
          messageContainer.textContent = `Twitter username "${displayLink}" copied successfully!`;
        }).catch(err => {
          console.error('Failed to copy to clipboard:', err);
        });
      });
    } else {
      messageContainer.style.color = 'red';
      messageContainer.textContent = 'Twitter account not found.';
    }
  };

  const copyXComLink = () => {
    const xComLinks = Array.from(linksContainer.children).map(child => child.textContent);
    if (xComLinks.length > 0) {
      const displayLink = xComLinks[0];
      const formattedLink = `/twitter-reuse username:${displayLink}`;
      navigator.clipboard.writeText(formattedLink).then(() => {
        console.log(`Copied to clipboard: ${formattedLink}`);
        messageContainer.style.color = 'green';
        messageContainer.textContent = `Twitter username "${displayLink}" copied successfully!`;
        // Check if the link is already open in the browser
        const discordUrl = 'https://discord.com/channels/1300596057037606922/1309573245959147591';
        chrome.windows.getAll({ populate: true }, (windows) => {
          let tabFound = false;
          for (const window of windows) {
            for (const tab of window.tabs) {
              if (tab.url === discordUrl) {
                // Switch to the existing tab and bring its window to the front
                chrome.tabs.update(tab.id, { active: true });
                chrome.windows.update(window.id, { focused: true });
                tabFound = true;
                break;
              }
            }
            if (tabFound) break;
          }
          if (!tabFound) {
            // Open the specified link in a new tab
            chrome.tabs.create({ url: discordUrl });
          }
        });
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
      });
    } else {
      // Fetch links again if the container is empty
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const elements = document.querySelectorAll('.flex.flex-row.items-center.order-1.md\\:order-2 a');
            const links = Array.from(elements).map(el => el.href).filter(href => !href.includes('solscan.io') && !href.includes('pump.fun') && !href.includes('dexscreener.com'));
            const imageElement = document.querySelector('img[src*="image.bullx.io"]');
            const additionalLink = imageElement ? imageElement.src : null;
            return { links, additionalLink };
          }
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const { links } = results[0].result;
            displayLinks(links);
            if (links.length > 0) {
              const displayLink = links[0].replace('https://x.com/', '').replace('https://twitter.com/', '').split('/')[0].split('?')[0];
              const formattedLink = `/twitter-reuse username:${displayLink}`;
              navigator.clipboard.writeText(formattedLink).then(() => {
                console.log(`Copied to clipboard: ${formattedLink}`);
                messageContainer.style.color = 'green';
                messageContainer.textContent = `Twitter username "${displayLink}" copied successfully!`;
                // Check if the link is already open in the browser
                const discordUrl = 'https://discord.com/channels/1300596057037606922/1309573245959147591';
                chrome.windows.getAll({ populate: true }, (windows) => {
                  let tabFound = false;
                  for (const window of windows) {
                    for (const tab of window.tabs) {
                      if (tab.url === discordUrl) {
                        // Switch to the existing tab and bring its window to the front
                        chrome.tabs.update(tab.id, { active: true });
                        chrome.windows.update(window.id, { focused: true });
                        tabFound = true;
                        break;
                      }
                    }
                    if (tabFound) break;
                  }
                  if (!tabFound) {
                    // Open the specified link in a new tab
                    chrome.tabs.create({ url: discordUrl });
                  }
                });
              }).catch(err => {
                console.error('Failed to copy to clipboard:', err);
              });
            } else {
              messageContainer.style.color = 'red';
              messageContainer.textContent = 'Twitter account not found.';
            }
          }
        });
      });
    }
  };

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.links) {
      displayLinks(message.links);
    }
  });

  if (fetchLinkButton) {
    console.log('Fetch Link button found');
    fetchLinkButton.addEventListener('click', () => {
      console.log('Fetch Link button clicked');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('Active tab:', tabs[0]);
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const elements = document.querySelectorAll('.flex.flex-row.items-center.order-1.md\\:order-2 a');
            const links = Array.from(elements).map(el => el.href).filter(href => !href.includes('solscan.io') && !href.includes('pump.fun') && !href.includes('dexscreener.com'));
            const imageElement = document.querySelector('img[src*="image.bullx.io"]');
            const additionalLink = imageElement ? imageElement.src : null;
            console.log('Links found:', links);
            chrome.runtime.sendMessage({ links, additionalLink });
          }
        }, (results) => {
          console.log('Script executed', results);
        });
      });
    });
  } else {
    console.log('Fetch Link button not found');
  }

  if (openSocialsButton) {
    console.log('Open Socials button found');
    openSocialsButton.addEventListener('click', () => {
      console.log('Open Socials button clicked');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log('Active tab:', tabs[0]);
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const elements = document.querySelectorAll('.flex.flex-row.items-center.order-1.md\\:order-2 a');
            const links = Array.from(elements).map(el => el.href).filter(href => !href.includes('solscan.io') && !href.includes('pump.fun') && !href.includes('dexscreener.com'));
            const imageElement = document.querySelector('img[src*="image.bullx.io"]');
            const additionalLink = imageElement ? imageElement.src : null;
            console.log('Links found:', links);
            chrome.runtime.sendMessage({ links, additionalLink });
          }
        }, (results) => {
          console.log('Script executed', results);
        });
      });
    });
  } else {
    console.log('Open Socials button not found');
  }

  if (checkXReuseButton) {
    console.log('Check X Reuse button found');
    checkXReuseButton.addEventListener('click', () => {
      console.log('Check X Reuse button clicked');
      copyXComLink();
    });
  } else {
    console.log('Check X Reuse button not found');
  }

  if (buyMeACoffeeLabel) {
    buyMeACoffeeLabel.addEventListener('click', () => {
      navigator.clipboard.writeText('4dBQDFhqu5PLWNxxnshtkJAxqWxpGvsHzLhDYwEUoDiV').then(() => {
        console.log('SOLANA Wallet-Address copied to clipboard!');
        messageContainer.style.color = 'green';
        messageContainer.textContent = 'SOLANA Wallet-Address copied to clipboard!';
        setTimeout(() => {
          messageContainer.textContent = '';
        }, 5000); // Hide the message after 5 seconds
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
      });
    });
  }
});