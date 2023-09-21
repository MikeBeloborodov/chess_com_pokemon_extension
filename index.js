// Events
const textChangeEvent = new Event("textChange");

// Selectors
const chatRoomComponentSelector = ".chat-room-component";
const usernameComponentSelector = ".player-top .user-tagline-username";
const chatInputComponentSelector = ".chat-input-chat-wrapper";
const userAvatarSelector = ".player-avatar img";
const sidebarComponentSelector = ".sidebar-component";

// Pokemon API base URL
const pokeApiUrl = "https://pokeapi.co/api/v2/pokemon/";

// Functions
function observeElementChange(selector, event) {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
      document.querySelector(selector).dispatchEvent(event);
      observer.disconnect();
      return resolve();
    });
    observer.observe(document.querySelector(selector), {
      childList: true,
      subtree: true,
      attributes: true,
    });
  });
}

function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function createZenModal() {
  const zenModal = document.createElement("div");
  zenModal.style.backgroundColor = "rgb(48, 46, 43)";
  zenModal.style.inset = 0;
  zenModal.style.inlineSize = "100%";
  zenModal.style.blockSize = "100%";
  zenModal.style.position = "absolute";
  zenModal.style.zIndex = 2;
  zenModal.style.display = "flex";
  zenModal.style.alignItems = "center";
  zenModal.style.justifyContent = "center";
  return zenModal;
}

function createReturnChatButton(zenModal) {
  const chatButton = document.createElement("button");
  chatButton.style.backgroundColor = "rgb(255 255 255 / 0.08)";
  chatButton.style.fontFamily = "Segoe UI, sans-serif";
  chatButton.style.color = "rgb(255 255 255 / 0.72)";
  chatButton.style.position = "relative";
  chatButton.style.zIndex = 3;
  chatButton.innerText = "Show chat";
  chatButton.style.border = "none";
  chatButton.style.fontWeight = "bold";
  chatButton.style.fontSize = "15px";
  chatButton.style.padding = "9px 12px";
  chatButton.style.borderRadius = "5px";
  chatButton.style.cursor = "pointer";
  chatButton.addEventListener("click", (event) => {
    zenModal.remove();
  });
  chatButton.addEventListener("mouseover", (event) => {
    chatButton.style.backgroundColor = "rgb(255 255 255 / 0.16)";
  });
  chatButton.addEventListener("mouseleave", (event) => {
    chatButton.style.backgroundColor = "rgb(255 255 255 / 0.08)";
  });
  return chatButton;
}

function createHideChatButton(chatComponent) {
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
    applyZenMode(chatComponent);
  });
  return hideChatButton;
}

function addHideChatButton(chatComponent) {
  const chatInput = document.querySelector(chatInputComponentSelector);
  const hideChatButton = createHideChatButton(chatComponent);
  chatInput.appendChild(hideChatButton);
}

function applyZenMode(chatComponent) {
  const zenModal = createZenModal();
  const returnChatButton = createReturnChatButton(zenModal);
  chatComponent.style.position = "relative";
  zenModal.appendChild(returnChatButton);
  chatComponent.appendChild(zenModal);
}

async function getPokemonData(pokemonID) {
  const response = await fetch(pokeApiUrl + pokemonID);
  const pokeData = await response.json();
  return pokeData;
}

async function getRandomPokemon() {
  // 0 - 900 (gen VIII pokemon)
  const random_id = Math.floor(Math.random() * 152);
  const pokeData = await getPokemonData(random_id);
  return pokeData;
}

async function applyPokemonMode() {
  const pokeData = await getRandomPokemon();
  const username = document.querySelector(usernameComponentSelector);
  const userAvatar = document.querySelector(userAvatarSelector);
  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation in mutationsList) {
      const addedNodes = mutationsList[mutation].addedNodes;
      if (addedNodes.length > 0)
        if (addedNodes[0] != "Opponent") {
          username.innerText = pokeData.name;
          username.style.textTransform = "capitalize";
          document.querySelector(".player-avatar img").src =
            pokeData.sprites.front_default;
          document.querySelector(".player-avatar img").style.scale = 1.8;
          observer.disconnect();
        }
    }
  });
  observer.observe(username, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

async function applyChanges() {
  const pokeMode = await applyPokemonMode();
  const chatComponent = await waitForElement(chatRoomComponentSelector);
  applyZenMode(chatComponent);
  addHideChatButton(chatComponent);
}

async function main() {
  applyChanges();

  // monitors opponent name change to check for the new game
  const opponentNameComponent = await waitForElement(usernameComponentSelector);
  opponentNameComponent.addEventListener("textChange", async () => {
    applyChanges();
  });
  observeElementChange(usernameComponentSelector, textChangeEvent);
}
// Entry point
main();
