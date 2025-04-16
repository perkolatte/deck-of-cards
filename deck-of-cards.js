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

async function makeCall(call, errorText) {
  try {
    const response = await fetch(call);
    if (!response.ok) {
      throw new Error(
        `${errorText} (Status: ${response.status} ${response.statusText})`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(errorText, error);
    throw error;
  }
}

async function createDeck(
  shuffled = true,
  deckCount,
  jokersEnabled = false,
  partial
) {
  const shufflePath = shuffled ? "shuffle/" : "";
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

    parameters = "?" + parameters.join("&");
  }

  const createDeckCall = `https://deckofcardsapi.com/api/deck/new/${shufflePath}${parameters}`;
  const errorText = "Failed to create deck.";

  return makeCall(createDeckCall, errorText);
}

async function shuffle(deckId, onlyRemaining = true) {
  const shuffleCall = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/?remaining=${onlyRemaining}`;
  const errorText = "Failed to shuffle deck.";
  return await makeCall(shuffleCall, errorText);
}

async function draw(drawCount = 1, deckId = "new") {
  const drawCall = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${drawCount}`;
  const errorText = "Failed to draw cards.";
  return await makeCall(drawCall, errorText);
}

(async function () {
  try {
    let response = await draw();
    console.log(response);
    const deckId = response.deck_id;
    let card = response.cards[0];
    console.log(`${card.value} of ${card.suit}`);

    response = await draw(1, deckId);
    card = response.cards[0];
    console.log(response);
    console.log(`${card.value} of ${card.suit}`);
  } catch (error) {
    console.error("Error drawing cards:", error);
  }
})();
