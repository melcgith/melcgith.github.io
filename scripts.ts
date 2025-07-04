// This corresponds to the number of cells in a row and in a column.
// Note: this value is hardcoded at many places. Changing it only here will create a lot of bugs.
const GAME_ENTRY_SIZE = 4;

// Defines an entry for the game. An entry could be all the values in a row or a column.
type GameEntry = Array<number>;

// Enum defining the possible position of the hint values.
enum HintPosition {
  top = 0,
  left = 1,
  right = 2,
  bottom = 3
}

// This class represents the game.
class Game {
  // Stores all the hint values for the current game
  private hintValues: Record<HintPosition, GameEntry>;
  
  // Stores all the values should enter to complete the game
  private gameValues: Array<GameEntry>;
  
  constructor() {
    this.gameValues = generateGameValues();
    this.hintValues = computeAllHintValues(this.gameValues);
  }
  
  // Returns true if 2 game entries are equal otherwise return false
  private areEqual(entry1: GameEntry, entry2: GameEntry): boolean{
    if (entry1.length !== entry2.length){
      return false;
    }
    for (let i=0; i < entry1.length; i++)
    {
      if (entry1[i] !== entry2[i]){
        return false;
      }
    }
    return true;
  }
  
  // Returns the hint values for the selected position
  public getHintValues(position: HintPosition): GameEntry {
    return this.hintValues[position];
  }
  
  // Returns the solution of the game
  public getSolution() : Array<GameEntry> {
    return this.gameValues;
  }
  
  // Validates the solution provided by the user
  public validate(values:Array<GameEntry>): boolean {
    if (values.length !== this.gameValues.length){
      return false;
    }
    for(let index = 0; index < values.length; index++){
      if (!this.areEqual(values[index], this.gameValues[index])){
        return false;
      }
    }
    return true;
  }
}

// Global variable storing the game instance.
let currentGame : Game | undefined;

// Returns all the cells of a specific row
function getGameRowCells(index: number){
  const currentRow = document.getElementById(`row${index+1}`);
  return currentRow.getElementsByTagName('td');
}

// Sets values in a specific row of the game table
function setGameRowValues(index: number, entry: GameEntry) : void {
  assert(index >= 0, "Index of row is negative!")
  const allCells = getGameRowCells(index);
  assert(entry.length === allCells.length, "Nb of values to set should equal the number of cells in the row");
  for (let index=0; index < entry.length; index++){
    allCells[index].textContent = entry[index];
  }
}

// Shows the solution of the game to the user.
function showSolution() : void {
  assert(currentGame, "Game not yet initialized!");
  const solution = currentGame.getSolution();
  for (let rowIndex = 0; rowIndex < solution.length; rowIndex++) {
    setGameRowValues(rowIndex, solution[rowIndex]);
  }
}

// Verifies the validity of the solution given by user.
function validateSolution() : void {
  assert(currentGame, "Game not yet initialized!");
  const userSolution = getAllUserInputs();
  const isValid = currentGame.validate(userSolution);
  const message = isValid ? "CONGRATULATIONS" : "FAIL";
  alert(message);
}

// Should be used when the functionality is not yet completed
function wip() {
  alert("Not implemented yet. Come back soon");
}

