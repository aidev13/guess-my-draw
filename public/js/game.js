// login
  





  // if player 1 (drawer)
      // get random word
        // save picked word to check guesser's typed answers against
    // get access to drawing canvas
    // begin timer countdown
  // if player 2, etc. (guesser)
    // if join mid-game
      // page that asks player to wait for new game to start (show current round timer)
    // prevent access to drawing canvas
      // hide drawing tools
    // check typed chat messages against drawer's picked word
      // if matches
        // record user round win
        // Variables to represent game state
let isDrawer = false; // Assume player 2 (guesser) by default
let pickedWord = "";
let isMidGameJoin = false;
let isMatched = false;
let userRoundWins = 0;

// Functions to handle game logic

// Function to start a new game
function startNewGame() {
  // Generate a random word for the drawer
  pickedWord = generateRandomWord();
  
  // Simulate player 1 (drawer) for now
  isDrawer = true;
  
  // Start the timer countdown
  startTimer();
  
  // Display drawing canvas and tools for the drawer
  showDrawingCanvas();
  
  // Hide the "wait for new game" message for the guesser
  hideWaitMessage();
}

// Function to handle a player joining mid-game
function joinMidGame() {
  if (isDrawer) {
    // Show a message to the player to wait for the new game to start
    showWaitMessage();
  } else {
    // Prevent access to drawing canvas and hide drawing tools for the guesser
    disableDrawingCanvas();
    
    // Check typed chat messages against the picked word
    // Simulate a match for now
    isMatched = true;
    
    // If it's a match, record a user round win
    if (isMatched) {
      userRoundWins++;
      displayUserWins();
    }
  }
}

// Function to generate a random word (you can replace this with your word list logic)
function generateRandomWord() {
  const words = ["apple", "banana", "cat", "dog", "elephant"];
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

// Function to start the timer countdown
function startTimer() {
  // Implement your timer logic here
}

// Function to display the drawing canvas and tools
function showDrawingCanvas() {
  // Implement code to show the drawing canvas and tools
}

// Function to hide the "wait for new game" message
function hideWaitMessage() {
  // Implement code to hide the wait message
}

// Function to disable drawing canvas and hide drawing tools
function disableDrawingCanvas() {
  // Implement code to disable drawing canvas and hide tools
}

// Function to display the user's round wins
function displayUserWins() {
  // Implement code to display the user's round wins
}

