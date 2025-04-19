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
    // Updated transform to vertically center with translate(-50%, -50%)
    transform: `translate(-50%, 0%) rotate(${randomRotation}deg)`,
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
    const randomTopOffset = Math.random() * 4 - 2; // Vertical offset between -1px and 1px
    const randomLeftOffset = Math.random() * 4 - 2; // Horizontal offset between -1px and 1px
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
    // Only trigger if the top card is clicked (or contains the event target)
    if (topCard && topCard.contains(event.target)) {
      handleDrawCard();
    }
  });

  // -------------------------------
  // Consolidated Event Listeners
  // -------------------------------

  // Helper to check if an element is a top deck card
  function isTopCard(element) {
    return (
      element.classList.contains("deck-card") &&
      element.classList.contains("top-card")
    );
  }

  // Consolidated handler for deck mouse events (for deck cards)
  function handleDeckMouseover(event) {
    const target = event.target;
    if (target.classList.contains("deck-card")) {
      if (isTopCard(target)) {
        // For the top card: include centering, a random translation offset, scale, and rotation.
        const newAngle = Math.random() * 20 - 10; // -10deg to 10deg
        const randX = Math.random() * 10 - 5; // Random X offset between -5px and 5px
        const randY = Math.random() * 10 - 5; // Random Y offset between -5px and 5px
        target.style.setProperty("--random-rotation", `${newAngle}deg`);
        target.style.transform = `translate(0%, 0%) translate(${randX}px, ${randY}px) scale(1.1) rotate(${newAngle}deg)`;
      } else {
        // For non-top deck cards: apply a small random translation and rotation.
        const newAngle = Math.random() * 20 - 10; // -10deg to 10deg
        const randX = Math.random() * 10 - 5; // Random X offset between -5px and 5px
        const randY = Math.random() * 10 - 5; // Random Y offset between -5px and 5px
        target.style.transform = `translate(${randX}px, ${randY}px) rotate(${newAngle}deg)`;
      }
    }
  }

  function handleDeckMouseout(event) {
    const target = event.target;
    if (isTopCard(target)) {
      // Freeze top card to its last assigned rotation.
      const finalRotation = target.style.getPropertyValue("--random-rotation");
      target.style.transform = `rotate(${finalRotation})`;
    }
  }

  // Consolidated handlers for the drawn cards container (the drawn pile)
  function handleDrawnCardsMouseover(event) {
    if (event.target === drawnCardsContainer) {
      // When hovering on the container as a whole, scale the entire pile.
      drawnCardsContainer.style.transform = "scale(1.1)";
      drawnCardsContainer.style.transition = "transform 0.2s ease-in-out";
    } else if (event.target.classList.contains("card")) {
      // When hovering an individual drawn card, apply a slight random rotation and translation.
      const newAngle = Math.random() * 20 - 10; // -10deg to 10deg
      const randX = Math.random() * 10 - 5; // -2px to 2px
      const randY = Math.random() * 10 - 5; // -2px to 2px
      // Maintain centering using translate(-50%, -50%)
      event.target.style.transform = `translate(-50%, 0%) translate(${randX}px, ${randY}px) rotate(${newAngle}deg)`;
    }
  }

  function handleDrawnCardsMouseout(event) {
    if (event.target === drawnCardsContainer) {
      // Reset the container transform
      drawnCardsContainer.style.transform = "";
    }
    // For individual card mouseout, leave the last transform intact ("freeze" it)
  }

  // Remove any duplicate handlers and attach the consolidated ones:
  deck.addEventListener("mouseover", handleDeckMouseover);
  deck.addEventListener("mouseout", handleDeckMouseout);
  drawnCardsContainer.addEventListener("click", handleShuffleDeck);
  drawnCardsContainer.addEventListener("mouseover", handleDrawnCardsMouseover);
  drawnCardsContainer.addEventListener("mouseout", handleDrawnCardsMouseout);
});
