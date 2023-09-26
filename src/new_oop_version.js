class PokemonExtension {
  static boardComponentSelector = ".board";
  static usernameComponentSelector = ".user-username-component";
  static chatRoomComponentSelector = ".chat-room-component";
  static chatInputComponentSelector = ".chat-input-chat-wrapper";
  static chatInputGuestSelector = ".chat-input-guest";
  static playerTopComponentSelector = ".player-top";
  static countryFlagsComponentSelector = ".country-flags-component";
  static userTaglineComponentSelector = ".user-tagline-component";
  static grudgeScoreComponentSelector = ".grudge-score-component";

  // Pokemon API base URL
  static pokeApiUrl = "https://pokeapi.co/api/v2/pokemon/";

  // Pokemon types and colors
  static pokemonTypes = {};

  // Pokemon data from poke API
  static pokeData = {};

  // URL for a previous game
  static prevGame = "";

  // username of a previous opponent
  static prevOpponent = "";

  // default username like "opponent"
  // we need this for different languages
  static defaultOpponentUsername = "";

  static urlRegExpChecker = new RegExp(
    "https://www.chess.com/?(game)?/?(live)?/[0-9]*$"
  );

  // loads pokemon types from data/pokemon_types.json
  static async loadPokemonTypes() {
    const dataUrl = chrome.runtime.getURL("src/data/pokemon_types.json");
    this.pokemonTypes = await fetch(dataUrl).then((res) => res.json());
  }

  // uses mutation observer to look for an element
  static async waitForElement(selector) {
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
  }

  // injects pokemon fonts
  static async injectFonts() {
    return new Promise((resolve) => {
      let font = new FontFace(
        "Pokemon Solid",
        `url(${chrome.runtime.getURL("src/fonts/Pokemon_Solid.ttf")})`
      );
      document.fonts.add(font);
      resolve();
    });
  }

  // saves default opponent username
  static async saveDefaultOpponentUsername(username) {
    return new Promise((resolve) => {
      this.defaultOpponentUsername = username;
      resolve();
    });
  }

  // waits for another opponent
  static async waitForOpponent() {
    return new Promise((resolve) => {
      if (
        (this.urlRegExpChecker.test(document.URL)) && 
        (document.URL !== this.prevGame) && 
        (document.querySelector(this.usernameComponentSelector).innerText !== 
          this.defaultOpponentUsername)) {
        this.prevGame = document.URL;
        return resolve();
      }
      const observer = new MutationObserver((mutationsList, observer) => {
        if (
          (this.urlRegExpChecker.test(document.URL)) &&
          (document.URL !== this.prevGame) &&
          (document.querySelector(this.usernameComponentSelector).innerText !== 
            this.defaultOpponentUsername)
        ) {
          this.prevGame = document.URL;
          observer.disconnect();
          return resolve();
        }
      });
      observer.observe(document.body, {childList: true, subtree: true});
  }
)}

  // randomly gets pokemon data from pokeAPI
  static async getRandomPokemon() {
    return new Promise(async(resolve) => {
      // Gen I (1 - 151 pokemon)
      const random_id = Math.floor(Math.random() * 152);
      const pokeData = await getPokemonData(random_id);
      const response = await fetch(this.pokeApiUrl + pokemonID);
      this.pokeData = await response.json();
      resolve()
    })
  }

  // transforms opponent username to a pokemon name
  static async transformUsername() {
    return new Promise(resolve => {
      const username = document.querySelector(usernameComponentSelector);
      username.innerText = this.pokeData.name;
      username.style.textTransform = 'capitalize';
      resolve();
    })
  }

  // transforms opponent avatar to a pokemon sprite
  static async transformAvatar() {
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
      avatarBackground.style.inlineSize = "50px";
      avatarBackground.style.blockSize = "42px";
      avatarBackground.style.insetInlineStart = '-6px'
      avatarBackground.style.zIndex = 2;
      const newAvatar = document.createElement("img");
      newAvatar.classList.add('pokemon-avatar-image');
      newAvatar.style.position = "relative";
      newAvatar.style.inlineSize = "44px";
      newAvatar.style.blockSize = "42px";
      newAvatar.style.border = 'none';
      newAvatar.style.zIndex = 3;
      if (this.pokeData.height < 10) {
        newAvatar.style.scale = 2;
      } else if (pokeData.height >= 10) {
        newAvatar.style.scale = 1.5; 
      }
      newAvatar.style.insetInlineStart = '6px';

      if (document.querySelector(this.grudgeScoreComponentSelector)) {
        newAvatar.style.insetInlineStart = '-4px;'
        avatarBackground.style.insetInlineStart = '40px';
      } else {
        avatarBackground.style.insetInlineStart = 0;
      }

    // 1 in 20 random shiny
    // TODO: sparkling effect?
    const randomShiny = Math.floor(Math.random() * 20);
    if (randomShiny === 5) {
      newAvatar.src = this.pokeData.sprites.front_shiny;
      const shinyTag = document.createElement('p');
      shinyTag.innerText = 'Shiny!'
      shinyTag.style.fontFamily = 'Pokemon Solid';
      shinyTag.style.fontSize = '10px';
      shinyTag.style.letterSpacing = '1.5px';
      shinyTag.style.position = 'absolute';
      shinyTag.style.zIndex = 3;
      if (document.querySelector(this.grudgeScoreComponentSelector)) {
        shinyTag.style.insetInlineStart = '-68px;'
      } else {
        shinyTag.style.insetInlineStart = '-30px';
      }
      shinyTag.style.insetBlockStart = '-5px';
      shinyTag.style.rotate = '313deg';
      shinyTag.style.color = '#FFF';
      avatarBackground.appendChild(shinyTag);
    } else {
      newAvatar.src = this.pokeData.sprites.front_default;
    }

    playerTopComponent.style.position = "relative";
    avatarBackground.appendChild(newAvatar);
    playerTopComponent.appendChild(avatarBackground);
    resolve();
  })
  }

  // transforms opponent flag to a pokemon type icon
  static async transformFlag() {
    return new Promise(resolve => {
      // check for old type image
      if (document.querySelector('.pokemon-type-img'))
        document.querySelector('.pokemon-type-img').remove();

      const flagComponent = document.querySelector(this.countryFlagsComponentSelector);
      const type = this.pokeData.types[0].type.name
      flagComponent.style.backgroundImage = `none`;
      const typeImg = document.createElement('img');
      typeImg.classList.add('pokemon-type-img');
      typeImg.style.position = 'absolute';
      typeImg.style.inlineSize = '20px';
      typeImg.style.blockSize = '20px';
      typeImg.style.backgroundColor = this.pokemonTypes[type].color;
      typeImg.style.boxShadow = `0 0 5px 0 ${this.pokemonTypes[type].color}`
      typeImg.style.padding = "3px";
      typeImg.style.borderRadius = "50%";
      typeImg.src = chrome.runtime.getURL(`icons/${type}.svg`);
      flagComponent.style.marginRight = '5px';
      flagComponent.style.marginLeft = '5px';
      flagComponent.style.position = 'relative';
      const userTaglineComponent = document.querySelector(this.userTaglineComponentSelector);
      userTaglineComponent.style.marginTop = "5px";
      const usernameComponent = document.querySelector(this.usernameComponentSelector);
      usernameComponent.style.marginLeft = '5px';
      flagComponent.appendChild(typeImg);
      resolve();
    })
  }

  // applies pokemon mode 
  static async applyPokemonMode() {
    return new Promise(async(resolve) => {
      transformUsername()
        .then((res) => transformAvatar())
        .then((res) => transformFlag())
        .then((res) => resolve());
    });
  }

  // starts a new match
  static async newMatch(){
    // waiting for opponent might be long, api call is faster
    this.pokeData = await this.getRandomPokemon();
    opponentWaiter()
      .then((res) => applyPokemonMode())
      .then((res) => waitForElement(this.chatRoomComponentSelector))
      .then((res) => closeChat())
      .then((res) => waitForChatToRefresh())
      .then((res) => newMatch(opponentWaiter));
  };

  // start of the program
  static start() {
    this.loadPokemonTypes();
    this.waitForElement(this.boardComponentSelector)
      .then(() => this.injectFonts())
      .then(() => this.waitForElement(this.usernameComponentSelector))
      .then((username) => this.saveDefaultOpponentUsername(username))
      .then(() => this.waitForOpponent())
      .then(() => this.newMatch());
  }
}

PokemonExtension.start();
