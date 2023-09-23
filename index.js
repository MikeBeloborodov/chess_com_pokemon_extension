// Selectors
const boardComponentSelector = ".board";
const usernameComponentSelector = ".user-username-component";
const chatRoomComponentSelector = ".chat-room-component";
const chatInputComponentSelector = ".chat-input-chat-wrapper";
const chatInputGuestSelector = '.chat-input-guest';
const playerTopComponentSelector = '.player-top';
const countryFlagsComponentSelector = '.country-flags-component';
const userTaglineComponentSelector = '.user-tagline-component';

// Pokemon API base URL
const pokeApiUrl = "https://pokeapi.co/api/v2/pokemon/";

// Pokemon type colors
const pokemonTypes = {
  dragon:{
    type: 'dragon',
    color: '#0C69C8'
  },
  electric:{
    type: 'electric',
    color: '#F2D94E'
  },
  fire:{
    type: 'fire',
    color: '#FBA54C'
  },
  fairy:{
    type: 'fairy',
    color: '#EE90E6'
  },
  fighting:{
    type: 'fighting',
    color: '#D3425F'
  },
  flying:{
    type: 'flying',
    color: '#A1BBEC'
  },
  ghost:{
    type: 'ghost',
    color: '#5F6DBC'
  },
  grass:{
    type: 'grass',
    color: '#5FBD58'
  },
  ground:{
    type: 'ground',
    color: '#DA7C4D'
  },
  ice:{
    type: 'ice',
    color: '#75D0C1'
  },
  normal:{
    type: 'normal',
    color: '#A0A29F'
  },
  poison:{
    type: 'poison',
    color: '#B763CF'
  },
  psychic:{
    type: 'psychic',
    color: '#FA8581'
  },
  rock:{
    type: 'rock',
    color: '#C9BB8A'
  },
  steel:{
    type: 'steel',
    color: '#5695A3'
  },
  water:{
    type: 'water',
    color: '#539DDF'
  }
}

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

