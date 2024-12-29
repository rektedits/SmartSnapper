if (window.location.href === 'https://neo.bullx.io/') {
  window.addEventListener('load', () => {
    console.log('Content script loaded for open socials');

    const fetchLinks = () => {
      const elements = document.querySelectorAll('.flex.flex-row.items-center.order-1.md\\:order-2 a');
      const links = Array.from(elements)
        .map(el => el.href)
        .filter(href => !href.includes('solscan.io') && !href.includes('pump.fun') && !href.includes('dexscreener.com'));
      console.log('Links found:', links);
      chrome.runtime.sendMessage({ links });
    };

    // Fetch links once when the page loads
    fetchLinks();
  });
}
