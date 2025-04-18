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

// Utility function to set multiple styles on an element
function setStyles(element, styles) {
  Object.assign(element.style, styles);
}

// Create an image element for a card using the card's JSON data
function getCardImage(json) {
  const img = document.createElement("img");
  img.src = json.image; // Set the card image URL
  img.alt = `${json.value} of ${json.suit}`; // Set the alt text for accessibility
  img.classList.add("card"); // Add the "card" class for styling
  img.setAttribute("data-pin-nopin", "true"); // Prevent Pinterest saving
  return img;
}

// Make an API call and handle errors
async function makeCall(call, errorText) {
  try {
    const response = await fetch(call);
    if (!response.ok) {
      throw new Error(
        `${errorText} (Status: ${response.status} ${response.statusText})`
      );
    }
    return await response.json(); // Parse and return the JSON response
  } catch (error) {
    console.error(errorText, error);
    throw error; // Re-throw the error for further handling
  }
}

// Create a new deck of cards with optional parameters
async function createDeck(
  shuffled = true,
  deckCount,
  jokersEnabled = false,
  partial
) {
  const shufflePath = shuffled ? "shuffle/" : ""; // Add "shuffle/" if the deck should be shuffled
  const parameters = [
    deckCount ? `deck_count=${deckCount}` : "", // Add deck count if provided
    jokersEnabled ? `jokers_enabled=${jokersEnabled}` : "", // Add jokers if enabled
    partial ? `cards=${partial.join(",")}` : "", // Add specific cards if provided
  ]
    .filter(Boolean) // Remove empty parameters
    .join("&"); // Join parameters to string with "&"

  const createDeckCall = `https://deckofcardsapi.com/api/deck/new/${shufflePath}${
    parameters ? "?" + parameters : ""
  }`;
  return makeCall(createDeckCall, "Failed to create deck.");
}

// Shuffle an existing deck
async function shuffle(deckId, onlyRemaining = true) {
  const shuffleCall = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/?remaining=${onlyRemaining}`;
  return makeCall(shuffleCall, "Failed to shuffle deck.");
}

// Draw a specified number of cards from a deck
async function draw(drawCount = 1, deckId = "new") {
  const drawCall = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${drawCount}`;
  return makeCall(drawCall, "Failed to draw cards.");
}

// Display a drawn card in the drawn cards container
function displayCard(card) {
  const drawnCardsContainer = document.getElementById("drawn-cards-container");
  const cardImage = getCardImage(card);

  // Ensure drawn cards are protected from Pinterest
  cardImage.setAttribute("data-pin-nopin", "true");

  // Generate random offsets and rotation for a natural look
  const randomTopOffset = Math.random() * 20 - 10; // Vertical offset between -10px and 10px
  const randomLeftOffset = Math.random() * 20 - 10; // Horizontal offset between -10px and 10px
  const randomRotation = Math.random() * 40 - 20; // Rotation between -20deg and 20deg

  // Apply styles for stacking and positioning
  setStyles(cardImage, {
    top: `${randomTopOffset}px`,
    left: `calc(50% + ${randomLeftOffset}px)`,
    transform: `translate(-50%, 0) rotate(${randomRotation}deg)`,
    zIndex: `${drawnCardsContainer.children.length + 1}`, // Ensure the card is on top
  });

  // Add the card to the container
  drawnCardsContainer.appendChild(cardImage);

  // Show the container if it was hidden
  drawnCardsContainer.classList.add("active");
}

// Create a visual representation of the deck with 52 back-of-card images
function createVisualDeck() {
  const deck = document.getElementById("deck");
  deck.innerHTML = ""; // Clear the deck container

  for (let i = 0; i < 52; i++) {
    const card = document.createElement("img");
    card.src = "images/back.png"; // Use the back-of-card image
    card.alt = "Shuffle deck, face down"; // Set alt text for accessibility
    card.classList.add("deck-card"); // Add the "deck-card" class for styling
    card.setAttribute("data-pin-nopin", "true"); // Prevent Pinterest saving

    // Generate small random offsets and rotation for a natural look
    const randomTopOffset = Math.random() * 2 - 1; // Vertical offset between -1px and 1px
    const randomLeftOffset = Math.random() * 2 - 1; // Horizontal offset between -1px and 1px
    const randomRotation = Math.random() * 4 - 2; // Rotation between -2deg and 2deg

    // Apply styles for positioning
    setStyles(card, {
      top: `${randomTopOffset}px`,
      left: `${randomLeftOffset}px`,
      transform: `rotate(${randomRotation}deg)`,
      zIndex: `${52 - i}`, // Stack cards in reverse order
    });

    deck.appendChild(card); // Add the card to the deck container
  }

  // Ensure the topmost card is marked as "top-card"
  updateVisualDeck(52); // Pass the full deck count
}

