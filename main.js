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

function createZenModal() {
  const zenModal = document.createElement('div');
  zenModal.style.backgroundColor = 'rgb(48, 46, 43)';
  zenModal.style.inset = 0;
  zenModal.style.inlineSize = '100%';
  zenModal.style.blockSize = '100%';
  zenModal.style.position = 'absolute';
  zenModal.style.zIndex = 2;
  zenModal.style.display = 'flex';
  zenModal.style.alignItems = 'center';
  zenModal.style.justifyContent = 'center';
  return zenModal;
}

function createReturnChatButton() {
  const chatButton = document.createElement('button');
  chatButton.style.backgroundColor = 'rgb(255 255 255 / 0.08)';
  chatButton.style.fontFamily = 'Segoe UI';
  chatButton.style.color = 'rgb(255 255 255 / 0.72)';
  chatButton.style.position = 'relative';
  chatButton.style.zIndex = 3;
  chatButton.innerText = 'Show chat';
  chatButton.style.border = 'none';
  chatButton.style.fontWeight = 'bold';
  chatButton.style.fontSize = '15px';
  chatButton.style.padding = '9px 12px'
  chatButton.style.borderRadius = '5px';
  return chatButton;
}

function applyZenMode(component) {
  try {
    const zenModal = createZenModal();
    const returnChatButton = createReturnChatButton();
    component.style.position = 'relative';
    zenModal.appendChild(returnChatButton);
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