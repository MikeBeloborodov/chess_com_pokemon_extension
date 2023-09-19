const textChangeEvent = new Event("textChange")

function observeElementChange(selector, event) {
  return new Promise(resolve => {
    const observer = new MutationObserver(mutations => {
      document.querySelector(selector).dispatchEvent(event);
      observer.disconnect();
      return resolve();
    })
    observer.observe(document.querySelector(selector), {
      childList: true,
      subtree: true,
      attributes: true,
    });
  })
}

function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

function applyZenMode(component) {
  try {
    // create zen mode modal to hide chat
    const zenModal = document.createElement('div');

    // add some styles
    component.style.position = 'relative';
    zenModal.style.backgroundColor = 'rgb(48, 46, 43)';
    zenModal.style.inset = 0;
    zenModal.style.inlineSize = '100%';
    zenModal.style.blockSize = '100%';
    zenModal.style.position = 'absolute';
    zenModal.style.zIndex = 2;

    // append modal
    component.appendChild(zenModal);
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  if (!document.URL.includes("chess.com"))
    return;

  const chatComponent = await waitForElement('.chat-room-component');
  applyZenMode(chatComponent);
  const opponentNameComponent = await waitForElement('.user-tagline-username');
  observeElementChange('.user-tagline-username', textChangeEvent);
  opponentNameComponent.addEventListener("textChange", async () => {
    const chatComponent = await waitForElement('.chat-room-component');
    applyZenMode(chatComponent);
    observeElementChange('.user-tagline-username', textChangeEvent);
  })
}

main();