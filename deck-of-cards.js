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

// Utility function to apply multiple styles to an element
function setStyles(element, styles) {
  Object.assign(element.style, styles);
}

// Refactor repetitive logic for creating DOM elements
function createElement(tag, attributes = {}, styles = {}) {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  setStyles(element, styles);
  return element;
}

// Create an image element for a card using its JSON data
function getCardImage(json) {
  return createElement(
    "img",
    {
      src: json.image,
      alt: `${json.value} of ${json.suit}`,
      class: "card",
      "data-pin-nopin": "true",
    },
    {}
  );
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
  deckCount = 1
  // jokersEnabled = false,
  // partial = []
) {
  const shufflePath = shuffled ? "shuffle/" : ""; // Add "shuffle/" if the deck should be shuffled
  const parameters = [
    deckCount ? `deck_count=${deckCount}` : "", // Add deck count if provided
    // jokersEnabled ? `jokers_enabled=${jokersEnabled}` : "", // Add jokers if enabled
    // partial.length ? `cards=${partial.join(",")}` : "", // Add specific cards if provided
  ]
    .filter(Boolean) // Remove empty parameters
    .join("&"); // Join parameters to string with "&"

  const createDeckCall = `https://deckofcardsapi.com/api/deck/new/${shufflePath}${
    parameters ? "?" + parameters : ""
  }`;
  return makeCall(createDeckCall, "Failed to create a new deck of cards."); // Improved error message
}

// Uncommented the `draw` function since it is being used in `Handlers.handleDrawCard`
async function draw(drawCount = 1, deckId = "new") {
  const drawCall = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${drawCount}`;
  return makeCall(drawCall, "Failed to draw cards."); // Call the API to draw cards
}

async function shuffle(deckId, onlyRemaining = true) {
  const shuffleCall = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/?remaining=${onlyRemaining}`;
  return makeCall(shuffleCall, "Failed to shuffle deck."); // Call the API to shuffle the deck
}

// Cache DOM elements to avoid repeated lookups
const deckContainer = document.getElementById("deck");
const drawnCardsContainer = document.getElementById("drawn-cards-container");

// Utility function to safely update the cursor style
function updateCursorStyle(element, condition, cursorIfTrue, cursorIfFalse) {
  element.style.cursor = condition ? cursorIfTrue : cursorIfFalse;
}

// Simplify repetitive logic for applying random transformations
function generateRandomTransform(maxOffset, maxRotation) {
  const offsetX = Math.random() * maxOffset * 2 - maxOffset;
  const offsetY = Math.random() * maxOffset * 2 - maxOffset;
  const rotation = Math.random() * maxRotation * 2 - maxRotation;
  return { offsetX, offsetY, rotation };
}

