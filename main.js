const waitForElement = async(selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver((mutationsList, observer) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
      }
    })

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    })
  })
}

async function main() {
  const element = await waitForElement('.player-top');
  const playerTopComponent = document.querySelector('.player-top');
  const newAvatar = document.createElement('div');
  newAvatar.style.position = 'absolute';
  newAvatar.style.backgroundColor = 'red';
  newAvatar.style.inlineSize = '40px';
  newAvatar.style.blockSize = '40px';
  newAvatar.style.zIndex = 2;
  playerTopComponent.style.position = 'relative';
  playerTopComponent.appendChild(newAvatar)
}

main();