// Adds all the event listeners required for the game to work properly
function addAllEventListeners() : void {
  const selectDialog = document.getElementById("selectDialog");
   // Allow user to close the select dialog by clicking on the background.
  selectDialog.addEventListener('click', (event) => {
    if (event.target === selectDialog){
      selectDialog.close();
    }
  });
  
  // Add event listener to all the buttons contained in the selectDialog
  const allButtons = selectDialog.getElementsByTagName('button');
  for (const button of allButtons){
    button.addEventListener('click', () => {
      selectDialog.close(button.textContent);
    });
  }
  
  const cellClickEventHandler = (event) => {
  const updateCellValue = () => {
    const cell = event.target;
    if (selectDialog.returnValue){
      cell.innerHTML = selectDialog.returnValue;
    }
    selectDialog.removeEventListener('close', updateCellValue);
  }
    selectDialog.addEventListener('close', updateCellValue);
  
    // Show value selection dialog
    selectDialog.showModal();
  };
  
  // Add event listeners to all the cells in the game table.
  const columns = ["column1", "column2", "column3", "column4"];
  for (const column of columns){
    let cells = document.getElementsByClassName(column);
    for (const cell of cells) {
      cell.addEventListener('click', cellClickEventHandler);
    }
  }
  
  // Add event listener to show game instructions
  const showGameInstructionsButton = document.getElementById("showInstructions");
  showGameInstructionsButton.addEventListener('click', showGameInstructions);
  
  // Add event listener to close the instructions dialog
  const hideGameInstructionsButton = document.getElementById("hideInstructions");
  hideGameInstructionsButton.addEventListener('click', () {
    const instructionsDialog = document.getElementById("instructionsDialog");
    instructionsDialog.close();
  });
  
  // Add event listener to validate game values
  const validationButton = document.getElementById("validateInputs");
  validationButton.addEventListener('click', validateSolution);
  
  // Add event listener to show game solution
  const showSolutionButton = document.getElementById("seeSolution");
  showSolutionButton.addEventListener('click', showSolution);
}

const HINT_POSITION_BY_ID : Record<HintPosition, string> = {
  [HintPosition.top] : "hint_top",
  [HintPosition.left] : "hint_left",
  [HintPosition.right] : "hint_right",
  [HintPosition.bottom] : "hint_bottom",
};

function setHintValues(position: HintPosition, values : GameEntry) : void {
  const idValue = HINT_POSITION_BY_ID[position];
  const hintValuesParentElement = document.getElementById(idValue);
  // This is the base name used as class name for all the hint cells. It should always be in sync with the real class name associated to hint cells.
  const cellClassNameBase = "hint_cell";
  for (let index = 0; index < values.length; index++){
    const cells = hintValuesParentElement.getElementsByClassName(`${cellClassNameBase}${index+1}`);
    assert(cells.length === 1);
    cells[0].textContent = values[index];
  }
}

function showHintValues() : void {
  assert(currentGame !== null, "The game is not created yet.");
  // Set all hint values
  const allHintValuesPositions = [
    HintPosition.top,
    HintPosition.left,
    HintPosition.right,
    HintPosition.bottom,
    ];
  for (const hintPosition of allHintValuesPositions) {
    const hintValues = currentGame.getHintValues(hintPosition);
    setHintValues(hintPosition, hintValues);
  }
}

function initializeGame(event) : void {
  currentGame = new Game();
  showHintValues();
  addAllEventListeners();
};

window.addEventListener('load', initializeGame);

