// Selectors
const boardComponentSelector = ".board";
const usernameComponentSelector = ".user-username-component";
const chatRoomComponentSelector = ".chat-room-component";
const chatInputComponentSelector = ".chat-input-chat-wrapper";

// uses mutation observer to look for an element
const waitForElement = async (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector))
      return resolve(document.querySelector(selector));
    const observer = new MutationObserver((mutationsList, observer) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

const waitForOpponent = async (fn) => {
  return new Promise((resolve) => {
    let prevGame = "";
    return resolve(() => {
      const re = new RegExp("https://www.chess.com/game/[0-9]*$");
      return new Promise((resolve) => {
        if (
          (re.test(document.URL)) && 
          (document.URL !== prevGame) && 
          (document.querySelector(usernameComponentSelector).innerText !== "Opponent")) {
          prevGame = document.URL;
          return resolve();
        }
        const observer = new MutationObserver((mutationsList, observer) => {
          if (
            (re.test(document.URL)) &&
            (document.URL !== prevGame) &&
            (document.querySelector(usernameComponentSelector).innerText !== "Opponent")
          ) {
            prevGame = document.URL;
            observer.disconnect();
            return resolve();
          }
        });
        observer.observe(document.body, {childList: true, subtree: true})
      });
    });
  });
};

// creates a modal that covers the chat
const createChatModal = () => {
  const chatModal = document.createElement("div");
  chatModal.style.backgroundColor = "rgb(48, 46, 43)";
  chatModal.style.inset = 0;
  chatModal.style.inlineSize = "100%";
  chatModal.style.blockSize = "100%";
  chatModal.style.position = "absolute";
  chatModal.style.zIndex = 2;
  chatModal.style.display = "flex";
  chatModal.style.alignItems = "center";
  chatModal.style.justifyContent = "center";
  return chatModal;
};

// creates a 'return chat back' button
const createReturnChatButton = (chatModal) => {
  const returnChatButton = document.createElement("button");
  returnChatButton.style.backgroundColor = "rgb(255 255 255 / 0.08)";
  returnChatButton.style.fontFamily = "Segoe UI, sans-serif";
  returnChatButton.style.color = "rgb(255 255 255 / 0.72)";
  returnChatButton.style.position = "relative";
  returnChatButton.style.zIndex = 3;
  returnChatButton.innerText = "Show chat";
  returnChatButton.style.border = "none";
  returnChatButton.style.fontWeight = "bold";
  returnChatButton.style.fontSize = "15px";
  returnChatButton.style.padding = "9px 12px";
  returnChatButton.style.borderRadius = "5px";
  returnChatButton.style.cursor = "pointer";
  returnChatButton.addEventListener("click", (event) => {
    chatModal.remove();
  });
  returnChatButton.addEventListener("mouseover", (event) => {
    returnChatButton.style.backgroundColor = "rgb(255 255 255 / 0.16)";
  });
  returnChatButton.addEventListener("mouseleave", (event) => {
    returnChatButton.style.backgroundColor = "rgb(255 255 255 / 0.08)";
  });
  return returnChatButton;
};

// creates 'hide chat' button
// it takes the 'close chat' function as a parameter
const createHideChatButton = (fn) => {
  const hideChatButton = document.createElement("button");
  hideChatButton.style.backgroundColor = "rgb(255 255 255 / 0.08)";
  hideChatButton.style.fontFamily = "Segoe UI, sans-serif";
  hideChatButton.style.color = "rgb(255 255 255 / 0.72)";
  hideChatButton.style.position = "absolute";
  hideChatButton.style.insetInlineEnd = "35px";
  hideChatButton.style.insetBlockStart = "10px";
  hideChatButton.style.zIndex = 2;
  hideChatButton.innerText = "Hide chat";
  hideChatButton.style.border = "none";
  hideChatButton.style.fontWeight = "bold";
  hideChatButton.style.fontSize = "10px";
  hideChatButton.style.borderRadius = "5px";
  hideChatButton.style.cursor = "pointer";
  hideChatButton.addEventListener("mouseover", (event) => {
    hideChatButton.style.backgroundColor = "rgb(255 255 255 / 0.16)";
  });
  hideChatButton.addEventListener("mouseleave", (event) => {
    hideChatButton.style.backgroundColor = "rgb(255 255 255 / 0.08)";
  });
  hideChatButton.addEventListener("click", (event) => {
    fn();
  });
  return hideChatButton;
};

// creates a modal block that closes the chat
// it can be removed and brought back via returnChat and hideChat buttons
const closeChat = async () => {
  return new Promise((resolve) => {
    const chatComponent = document.querySelector(chatRoomComponentSelector);
    const chatInputComponent = document.querySelector(
      chatInputComponentSelector
    );
    const chatModal = createChatModal();
    const returnChatButton = createReturnChatButton(chatModal);
    const hideChatButton = createHideChatButton(closeChat);
    chatInputComponent.appendChild(hideChatButton);
    chatComponent.appendChild(chatModal);
    chatModal.appendChild(returnChatButton);
    resolve();
  });
};

const waitForChatToRefresh = async() => {
  return new Promise(resolve => {
    const observer = new MutationObserver((mutationsList, observer) => {
      if (document.querySelector(chatRoomComponentSelector) === null) {
        observer.disconnect();
        return resolve();
      }
    })
    observer.observe(document.body, {childList: true, subtree: true});
  })
}

// this recursive function waits for a new match, applies changes and then fires itself again
const newMatch = (opponentWaiter) => {
  opponentWaiter()
    .then((res) => waitForElement(chatRoomComponentSelector))
    .then((res) => closeChat())
    .then((res) => waitForChatToRefresh())
    .then((res) => newMatch(opponentWaiter));
};

// we wait until user starts a new game and a game board appears
const main = async () => {
  waitForElement(boardComponentSelector)
  .then((res) => waitForOpponent())
  .then((opponentWaiter) => newMatch(opponentWaiter))
};

// Entry point
main();