// Display a drawn card in the drawn cards container
function displayCard(cardData) {
  const cardImageElement = getCardImage(cardData);

  // Generate random offsets and rotation for a natural look
  const {
    offsetX: randomOffsetX,
    offsetY: randomOffsetY,
    rotation: randomRotation,
  } = generateRandomTransform(20, 40);

  // Apply styles for stacking and positioning
  setStyles(cardImageElement, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) translate(${randomOffsetX}px, ${randomOffsetY}px) rotate(${randomRotation}deg)`,
    zIndex: `${drawnCardsContainer.children.length + 1}`, // Ensure the card is on top
    transition:
      "transform 0.4s cubic-bezier(0.32, 1, 0.23, 1), box-shadow 0.2s ease", // Smooth animations
  });

  // Add the card to the container
  drawnCardsContainer.appendChild(cardImageElement);

  // Show the container if it was hidden
  drawnCardsContainer.classList.add("active");
}

// Create a visual representation of the deck with 52 back-of-card images
function createVisualDeck() {
  deckContainer.innerHTML = ""; // Clear the deck container

  for (let cardIndex = 0; cardIndex < 52; cardIndex++) {
    const randomOffsetY = Math.random() * 4 - 2; // Vertical offset between -2px and 2px
    const randomOffsetX = Math.random() * 4 - 2; // Horizontal offset between -2px and 2px
    const randomRotation = Math.random() * 4 - 2; // Rotation between -2deg and 2deg

    const baseTransform = `translate(-50%, -50%) translate(${randomOffsetX}px, ${randomOffsetY}px) rotate(${randomRotation}deg)`;

    const cardElement = createElement(
      "img",
      {
        src: "images/back.png",
        alt: "Shuffle deck, face down",
        class: "deck-card",
        "data-pin-nopin": "true",
      },
      {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: baseTransform,
        zIndex: `${52 - cardIndex}`,
      }
    );

    cardElement.dataset.baseTransform = baseTransform; // Store the base transform for hover effects
    deckContainer.appendChild(cardElement); // Add the card to the deck container
  }

  updateVisualDeck(52); // Pass the full deck count
}

// Update the visual deck to reflect the remaining cards
function updateVisualDeck(remainingCardCount) {
  const deckCardElements = Array.from(
    document.querySelectorAll(".deck-card")
  ).reverse(); // Topmost card is last
  deckCardElements.forEach((cardElement) =>
    cardElement.classList.remove("top-card")
  );

  deckCardElements.forEach((cardElement, cardIndex) => {
    cardElement.style.display =
      cardIndex < remainingCardCount ? "block" : "none"; // Hide cards that are no longer in the deck
    if (cardIndex === remainingCardCount - 1) {
      cardElement.classList.add("top-card"); // Mark the topmost card
    }
  });
}

// Main event listener for the page
document.addEventListener("DOMContentLoaded", async () => {
  let deckId = null;

  // Hover module for random card transformations
  const Hover = {
    randomTransform({ maxOffset = 10, maxRotation = 10 } = {}) {
      const offsetX = Math.random() * maxOffset * 2 - maxOffset;
      const offsetY = Math.random() * maxOffset * 2 - maxOffset;
      const rotation = Math.random() * maxRotation * 2 - maxRotation;
      return { offsetX, offsetY, rotation };
    },
    applyTransform(element, { offsetX, offsetY, rotation }, scale = 1) {
      const baseTransform =
        element.dataset.baseTransform || "translate(-50%, -50%)";
      const newTransform = `${baseTransform} translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`;
      element.style.transform = newTransform;
      element.dataset.lastTransform = newTransform; // Store the last applied transform
    },
  };

  // Handlers object: manages event listeners and interactions
  const Handlers = {
    deckElement: deckContainer,
    drawnCardsElement: drawnCardsContainer,
    attachListeners() {
      // Attach click listeners for drawing and shuffling cards
      this.deckElement.addEventListener(
        "click",
        this.handleDrawCard.bind(this)
      );
      this.drawnCardsElement.addEventListener("click", (event) => {
        if (this.drawnCardsElement.children.length > 0) {
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
          updateCursorStyle(
            drawnCardsContainer,
            response.remaining === 0,
            "pointer",
            "default"
          );
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
      this.deckElement.addEventListener("mouseover", (e) => {
        const targetCard = e.target.closest(".deck-card");
        if (!targetCard) return;
        const isTopCard = targetCard.classList.contains("top-card");
        const { offsetX, offsetY, rotation } = Hover.randomTransform({
          maxOffset: isTopCard ? 10 : 5,
          maxRotation: isTopCard ? 20 : 10,
        });
        Hover.applyTransform(
          targetCard,
          { offsetX, offsetY, rotation },
          isTopCard ? 1.1 : 1
        );
      });

      this.deckElement.addEventListener("mouseout", (e) => {
        const targetCard = e.target.closest(".deck-card");
        if (!targetCard) return;

        // Extract the translate and rotate values from the lastTransform or baseTransform
        const transform =
          targetCard.dataset.lastTransform ||
          targetCard.dataset.baseTransform ||
          "translate(-50%, -50%)";
        const updatedTransform = transform.replace(
          /scale\([^)]+\)/,
          "scale(1)"
        ); // Reset only the scale
        targetCard.style.transform = updatedTransform;
      });

      this.drawnCardsElement.addEventListener("mouseover", (e) => {
        if (e.target === this.drawnCardsElement) {
          this.drawnCardsElement.style.transform = "scale(1.1)";
        } else if (e.target.classList.contains("card")) {
          const { offsetX, offsetY, rotation } = Hover.randomTransform({
            maxOffset: 5,
            maxRotation: 10,
          });
          Hover.applyTransform(e.target, { offsetX, offsetY, rotation }, 1);
        }
      });

      this.drawnCardsElement.addEventListener("mouseout", (e) => {
        if (e.target === this.drawnCardsElement) {
          this.drawnCardsElement.style.transform = "";
        } else if (e.target.classList.contains("card")) {
          // Extract the translate and rotate values from the lastTransform or baseTransform
          const transform =
            e.target.dataset.lastTransform ||
            e.target.dataset.baseTransform ||
            "translate(-50%, -50%)";
          const updatedTransform = transform.replace(
            /scale\([^)]+\)/,
            "scale(1)"
          ); // Reset only the scale
          e.target.style.transform = updatedTransform;
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
