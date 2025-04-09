// ## **Part 2: Deck of Cards**

// 1. Make a request to the [Deck of Cards API](http://deckofcardsapi.com/) to request a single card from a newly shuffled deck.
//    Once you have the card, ***console.log*** the value and the suit (e.g. “5 of spades”, “queen of diamonds”).

// 2. Make a request to the deck of cards API to request a single card from a newly shuffled deck.
//    Once you have the card, make a request to the same API to get one more card from the **same** deck.
//    Once you have both cards, ***console.log*** the values and suits of both cards.

// 3. Build an HTML page that lets you draw cards from a deck.
//    When the page loads, go to the Deck of Cards API to create a new deck,
//    and show a button on the page that will let you draw a card.
//    Every time you click the button, display a new card, until there are no cards left in the deck.


// https://deckofcardsapi.com/static/img/back.png

let deckCount = 1;

function createDeck(shuffled = true, deckCount, jokersEnabled=false, partial) {

    const shufflePath = shuffled ? "/shuffle/" : "";
    let parameters = [];

    if (deckCount || jokersEnabled || partial) {

        if (deckCount) {
            parameters.push(`deck_count=${deckCount}`);
        }
        if (jokersEnabled) {
            parameters.push(`jokers_enabled=${jokersEnabled}`);
        }
        if (partial) {
            parameters.push(`cards=${partial.join(",")}`);
        }

        parameters = "?" + parameters.join('&');
    }
        
        const createDeckCall = `https://deckofcardsapi.com/api/deck/new/${shufflePath}${parameters}`;

        return fetch(createDeckCall);
}

shuffleExistingDeck(deckId, onlyRemaining = true) {
  const shuffle = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/?remaining=${onlyRemaining}`;

  fetch(shuffle);
}

draw(deckid, drawCount = 1) {
  const drawCall = `https://deckofcardsapi.com/api/deck/${deckid}/draw/?count=${drawCount}`;

  fetch(drawCall);
}
