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

function getCardImage(json) {
  const img = document.createElement("img");
  img.src = json.image;
  img.alt = `${json.value} of ${json.suit}`;
  img.classList.add("card"); // Ensure the "card" class is applied
  return img;
}

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

function displayCard(card) {
  const drawnCardsContainer = document.getElementById("drawn-cards-container");
  const cardImage = getCardImage(card);

  // Generate random offsets and rotation with increased ranges
  const randomTopOffset = Math.random() * 20 - 10; // Random value between -10px and 10px
  const randomLeftOffset = Math.random() * 20 - 10; // Random value between -10px and 10px
  const randomRotation = Math.random() * 40 - 20; // Random rotation between -20deg and 20deg

  // Apply styles for stacking with random offsets and rotation
  cardImage.style.top = `${randomTopOffset}px`;
  cardImage.style.left = `calc(50% + ${randomLeftOffset}px)`; // Add random horizontal offset
  cardImage.style.transform = `translate(-50%, 0) rotate(${randomRotation}deg)`; // Keep centered with rotation
  cardImage.style.zIndex = `${drawnCardsContainer.children.length + 1}`; // Stack cards dynamically

  // Append the card to the drawn cards container
  drawnCardsContainer.appendChild(cardImage);
}

function updateVisualDeck(remainingCards) {
  const deckCards = Array.from(deck.querySelectorAll(".deck-card"));
  deckCards.reverse(); // Reverse the order to hide the topmost card first
  deckCards.forEach((card, index) => {
    // Hide cards beyond the remaining count
    card.style.display = index < remainingCards ? "block" : "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const createDeckButton = document.getElementById("create-deck");
  const backOfCard = document.getElementById("back-of-card");
  const deck = document.getElementById("deck");
  const drawnCardsContainer = document.getElementById("drawn-cards-container");
  let deckId = null;

  // Initially hide the back-of-card image
  backOfCard.style.display = "none";

  function createVisualDeck() {
    deck.innerHTML = ""; // Clear the deck container
    for (let i = 0; i < 52; i++) {
      const card = document.createElement("img");
      card.src = "images/back.png"; // Use the back-of-card image
      card.alt = "Back of Card";
      card.classList.add("deck-card");

      // Generate small random offsets and rotation
      const randomTopOffset = Math.random() * 2 - 1; // Random value between -1px and 1px
      const randomLeftOffset = Math.random() * 2 - 1; // Random value between -1px and 1px
      const randomRotation = Math.random() * 4 - 2; // Random rotation between -2deg and 2deg

      // Apply styles for slight offsets and rotation
      card.style.top = `${randomTopOffset}px`;
      card.style.left = `${randomLeftOffset}px`;
      card.style.transform = `rotate(${randomRotation}deg)`;
      card.style.zIndex = `${52 - i}`; // Stack cards in reverse order

      deck.appendChild(card);
    }
  }

  function updateVisualDeck(remainingCards) {
    const deckCards = Array.from(deck.querySelectorAll(".deck-card"));
    deckCards.reverse(); // Reverse the order to hide the topmost card first
    deckCards.forEach((card, index) => {
      // Hide cards beyond the remaining count
      card.style.display = index < remainingCards ? "block" : "none";
    });
  }

  createDeckButton.addEventListener("click", async () => {
    try {
      if (!deckId) {
        // Create a new deck
        const deckData = await createDeck();
        deckId = deckData.deck_id; // Store the deck ID
        console.log("Deck created:", deckData);

        // Show the visual deck
        createVisualDeck();

        // Change button text to "Draw Card"
        createDeckButton.textContent = "Draw Card";
      } else if (createDeckButton.textContent === "Draw Card") {
        // Draw a card from the same deck
        const response = await draw(1, deckId); // Use the stored deck ID
        const card = response.cards[0];
        console.log(`${card.value} of ${card.suit}`);
        displayCard(card);

        // Update the visual deck based on remaining cards
        updateVisualDeck(response.remaining);

        // If no cards are left, update the button and hide the deck
        if (response.remaining === 0) {
          createDeckButton.textContent = "Shuffle";
        }
      } else if (createDeckButton.textContent === "Shuffle") {
        // Shuffle the deck and reset the game
        console.log("Shuffling deck...");
        await shuffle(deckId, false);
        console.log("Deck shuffled!");

        // Clear the card stack
        drawnCardsContainer.innerHTML = ""; // Remove all cards from the container

        // Reset the visual deck
        createVisualDeck();

        // Reset the button
        createDeckButton.textContent = "Draw Card";
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
