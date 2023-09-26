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

  // loads pokemon types from data/pokemon_types.json
  static async loadPokemonTypes() {
    const dataUrl = chrome.runtime.getURL("src/data/pokemon_types.json");
    this.pokemonTypes = await fetch(dataUrl).then((res) => res.json());
  }

  // start of the program
  static start() {
    this.loadPokemonTypes();
  }
}

PokemonExtension.start();