// Update the visual deck to reflect the remaining cards
function updateVisualDeck(remainingCards) {
  const deckCards = Array.from(
    document.querySelectorAll(".deck-card")
  ).reverse(); // Topmost card is last
  deckCards.forEach((card) => card.classList.remove("top-card"));

  deckCards.forEach((card, index) => {
    card.style.display = index < remainingCards ? "block" : "none";
    // Remove any JS box-shadow update. All shadow styling is defined in CSS.

    if (index === remainingCards - 1) {
      card.classList.add("top-card");
      const randomAngle = Math.random() * 10 - 5;
      card.style.setProperty("--random-rotation", `${randomAngle}deg`);
    }
  });
}

// Main event listener for the page
document.addEventListener("DOMContentLoaded", async () => {
  const deck = document.getElementById("deck");
  const drawnCardsContainer = document.getElementById("drawn-cards-container");
  let deckId = null; // Store the deck ID

  // Create a new deck when the page loads
  try {
    const deckData = await createDeck();
    deckId = deckData.deck_id; // Save the deck ID
    createVisualDeck(); // Create the visual deck
  } catch (error) {
    console.error("Error creating deck:", error);
  }

  async function handleDrawCard() {
    try {
      if (deckId) {
        // Draw a card from the deck
        const response = await draw(1, deckId);
        updateVisualDeck(response.remaining); // Update the visual deck
        displayCard(response.cards[0]); // Display the drawn card

        if (response.remaining === 0) {
          // Enable shuffle hover effect when all cards are drawn
          drawnCardsContainer.style.cursor = "pointer";
        }
      }
    } catch (error) {
      console.error("Error drawing card:", error);
    }
  }

  async function handleShuffleDeck() {
    try {
      if (deckId) {
        // Shuffle the deck and reset the game
        await shuffle(deckId, false);
        const drawnCardsContainer = document.getElementById(
          "drawn-cards-container"
        );
        drawnCardsContainer.innerHTML = ""; // Clear the drawn cards container
        drawnCardsContainer.classList.remove("active"); // Hide the container
        createVisualDeck(); // Reset the visual deck
      }
    } catch (error) {
      console.error("Error shuffling deck:", error);
    }
  }

  // Add event listener to the deck to handle clicks on the topmost card
  deck.addEventListener("click", (event) => {
    const topCard = document.querySelector(".deck-card.top-card");
    if (topCard && event.target === topCard) {
      handleDrawCard();
    }
  });

  // Add event listener to update the top card's random rotation on each mouseover
  deck.addEventListener("mouseover", (event) => {
    const topCard = document.querySelector(".deck-card.top-card");
    if (topCard && event.target === topCard) {
      const newAngle = Math.random() * 20 - 10; // Random angle between -10deg and 10deg
      topCard.style.setProperty("--random-rotation", `${newAngle}deg`);
      // Update the inline transform to persist the new rotation immediately.
      topCard.style.transform = `rotate(${newAngle}deg)`;
    }
  });

  // Add event listener for non-top deck cards to update rotation on mouseover
  deck.addEventListener("mouseover", (event) => {
    const target = event.target;
    if (
      target.classList.contains("deck-card") &&
      !target.classList.contains("top-card")
    ) {
      const newAngle = Math.random() * 20 - 10; // Rotation between -10deg and 10deg
      target.style.transform = `rotate(${newAngle}deg)`;
    }
  });

  // Add a mouseout listener to "freeze" the rotation when the mouse leaves.
  deck.addEventListener("mouseout", (event) => {
    const topCard = document.querySelector(".deck-card.top-card");
    if (topCard && event.target === topCard) {
      // On mouseout, remove any :hover effects by setting the inline transform (already updated) as final.
      const finalRotation = topCard.style.getPropertyValue("--random-rotation");
      topCard.style.transform = `rotate(${finalRotation})`;
    }
  });

  // Add event listener to the drawn cards container to handle shuffling
  drawnCardsContainer.addEventListener("click", handleShuffleDeck);

  // Add event listener to the drawn cards container to update rotation on every mouseover for drawn cards
  drawnCardsContainer.addEventListener("mouseover", (event) => {
    if (event.target && event.target.classList.contains("card")) {
      // Generate a new random angle between -20deg and 20deg
      const newRotation = Math.random() * 20 - 10;
      // Update the transform to keep the translation and apply the new rotation
      event.target.style.transform = `translate(-50%, 0) rotate(${newRotation}deg)`;
    }
  });
});