// Generates all the values for the game
function generateGameValues() : Array<GameEntry> {
  // Initialize all the game values with default value
  const defaultValue = 0
  const gameValues: Array<GameEntry> = Array.from({length: GAME_ENTRY_SIZE}, () => Array.from({length: GAME_ENTRY_SIZE}, () => defaultValue));
  
  // We want to generate the random numbers in sub squares. When the size of the game table is odd, we will take the next size bigger than the half.
  const gameSizeIsEven = GAME_ENTRY_SIZE % 2 === 0;
  const sizeOfSubSquares = GAME_ENTRY_SIZE / 2 + (gameSizeIsEven ? 0 : 1);
  
  // Generate numbers for the first square
  const firstSquareRandomNumbers = new Array<number>();
  
  for (let rowIndex = 0; rowIndex < sizeOfSubSquares; rowIndex++) {
    for (let columnIndex = 0; columnIndex < sizeOfSubSquares; columnIndex++) {
      const randomValue = getRandomValueForCell(rowIndex, columnIndex, gameValues);
    gameValues[rowIndex][columnIndex] = randomValue;
    firstSquareRandomNumbers.push(randomValue);
    }
  }
  
  // Generate numbers for the last square
  // The last square should contain the same numbers than the first one
  for (let rowIndex = GAME_ENTRY_SIZE-sizeOfSubSquares; rowIndex < GAME_ENTRY_SIZE; rowIndex++) {
    for (let columnIndex = GAME_ENTRY_SIZE-sizeOfSubSquares; columnIndex < GAME_ENTRY_SIZE; columnIndex++){
      const randomValue = getRandomValueForCell(rowIndex, columnIndex, gameValues, firstSquareRandomNumbers);
      LOG(`randomValue is ${randomValue}`)
      // Remove the randomValue from the Array
      const randomValueIndex = firstSquareRandomNumbers.indexOf(randomValue);
      assert(randomValueIndex !== -1, "randomValue not found in valid values array");
      firstSquareRandomNumbers.splice(randomValueIndex, 1);
    gameValues[rowIndex][columnIndex] = randomValue;
      LOG(`firstSquareRandomNumbers: ${firstSquareRandomNumbers}`);
    }
  }
  
  // Generate random numbers for the remaining 
  //for (let rowIndex = 0; rowIndex < GAME_ENTRY_SIZE; rowIndex++){
    //for (let columnIndex = 0; columnIndex < GAME_ENTRY_SIZE; columnIndex++){
      // only generate numbers for non initialized cells
      //if (gameValues[rowIndex][columnIndex] === 0){
        //const randomValue = getRandomValueForCell(rowIndex, columnIndex, gameValues);
    //gameValues[rowIndex][columnIndex] = randomValue;
      //}
    //}
  //}
  return gameValues;
}

// Returns the number of values that are bigger than the precedent ones in the input game entry. The order of verification is from the lower indexes to the higher indexes.
function computeHintValue(entry: GameEntry) : number {
  assert(entry.length > 0, "The entry is empty!")
  let hintValue = 0;
  // To make sure that all valid values will be greater than this initial value, we will set it to -1.
  let highestValue = -1;
  for (const currentValue of entry) {
    if (currentValue > highestValue){
      highestValue = currentValue;
      hintValue++;
    }
  }
  return hintValue;
}

// Shows the instructions on how to play the game
function showGameInstructions() {
  const instructionsDialog = document.getElementById("instructionsDialog");
  instructionsDialog.showModal();
}

// Returns the values of a specific column
function getColumnValues(columnIndex: number, values: Array<GameEntry>) : GameEntry {
  const columnValues = new Array<number>();
  for (let index=0; index < values.length; index++) {
    columnValues.push(values[index][columnIndex]);
  }
  return columnValues;
}

// Computes all the hint values (top, left, right and bottom)
function computeAllHintValues(gameValues: Array<GameEntry>) : Record<HintPosition, GameEntry> {
  const topHintValues = new Array<number>();
  const bottomHintValues = new Array<number>();
  // Fill top and bottom hint values
  for (let index=0; index < GAME_ENTRY_SIZE; index++){
    const columnValues = getColumnValues(index, gameValues);
    const topHintValue = computeHintValue(columnValues);
    topHintValues.push(topHintValue);
    const bottomHintValue = computeHintValue(columnValues.reverse());
    bottomHintValues.push(bottomHintValue);
  }
  const leftHintValues = new Array<number>();
  const rightHintValues = new Array<number>();
  // Fill the left and right hint values
  for (let index=0; index < GAME_ENTRY_SIZE; index++){
    // As we will use reverse on the array and that is changing the order on the original array, we are doing a copy here.
    const rowValues = [...gameValues[index]];
    const leftHintValue = computeHintValue(rowValues);
    leftHintValues.push(leftHintValue);
    const rightHintValue = computeHintValue(rowValues.reverse());
    rightHintValues.push(rightHintValue);
  }
  const hintValues: Record<HintPosition, GameEntry> = {
    [HintPosition.top] : topHintValues,
    [HintPosition.left] : leftHintValues,
    [HintPosition.right] : rightHintValues,
    [HintPosition.bottom] : bottomHintValues,
  };
  return hintValues;
}

