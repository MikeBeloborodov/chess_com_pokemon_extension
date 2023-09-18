class WrongWebsiteError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WrongWebsiteError';
  }
}

function set_zen_mode() {
  try {
    if (!document.URL.includes("chess.com"))
      throw new WrongWebsiteError("This website is not chess.com");

    // find chat
    const chat = document.getElementsByClassName("chat-room-component")[0];

    // create zen mode modal to hide chat
    const zen_modal = document.createElement('div');

    // add some styles
    chat.style.position = 'relative';
    zen_modal.style.backgroundColor = 'black';
    zen_modal.style.inset = 0;
    zen_modal.style.inlineSize = '100%';
    zen_modal.style.blockSize = '100%';
    zen_modal.style.position = 'absolute';
    zen_modal.style.zIndex = 2;

    // append modal
    chat.appendChild(zen_modal);
  } catch (error) {
    console.log(error);
  }
}

setTimeout(set_zen_mode, 1000);