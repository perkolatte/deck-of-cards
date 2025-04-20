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
  Object.assign(element.style, styles); // Apply all styles from the styles object to the element
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
    console.error(errorText, error); // Log the error for debugging
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
  return makeCall(createDeckCall, "Failed to create deck."); // Call the API and handle errors
}

// Shuffle an existing deck
async function shuffle(deckId, onlyRemaining = true) {
  const shuffleCall = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/?remaining=${onlyRemaining}`;
  return makeCall(shuffleCall, "Failed to shuffle deck."); // Call the API to shuffle the deck
}

// Draw a specified number of cards from a deck
async function draw(drawCount = 1, deckId = "new") {
  const drawCall = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${drawCount}`;
  return makeCall(drawCall, "Failed to draw cards."); // Call the API to draw cards
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
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) translate(${randomLeftOffset}px, ${randomTopOffset}px) rotate(${randomRotation}deg)`,
    zIndex: `${drawnCardsContainer.children.length + 1}`, // Ensure the card is on top
    transition:
      "transform 0.4s cubic-bezier(0.32, 1, 0.23, 1), box-shadow 0.2s ease", // Smooth animations
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
    const base = `translate(-50%, -50%) translate(${randomLeftOffset}px, ${randomTopOffset}px) rotate(${randomRotation}deg)`;
    setStyles(card, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: base,
      zIndex: `${52 - i}`, // Stack cards in reverse order
    });
    card.dataset.baseTransform = base; // Store the base transform for hover effects
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
    card.style.display = index < remainingCards ? "block" : "none"; // Hide cards that are no longer in the deck
    if (index === remainingCards - 1) {
      card.classList.add("top-card"); // Mark the topmost card
    }
  });
}

// Main event listener for the page
document.addEventListener("DOMContentLoaded", async () => {
  const deck = document.getElementById("deck");
  const drawnCardsContainer = document.getElementById("drawn-cards-container");
  let deckId = null;

  // Hover module for random card transformations
  const Hover = {
    randomTransform({ maxOffset = 10, maxRotation = 10 } = {}) {
      const x = Math.random() * maxOffset * 2 - maxOffset;
      const y = Math.random() * maxOffset * 2 - maxOffset;
      const r = Math.random() * maxRotation * 2 - maxRotation;
      return { x, y, r };
    },
    applyTransform(el, { x, y, r }, scale = 1) {
      const base = el.dataset.baseTransform || "translate(-50%, -50%)";
      el.style.transform = `${base} translate(${x}px, ${y}px) scale(${scale}) rotate(${r}deg)`;
    },
  };

  // Handlers object: manages event listeners and interactions
  const Handlers = {
    deckEl: deck,
    drawnEl: drawnCardsContainer,
    attachListeners() {
      // Attach click listeners for drawing and shuffling cards
      this.deckEl.addEventListener("click", this.handleDrawCard.bind(this));
      this.drawnEl.addEventListener("click", (event) => {
        if (this.drawnEl.children.length > 0) {
          this.handleShuffleDeck(event); // Only shuffle if there are cards in the drawn pile
        }
      });
    },
    async handleDrawCard() {
      try {
        if (deckId) {
          const response = await draw(1, deckId);
          updateVisualDeck(response.remaining);
          displayCard(response.cards[0]);
          drawnCardsContainer.style.cursor =
            response.remaining === 0 ? "pointer" : "default";
        }
      } catch (error) {
        console.error("Error drawing card:", error);
      }
    },
    async handleShuffleDeck() {
      try {
        if (deckId) {
          await shuffle(deckId, false);
          drawnCardsContainer.innerHTML = ""; // Clear the drawn cards container
          drawnCardsContainer.classList.remove("active"); // Hide the container
          createVisualDeck(); // Reset the visual deck
        }
      } catch (error) {
        console.error("Error shuffling deck:", error);
      }
    },
    attachHover() {
      // Add hover effects for deck and drawn cards
      this.deckEl.addEventListener("mouseover", (e) => {
        const target = e.target.closest(".deck-card");
        if (!target) return;
        const isTop = target.classList.contains("top-card");
        const { x, y, r } = Hover.randomTransform({
          maxOffset: isTop ? 10 : 5,
          maxRotation: isTop ? 20 : 10,
        });
        Hover.applyTransform(target, { x, y, r }, isTop ? 1.1 : 1);
      });
      this.deckEl.addEventListener("mouseout", (e) => {
        const target = e.target.closest(".deck-card");
        if (!target) return;
        target.style.transform =
          target.dataset.baseTransform || "translate(-50%, -50%)";
      });
      this.drawnEl.addEventListener("mouseover", (e) => {
        if (e.target === this.drawnEl) {
          this.drawnEl.style.transform = "scale(1.1)";
        } else if (e.target.classList.contains("card")) {
          const { x, y, r } = Hover.randomTransform({
            maxOffset: 5,
            maxRotation: 10,
          });
          Hover.applyTransform(e.target, { x, y, r }, 1);
        }
      });
      this.drawnEl.addEventListener("mouseout", (e) => {
        if (e.target === this.drawnEl) {
          this.drawnEl.style.transform = "";
        } else if (e.target.classList.contains("card")) {
          e.target.style.transform =
            e.target.dataset.baseTransform || "translate(-50%, -50%)";
        }
      });
    },
    async init() {
      try {
        const deckData = await createDeck();
        deckId = deckData.deck_id;
        createVisualDeck();
        this.attachListeners();
        this.attachHover();
      } catch (error) {
        console.error("Error initializing deck:", error);
      }
    },
  };

  Handlers.init(); // Initialize the Handlers
});