// Returns the values entered by user in a specific row
function getGameRowValues(index: number) : GameEntry {
  const allCells = getGameRowCells(index);
  const data = new Array<number>();
  for (const cell of allCells) {
    // Convert cell value into number using + operator
    const cellValue: number = +(cell.textContent);
    data.push(cellValue);
  }
  return data;
}

// Gets all the data inserted by the user
function getAllUserInputs() : Array<GameEntry> {
  const userData = new Array<Array<number>>();
  for (let index = 0; index < GAME_ENTRY_SIZE; index++){
    const gameEntry = getGameRowValues(index);
    userData.push(gameEntry);
  }
  return userData;
}

// Gets all the valid values that could be used to fill game table.
function getAllValidValues() : Array<number> {
  return Array.from({length: GAME_ENTRY_SIZE}, (_, i) => i+1);
}

// Removes all the NaN and 0 values contained in the input array.
function RemoveInvalidValues(array: GameEntry) : GameEntry {
  return array.filter((item) => item != NaN && item != 0);
}

// Combines 2 arrays into 1 array with unique values.
function merge2Arrays(array1: GameEntry, array2: GameEntry) : GameEntry {
  return [...array1, ...array2];
}

// Returns the difference between 2 arrays (elements in array1 that are not in array2).
function differenceOf2Arrays(array1: GameEntry, array2: GameEntry) : GameEntry {
  const map = new Map(array2.map(item => [item, true]));
  return array1.filter(item => !map.has(item));
}

// Returns a number randomly choosed from a pool of values.
function randomSelectValue(valuesPool: Array<number>) : number {
  assert(valuesPool.length > 0, "Empty pool of values");
  if (valuesPool.length === 1){
    return valuesPool[0];
  }
  const selectedIndex = getRandomNumber(0, valuesPool.length-1);
  return valuesPool[selectedIndex];
}

// Returns a number that could be used as a valid entry for the specified cell position.
function getRandomValueForCell(rowIndex: number, columnIndex: number, gameData: Array<GameEntry>, validValues: Array<number> | undefined) : number {
  const rowValues = [...gameData[rowIndex]];
  const columnValues = getColumnValues(columnIndex, gameData);
  const mergedValues = RemoveInvalidValues(merge2Arrays(rowValues, columnValues));
  const allValidValues = validValues ?? getAllValidValues();
  const potentialCandidates = differenceOf2Arrays(allValidValues, mergedValues);
  if (potentialCandidates.length === 0){
    LOG("Unexpected situation:");
    LOG(`All gameValues: ${gameData}`);
    LOG(`rowIndex: ${rowIndex+1} and columnIndex: ${columnIndex+1}`);
    LOG(`allValidValues: ${allValidValues}`);
    LOG(`rowValues: ${rowValues}`);
    LOG(`columnValues: ${columnValues}`);
    LOG(`mergedValues: ${mergedValues}`);
    LOG(`potentialCandidates: ${potentialCandidates}`);
  }
  return randomSelectValue(potentialCandidates);
}

// Generates a random number between 2 values (min for the smallest value and max for the biggest value)
function getRandomNumber(min: number, max: number) : number {
  assert(max > min, "The max value is smaller than min value");
  return Math.round(Math.random()*(max-min))+min;
}

// Function used to ensure that the assumptions done during implementation are valid everytime.
function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) throw new Error(msg);
}

// Log debug information that are sometime cryptic and destinate to developers. The text to log will only be visible if the query parameter "?debug" is used.
function LOG(text: string) : void {
  //const urlParams = new URLSearchParams(window.location.search);
  //const debugActivated = urlParams.has("debug");
  //if (debugActivated){
    console.log(text);
  //}
}

// Log informative data that could be useful to user.
function INFO(text: string) : void {
  console.log(text);
}