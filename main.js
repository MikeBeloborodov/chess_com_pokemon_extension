class WrongWebsiteError extends Error {
  constructor(message) {
    super(message);
    this.name = 'WrongWebsiteError';
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait_for_component() {
  let chat;
  for (let i = 0; i < 10; i++) {
    console.log("waiting");
    await sleep(1000);
    try {
      // find chat
      chat = document.getElementsByClassName("chat-room-component")[0];
    } catch (error) {
      console.log(error);
    }
  }
  return new Promise(resolve => {
    resolve(chat);
  });
}

function set_zen_mode(chat_component) {
  try {
    if (!document.URL.includes("chess.com"))
      throw new WrongWebsiteError("This website is not chess.com");

    // create zen mode modal to hide chat
    const zen_modal = document.createElement('div');

    // add some styles
    chat_component.style.position = 'relative';
    zen_modal.style.backgroundColor = 'black';
    zen_modal.style.inset = 0;
    zen_modal.style.inlineSize = '100%';
    zen_modal.style.blockSize = '100%';
    zen_modal.style.position = 'absolute';
    zen_modal.style.zIndex = 2;

    // append modal
    chat_component.appendChild(zen_modal);
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  const chat_component = await wait_for_component();
  set_zen_mode(chat_component);
}

main()