"use strict";
// This corresponds to the number of cells in a row and in a column.
// Note: this value is hardcoded at many places. Changing it only here will create a lot of bugs.
const GAME_ENTRY_SIZE = 4;
// Enum defining the possible position of the hint values.
var HintPosition;
(function (HintPosition) {
    HintPosition[HintPosition["top"] = 0] = "top";
    HintPosition[HintPosition["left"] = 1] = "left";
    HintPosition[HintPosition["right"] = 2] = "right";
    HintPosition[HintPosition["bottom"] = 3] = "bottom";
})(HintPosition || (HintPosition = {}));
// Log debug information that are sometime cryptic and destinate to developers. The text to log will only be visible if the query parameter "?debug" is used.
function LOG(text) {
    //const urlParams = new URLSearchParams(window.location.search);
    //const debugActivated = urlParams.has("debug");
    //if (debugActivated){
    console.log(text);
    //}
}
// This class represents the game.
class Game {
    constructor() {
        LOG("Creating new game");
        this.gameValues = generateGameValues();
        this.hintValues = computeAllHintValues(this.gameValues);
    }
    // Returns true if 2 game entries are equal otherwise return false
    areEqual(entry1, entry2) {
        if (entry1.length !== entry2.length) {
            return false;
        }
        for (let i = 0; i < entry1.length; i++) {
            if (entry1[i] !== entry2[i]) {
                return false;
            }
        }
        return true;
    }
    // Returns the hint values for the selected position
    getHintValues(position) {
        return this.hintValues[position];
    }
    // Returns the solution of the game
    getSolution() {
        return this.gameValues;
    }
    // Validates the solution provided by the user
    validate(values) {
        if (values.length !== this.gameValues.length) {
            return false;
        }
        for (let index = 0; index < values.length; index++) {
            if (!this.areEqual(values[index], this.gameValues[index])) {
                return false;
            }
        }
        return true;
    }
}
// Global variable storing the game instance.
let currentGame;
// Returns all the cells of a specific row
function getGameRowCells(index) {
    const currentRow = document.getElementById(`row${index + 1}`);
    assert(currentRow, `Row with index ${index} not found!`);
    return currentRow.getElementsByTagName('td');
}
// Sets values in a specific row of the game table
function setGameRowValues(index, entry) {
    assert(index >= 0, "Index of row is negative!");
    const allCells = getGameRowCells(index);
    assert(entry.length === allCells.length, "Nb of values to set should equal the number of cells in the row");
    for (let index = 0; index < entry.length; index++) {
        allCells[index].textContent = entry[index].toString();
    }
}
// Shows the solution of the game to the user.
function showSolution() {
    assert(currentGame, "Game not yet initialized!");
    const solution = currentGame.getSolution();
    for (let rowIndex = 0; rowIndex < solution.length; rowIndex++) {
        setGameRowValues(rowIndex, solution[rowIndex]);
    }
}
// Verifies the validity of the solution given by user.
function validateSolution() {
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
function addAllEventListeners() {
    const selectDialog = document.getElementById("selectDialog");
    assert(selectDialog, "Select dialog not found!");
    // Allow user to close the select dialog by clicking on the background.
    selectDialog.addEventListener('click', (event) => {
        if (event.target === selectDialog) {
            selectDialog.close();
        }
    });
    // Add event listener to all the buttons contained in the selectDialog
    const allButtons = selectDialog.getElementsByTagName('button');
    for (const button of Array.from(allButtons)) {
        button.addEventListener('click', () => {
            selectDialog.close(button.textContent);
        });
    }
    const cellClickEventHandler = (event) => {
        const updateCellValue = () => {
            const cell = event.target;
            if (selectDialog.returnValue) {
                cell.innerHTML = selectDialog.returnValue;
            }
            selectDialog.removeEventListener('close', updateCellValue);
        };
        selectDialog.addEventListener('close', updateCellValue);
        // Show value selection dialog
        selectDialog.showModal();
    };
    // Add event listeners to all the cells in the game table.
    const columns = ["column1", "column2", "column3", "column4"];
    for (const column of columns) {
        let cells = document.getElementsByClassName(column);
        for (const cell of Array.from(cells)) {
            cell.addEventListener('click', cellClickEventHandler);
        }
    }
    // Add event listener to show game instructions
    const showGameInstructionsButton = document.getElementById("showInstructions");
    assert(showGameInstructionsButton, "Show instructions button not found!");
    showGameInstructionsButton.addEventListener('click', showGameInstructions);
    // Add event listener to close the instructions dialog
    const hideGameInstructionsButton = document.getElementById("hideInstructions");
    assert(hideGameInstructionsButton, "Hide instructions button not found!");
    hideGameInstructionsButton.addEventListener('click', () => {
        const instructionsDialog = document.getElementById("instructionsDialog");
        instructionsDialog.close();
    });
    // Add event listener to validate game values
    const validationButton = document.getElementById("validateInputs");
    assert(validationButton, "Validation button not found!");
    validationButton.addEventListener('click', validateSolution);
    // Add event listener to show game solution
    const showSolutionButton = document.getElementById("seeSolution");
    assert(showSolutionButton, "Show solution button not found!");
    showSolutionButton.addEventListener('click', showSolution);
}
const HINT_POSITION_BY_ID = {
    [HintPosition.top]: "hint_top",
    [HintPosition.left]: "hint_left",
    [HintPosition.right]: "hint_right",
    [HintPosition.bottom]: "hint_bottom",
};
function setHintValues(position, values) {
    const idValue = HINT_POSITION_BY_ID[position];
    const hintValuesParentElement = document.getElementById(idValue);
    assert(hintValuesParentElement, `Hint values parent element not found for id ${idValue}`);
    // This is the base name used as class name for all the hint cells. It should always be in sync with the real class name associated to hint cells.
    const cellClassNameBase = "hint_cell";
    for (let index = 0; index < values.length; index++) {
        const cells = hintValuesParentElement.getElementsByClassName(`${cellClassNameBase}${index + 1}`);
        assert(cells.length === 1);
        cells[0].textContent = values[index].toString();
    }
}
function showHintValues() {
    assert(currentGame !== undefined, "The game is not created yet.");
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
function initializeGame(event) {
    currentGame = new Game();
    showHintValues();
    addAllEventListeners();
}
;
window.addEventListener('load', initializeGame);
// Generates all the values for the game
function generateGameValues() {
    const defaultValue = 0;
    const gameValues = Array.from({ length: GAME_ENTRY_SIZE }, () => Array.from({ length: GAME_ENTRY_SIZE }, () => defaultValue));
    const allValidValues = getAllValidValues();
    // Helper function to check if a value is valid for a specific cell
    const isValid = (rowIndex, columnIndex, value) => {
        // Check row
        if (gameValues[rowIndex].includes(value))
            return false;
        // Check column
        const columnValues = getColumnValues(columnIndex, gameValues);
        if (columnValues.includes(value))
            return false;
        /*// Check sub-square
        const subSquareSize = Math.ceil(GAME_ENTRY_SIZE / 2);
        const startRow = Math.floor(rowIndex / subSquareSize) * subSquareSize;
        const startCol = Math.floor(columnIndex / subSquareSize) * subSquareSize;
        for (let i = startRow; i < startRow + subSquareSize; i++) {
          for (let j = startCol; j < startCol + subSquareSize; j++) {
            if (gameValues[i][j] === value) return false;
          }
        }*/
        return true;
    };
    // Backtracking function to fill the game board
    const fillBoard = (rowIndex, columnIndex) => {
        LOG(`Filling cell at row ${rowIndex}, column ${columnIndex}`);
        if (rowIndex === GAME_ENTRY_SIZE)
            return true; // All rows filled
        const nextRow = columnIndex === GAME_ENTRY_SIZE - 1 ? rowIndex + 1 : rowIndex;
        const nextCol = (columnIndex + 1) % GAME_ENTRY_SIZE;
        for (const value of shuffleArray([...allValidValues])) {
            if (isValid(rowIndex, columnIndex, value)) {
                gameValues[rowIndex][columnIndex] = value;
                if (fillBoard(nextRow, nextCol)) {
                    return true;
                }
                // Backtrack
                gameValues[rowIndex][columnIndex] = defaultValue;
            }
        }
        LOG(`Backtracking from row ${rowIndex}, column ${columnIndex}`);
        return false; // No valid value found
    };
    const success = fillBoard(0, 0);
    assert(success, "Failed to generate a valid game board");
    return gameValues;
}
// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// Returns the number of values that are bigger than the precedent ones in the input game entry. The order of verification is from the lower indexes to the higher indexes.
function computeHintValue(entry) {
    assert(entry.length > 0, "The entry is empty!");
    let hintValue = 0;
    // To make sure that all valid values will be greater than this initial value, we will set it to -1.
    let highestValue = -1;
    for (const currentValue of entry) {
        if (currentValue > highestValue) {
            highestValue = currentValue;
            hintValue++;
        }
    }
    return hintValue;
}
// Shows the instructions on how to play the game
function showGameInstructions() {
    const instructionsDialog = document.getElementById("instructionsDialog");
    assert(instructionsDialog, "Instructions dialog not found!");
    instructionsDialog.showModal();
}
// Returns the values of a specific column
function getColumnValues(columnIndex, values) {
    const columnValues = new Array();
    for (let index = 0; index < values.length; index++) {
        columnValues.push(values[index][columnIndex]);
    }
    return columnValues;
}
// Computes all the hint values (top, left, right and bottom)
function computeAllHintValues(gameValues) {
    const topHintValues = new Array();
    const bottomHintValues = new Array();
    // Fill top and bottom hint values
    for (let index = 0; index < GAME_ENTRY_SIZE; index++) {
        const columnValues = getColumnValues(index, gameValues);
        const topHintValue = computeHintValue(columnValues);
        topHintValues.push(topHintValue);
        const bottomHintValue = computeHintValue(columnValues.reverse());
        bottomHintValues.push(bottomHintValue);
    }
    const leftHintValues = new Array();
    const rightHintValues = new Array();
    // Fill the left and right hint values
    for (let index = 0; index < GAME_ENTRY_SIZE; index++) {
        // As we will use reverse on the array and that is changing the order on the original array, we are doing a copy here.
        const rowValues = [...gameValues[index]];
        const leftHintValue = computeHintValue(rowValues);
        leftHintValues.push(leftHintValue);
        const rightHintValue = computeHintValue(rowValues.reverse());
        rightHintValues.push(rightHintValue);
    }
    const hintValues = {
        [HintPosition.top]: topHintValues,
        [HintPosition.left]: leftHintValues,
        [HintPosition.right]: rightHintValues,
        [HintPosition.bottom]: bottomHintValues,
    };
    return hintValues;
}
// Returns the values entered by user in a specific row
function getGameRowValues(index) {
    const allCells = getGameRowCells(index);
    const data = new Array();
    for (const cell of Array.from(allCells)) {
        // Convert cell value into number using + operator
        const cellValue = +(cell.textContent);
        data.push(cellValue);
    }
    return data;
}
// Gets all the data inserted by the user
function getAllUserInputs() {
    const userData = new Array();
    for (let index = 0; index < GAME_ENTRY_SIZE; index++) {
        const gameEntry = getGameRowValues(index);
        userData.push(gameEntry);
    }
    return userData;
}
// Gets all the valid values that could be used to fill game table.
function getAllValidValues() {
    return Array.from({ length: GAME_ENTRY_SIZE }, (_, i) => i + 1);
}
// Removes all the NaN and 0 values contained in the input array.
function RemoveInvalidValues(array) {
    return array.filter((item) => item != 0);
}
// Combines 2 arrays into 1 array with unique values.
function merge2Arrays(array1, array2) {
    return [...array1, ...array2];
}
// Returns the difference between 2 arrays (elements in array1 that are not in array2).
function differenceOf2Arrays(array1, array2) {
    const map = new Map(array2.map(item => [item, true]));
    return array1.filter(item => !map.has(item));
}
// Returns a number randomly choosed from a pool of values.
function randomSelectValue(valuesPool) {
    assert(valuesPool.length > 0, "Empty pool of values");
    if (valuesPool.length === 1) {
        return valuesPool[0];
    }
    const selectedIndex = getRandomNumber(0, valuesPool.length - 1);
    return valuesPool[selectedIndex];
}
// Returns a number that could be used as a valid entry for the specified cell position.
function getRandomValueForCell(rowIndex, columnIndex, gameData, validValues = undefined) {
    const rowValues = [...gameData[rowIndex]];
    const columnValues = getColumnValues(columnIndex, gameData);
    const mergedValues = RemoveInvalidValues(merge2Arrays(rowValues, columnValues));
    const allValidValues = validValues !== null && validValues !== void 0 ? validValues : getAllValidValues();
    const potentialCandidates = differenceOf2Arrays(allValidValues, mergedValues);
    if (potentialCandidates.length === 0) {
        LOG("Unexpected situation:");
        LOG(`All gameValues: ${gameData}`);
        LOG(`rowIndex: ${rowIndex + 1} and columnIndex: ${columnIndex + 1}`);
        LOG(`allValidValues: ${allValidValues}`);
        LOG(`rowValues: ${rowValues}`);
        LOG(`columnValues: ${columnValues}`);
        LOG(`mergedValues: ${mergedValues}`);
        LOG(`potentialCandidates: ${potentialCandidates}`);
    }
    return randomSelectValue(potentialCandidates);
}
// Generates a random number between 2 values (min for the smallest value and max for the biggest value)
function getRandomNumber(min, max) {
    assert(max > min, "The max value is smaller than min value");
    return Math.round(Math.random() * (max - min)) + min;
}
// Function used to ensure that the assumptions done during implementation are valid everytime.
function assert(condition, msg) {
    if (!condition)
        throw new Error(msg);
}
// Log informative data that could be useful to user.
function INFO(text) {
    console.log(text);
}