// this function with closure returns a function "opponentWaiter"
// it holds prev game URL to check for a new game
const waitForOpponent = async (usernameComponent) => {
  return new Promise((resolve) => {
    let prevGame = "";
    const defaultOpponentUsername = usernameComponent.innerText;
    return resolve(() => {
      const re = new RegExp("https:\/\/www\.chess\.com\/?(game)?\/?(live)?\/[0-9]*$");
      return new Promise((resolve) => {
        if (
          (re.test(document.URL)) && 
          (document.URL !== prevGame) && 
          (document.querySelector(usernameComponentSelector).innerText !== defaultOpponentUsername)) {
          prevGame = document.URL;
          return resolve();
        }
        const observer = new MutationObserver((mutationsList, observer) => {
          if (
            (re.test(document.URL)) &&
            (document.URL !== prevGame) &&
            (document.querySelector(usernameComponentSelector).innerText !== defaultOpponentUsername)
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
    if (chatInputComponent) {
      chatInputComponent.appendChild(hideChatButton);
    } else {
      const chatInputGuestComponent = document.querySelector(chatInputGuestSelector)
      chatInputGuestComponent.append(hideChatButton)
    }
    chatComponent.appendChild(chatModal);
    chatModal.appendChild(returnChatButton);
    resolve();
  });
};

// this function checks if chat component is null 
// we need this to apply another chat modal to the new chat
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

const getPokemonData = async(pokemonID) => {
  return new Promise(async(resolve) => {
    const response = await fetch(pokeApiUrl + pokemonID);
    const pokeData = await response.json();
    resolve(pokeData);
  })
}

const getRandomPokemon = async() => {
  return new Promise(async(resolve) => {
    // Gen I (1 - 151 pokemon)
    const random_id = Math.floor(Math.random() * 152);
    const pokeData = await getPokemonData(random_id);
    resolve(pokeData)
  })
}

const transformUsername = async(pokeData) => {
  return new Promise(resolve => {
    const username = document.querySelector(usernameComponentSelector);
    username.innerText = pokeData.name;
    username.style.textTransform = 'capitalize';
    resolve();
  })
}

const transformAvatar = (pokeData) => {
  return new Promise(resolve => {
    // remove old changes
    if (document.querySelector('.pokemon-avatar-background')){
      document.querySelector('.pokemon-avatar-background').remove()
    } 
    if (document.querySelector('.pokemon-avatar-image')) {
      document.querySelector('.pokemon-avatar-image').remove();
    }

    const playerTopComponent = document.querySelector(playerTopComponentSelector);
    const avatarBackground = document.createElement("div");
    avatarBackground.classList.add('pokemon-avatar-background');
    avatarBackground.style.position = "absolute";
    avatarBackground.style.backgroundColor = "rgb(48, 46, 43)";
    avatarBackground.style.inlineSize = "48px";
    avatarBackground.style.blockSize = "42px";
    avatarBackground.style.insetInlineStart = '-5px'
    avatarBackground.style.zIndex = 2;
    const newAvatar = document.createElement("img");
    newAvatar.classList.add('pokemon-avatar-image');
    newAvatar.style.position = "absolute";
    newAvatar.style.inlineSize = "44px";
    newAvatar.style.blockSize = "42px";
    newAvatar.style.border = 'none';
    newAvatar.style.zIndex = 3;
    newAvatar.style.scale = 1.5;
    newAvatar.style.insetInlineStart = '-4px;'
    newAvatar.src = pokeData.sprites.front_default;
    playerTopComponent.style.position = "relative";
    playerTopComponent.appendChild(avatarBackground);
    playerTopComponent.appendChild(newAvatar);
    resolve();
  })
}

const transformFlag = async(pokeData) => {
  return new Promise(resolve => {
    // check for old type image
    if (document.querySelector('.pokemon-type-img'))
      document.querySelector('.pokemon-type-img').remove()

    const flagComponent = document.querySelector(countryFlagsComponentSelector);
    console.log(pokeData.types[0].type.name);
    const type = pokeData.types[0].type.name
    flagComponent.style.backgroundImage = `none`;
    const typeImg = document.createElement('img');
    typeImg.classList.add('pokemon-type-img');
    typeImg.style.position = 'absolute';
    typeImg.style.inlineSize = '20px';
    typeImg.style.blockSize = '20px';
    typeImg.style.backgroundColor = pokemonTypes[type].color;
    typeImg.style.boxShadow = `0 0 5px 0 ${pokemonTypes[type].color}`
    typeImg.style.padding = "3px";
    typeImg.style.borderRadius = "50%";
    typeImg.style.marginRight = '5px';
    typeImg.src = chrome.runtime.getURL(`icons/${type}.svg`);
    flagComponent.style.position = 'relative';
    const userTaglineComponent = document.querySelector(userTaglineComponentSelector);
    userTaglineComponent.style.marginTop = "5px";
    const usernameComponent = document.querySelector(usernameComponentSelector);
    usernameComponent.style.marginRight = '5px';
    flagComponent.appendChild(typeImg);
    resolve();
  })
}

const applyPokemonMode = async(pokeData) => {
  return new Promise(async(resolve) => {
    transformUsername(pokeData)
      .then((res) => transformAvatar(pokeData))
      .then((res) => transformFlag(pokeData))
      .then((res) => resolve())
  })
}

// this recursive function waits for a new match, applies changes and then fires itself again
const newMatch = async(opponentWaiter) => {
  // waiting for opponent might be long, api call is faster
  const pokeData = await getRandomPokemon();
  opponentWaiter()
    .then((res) => applyPokemonMode(pokeData))
    .then((res) => waitForElement(chatRoomComponentSelector))
    .then((res) => closeChat())
    .then((res) => waitForChatToRefresh())
    .then((res) => newMatch(opponentWaiter));
};

// we wait until user starts a new game and a game board appears
const main = async () => {
  waitForElement(boardComponentSelector)
  .then((res) => waitForElement(usernameComponentSelector))
  .then((usernameComponent) => waitForOpponent(usernameComponent))
  .then((opponentWaiter) => newMatch(opponentWaiter))
};

// Entry point
main();
