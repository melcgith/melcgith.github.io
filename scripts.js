var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
// This corresponds to the number of cells in a row and in a column.
// Note: this value is hardcoded at many places. Changing it only here will create a lot of bugs.
var GAME_ENTRY_SIZE = 4;
// Enum defining the possible position of the hint values.
var HintPosition;
(function (HintPosition) {
    HintPosition[HintPosition["top"] = 0] = "top";
    HintPosition[HintPosition["left"] = 1] = "left";
    HintPosition[HintPosition["right"] = 2] = "right";
    HintPosition[HintPosition["bottom"] = 3] = "bottom";
})(HintPosition || (HintPosition = {}));
// This class represents the game.
var Game = /** @class */ (function () {
    function Game() {
        this.gameValues = generateGameValues();
        this.hintValues = computeAllHintValues(this.gameValues);
    }
    // Returns true if 2 game entries are equal otherwise return false
    Game.prototype.areEqual = function (entry1, entry2) {
        if (entry1.length !== entry2.length) {
            return false;
        }
        for (var i = 0; i < entry1.length; i++) {
            if (entry1[i] !== entry2[i]) {
                return false;
            }
        }
        return true;
    };
    // Returns the hint values for the selected position
    Game.prototype.getHintValues = function (position) {
        return this.hintValues[position];
    };
    // Returns the solution of the game
    Game.prototype.getSolution = function () {
        return this.gameValues;
    };
    // Validates the solution provided by the user
    Game.prototype.validate = function (values) {
        if (values.length !== this.gameValues.length) {
            return false;
        }
        for (var index = 0; index < values.length; index++) {
            if (!this.areEqual(values[index], this.gameValues[index])) {
                return false;
            }
        }
        return true;
    };
    return Game;
}());
// Global variable storing the game instance.
var currentGame;
// Returns all the cells of a specific row
function getGameRowCells(index) {
    var currentRow = document.getElementById("row".concat(index + 1));
    return currentRow.getElementsByTagName('td');
}
// Sets values in a specific row of the game table
function setGameRowValues(index, entry) {
    assert(index >= 0, "Index of row is negative!");
    var allCells = getGameRowCells(index);
    assert(entry.length === allCells.length, "Nb of values to set should equal the number of cells in the row");
    for (var index_1 = 0; index_1 < entry.length; index_1++) {
        allCells[index_1].textContent = entry[index_1];
    }
}
// Shows the solution of the game to the user.
function showSolution() {
    assert(currentGame, "Game not yet initialized!");
    var solution = currentGame.getSolution();
    for (var rowIndex = 0; rowIndex < solution.length; rowIndex++) {
        setGameRowValues(rowIndex, solution[rowIndex]);
    }
}
// Verifies the validity of the solution given by user.
function validateSolution() {
    assert(currentGame, "Game not yet initialized!");
    var userSolution = getAllUserInputs();
    var isValid = currentGame.validate(userSolution);
    var message = isValid ? "CONGRATULATIONS" : "FAIL";
    alert(message);
}
// Should be used when the functionality is not yet completed
function wip() {
    alert("Not implemented yet. Come back soon");
}
// Adds all the event listeners required for the game to work properly
function addAllEventListeners() {
    var selectDialog = document.getElementById("selectDialog");
    // Allow user to close the select dialog by clicking on the background.
    selectDialog.addEventListener('click', function (event) {
        if (event.target === selectDialog) {
            selectDialog.close();
        }
    });
    // Add event listener to all the buttons contained in the selectDialog
    var allButtons = selectDialog.getElementsByTagName('button');
    var _loop_1 = function (button) {
        button.addEventListener('click', function () {
            selectDialog.close(button.textContent);
        });
    };
    for (var _i = 0, allButtons_1 = allButtons; _i < allButtons_1.length; _i++) {
        var button = allButtons_1[_i];
        _loop_1(button);
    }
    var cellClickEventHandler = function (event) {
        var updateCellValue = function () {
            var cell = event.target;
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
    var columns = ["column1", "column2", "column3", "column4"];
    for (var _a = 0, columns_1 = columns; _a < columns_1.length; _a++) {
        var column = columns_1[_a];
        var cells = document.getElementsByClassName(column);
        for (var _b = 0, cells_1 = cells; _b < cells_1.length; _b++) {
            var cell = cells_1[_b];
            cell.addEventListener('click', cellClickEventHandler);
        }
    }
    // Add event listener to show game instructions
    var showGameInstructionsButton = document.getElementById("showInstructions");
    showGameInstructionsButton.addEventListener('click', showGameInstructions);
    // Add event listener to close the instructions dialog
    var hideGameInstructionsButton = document.getElementById("hideInstructions");
    hideGameInstructionsButton.addEventListener('click', function () {
        var instructionsDialog = document.getElementById("instructionsDialog");
        instructionsDialog.close();
    });
    // Add event listener to validate game values
    var validationButton = document.getElementById("validateInputs");
    validationButton.addEventListener('click', validateSolution);
    // Add event listener to show game solution
    var showSolutionButton = document.getElementById("seeSolution");
    showSolutionButton.addEventListener('click', showSolution);
}
var HINT_POSITION_BY_ID = (_a = {},
    _a[HintPosition.top] = "hint_top",
    _a[HintPosition.left] = "hint_left",
    _a[HintPosition.right] = "hint_right",
    _a[HintPosition.bottom] = "hint_bottom",
    _a);
function setHintValues(position, values) {
    var idValue = HINT_POSITION_BY_ID[position];
    var hintValuesParentElement = document.getElementById(idValue);
    // This is the base name used as class name for all the hint cells. It should always be in sync with the real class name associated to hint cells.
    var cellClassNameBase = "hint_cell";
    for (var index = 0; index < values.length; index++) {
        var cells = hintValuesParentElement.getElementsByClassName("".concat(cellClassNameBase).concat(index + 1));
        assert(cells.length === 1);
        cells[0].textContent = values[index];
    }
}
function showHintValues() {
    assert(currentGame !== null, "The game is not created yet.");
    // Set all hint values
    var allHintValuesPositions = [
        HintPosition.top,
        HintPosition.left,
        HintPosition.right,
        HintPosition.bottom,
    ];
    for (var _i = 0, allHintValuesPositions_1 = allHintValuesPositions; _i < allHintValuesPositions_1.length; _i++) {
        var hintPosition = allHintValuesPositions_1[_i];
        var hintValues = currentGame.getHintValues(hintPosition);
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
    // Initialize all the game values with default value
    var defaultValue = 0;
    var gameValues = Array.from({ length: GAME_ENTRY_SIZE }, function () { return Array.from({ length: GAME_ENTRY_SIZE }, function () { return defaultValue; }); });
    // We want to generate the random numbers in sub squares. When the size of the game table is odd, we will take the next size bigger than the half.
    var gameSizeIsEven = GAME_ENTRY_SIZE % 2 === 0;
    var sizeOfSubSquares = GAME_ENTRY_SIZE / 2 + (gameSizeIsEven ? 0 : 1);
    // Generate numbers for the first square
    var firstSquareRandomNumbers = new Array();
    for (var rowIndex = 0; rowIndex < sizeOfSubSquares; rowIndex++) {
        for (var columnIndex = 0; columnIndex < sizeOfSubSquares; columnIndex++) {
            var randomValue = getRandomValueForCell(rowIndex, columnIndex, gameValues);
            gameValues[rowIndex][columnIndex] = randomValue;
            firstSquareRandomNumbers.push(randomValue);
        }
    }
    // Generate numbers for the last square
    // The last square should contain the same numbers than the first one
    for (var rowIndex = GAME_ENTRY_SIZE - sizeOfSubSquares; rowIndex < GAME_ENTRY_SIZE; rowIndex++) {
        for (var columnIndex = GAME_ENTRY_SIZE - sizeOfSubSquares; columnIndex < GAME_ENTRY_SIZE; columnIndex++) {
            var randomValue = getRandomValueForCell(rowIndex, columnIndex, gameValues, firstSquareRandomNumbers);
            LOG("randomValue is ".concat(randomValue));
            // Remove the randomValue from the Array
            var randomValueIndex = firstSquareRandomNumbers.indexOf(randomValue);
            assert(randomValueIndex !== -1, "randomValue not found in valid values array");
            firstSquareRandomNumbers.splice(randomValueIndex, 1);
            gameValues[rowIndex][columnIndex] = randomValue;
            LOG("firstSquareRandomNumbers: ".concat(firstSquareRandomNumbers));
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
function computeHintValue(entry) {
    assert(entry.length > 0, "The entry is empty!");
    var hintValue = 0;
    // To make sure that all valid values will be greater than this initial value, we will set it to -1.
    var highestValue = -1;
    for (var _i = 0, entry_1 = entry; _i < entry_1.length; _i++) {
        var currentValue = entry_1[_i];
        if (currentValue > highestValue) {
            highestValue = currentValue;
            hintValue++;
        }
    }
    return hintValue;
}
// Shows the instructions on how to play the game
function showGameInstructions() {
    var instructionsDialog = document.getElementById("instructionsDialog");
    instructionsDialog.showModal();
}
// Returns the values of a specific column
function getColumnValues(columnIndex, values) {
    var columnValues = new Array();
    for (var index = 0; index < values.length; index++) {
        columnValues.push(values[index][columnIndex]);
    }
    return columnValues;
}
// Computes all the hint values (top, left, right and bottom)
function computeAllHintValues(gameValues) {
    var _a;
    var topHintValues = new Array();
    var bottomHintValues = new Array();
    // Fill top and bottom hint values
    for (var index = 0; index < GAME_ENTRY_SIZE; index++) {
        var columnValues = getColumnValues(index, gameValues);
        var topHintValue = computeHintValue(columnValues);
        topHintValues.push(topHintValue);
        var bottomHintValue = computeHintValue(columnValues.reverse());
        bottomHintValues.push(bottomHintValue);
    }
    var leftHintValues = new Array();
    var rightHintValues = new Array();
    // Fill the left and right hint values
    for (var index = 0; index < GAME_ENTRY_SIZE; index++) {
        // As we will use reverse on the array and that is changing the order on the original array, we are doing a copy here.
        var rowValues = __spreadArray([], gameValues[index], true);
        var leftHintValue = computeHintValue(rowValues);
        leftHintValues.push(leftHintValue);
        var rightHintValue = computeHintValue(rowValues.reverse());
        rightHintValues.push(rightHintValue);
    }
    var hintValues = (_a = {},
        _a[HintPosition.top] = topHintValues,
        _a[HintPosition.left] = leftHintValues,
        _a[HintPosition.right] = rightHintValues,
        _a[HintPosition.bottom] = bottomHintValues,
        _a);
    return hintValues;
}
// Returns the values entered by user in a specific row
function getGameRowValues(index) {
    var allCells = getGameRowCells(index);
    var data = new Array();
    for (var _i = 0, allCells_1 = allCells; _i < allCells_1.length; _i++) {
        var cell = allCells_1[_i];
        // Convert cell value into number using + operator
        var cellValue = +(cell.textContent);
        data.push(cellValue);
    }
    return data;
}
// Gets all the data inserted by the user
function getAllUserInputs() {
    var userData = new Array();
    for (var index = 0; index < GAME_ENTRY_SIZE; index++) {
        var gameEntry = getGameRowValues(index);
        userData.push(gameEntry);
    }
    return userData;
}
// Gets all the valid values that could be used to fill game table.
function getAllValidValues() {
    return Array.from({ length: GAME_ENTRY_SIZE }, function (_, i) { return i + 1; });
}
// Removes all the NaN and 0 values contained in the input array.
function RemoveInvalidValues(array) {
    return array.filter(function (item) { return item != NaN && item != 0; });
}
// Combines 2 arrays into 1 array with unique values.
function merge2Arrays(array1, array2) {
    return __spreadArray(__spreadArray([], array1, true), array2, true);
}
// Returns the difference between 2 arrays (elements in array1 that are not in array2).
function differenceOf2Arrays(array1, array2) {
    var map = new Map(array2.map(function (item) { return [item, true]; }));
    return array1.filter(function (item) { return !map.has(item); });
}
// Returns a number randomly choosed from a pool of values.
function randomSelectValue(valuesPool) {
    assert(valuesPool.length > 0, "Empty pool of values");
    if (valuesPool.length === 1) {
        return valuesPool[0];
    }
    var selectedIndex = getRandomNumber(0, valuesPool.length - 1);
    return valuesPool[selectedIndex];
}
// Returns a number that could be used as a valid entry for the specified cell position.
function getRandomValueForCell(rowIndex, columnIndex, gameData, validValues) {
    var rowValues = __spreadArray([], gameData[rowIndex], true);
    var columnValues = getColumnValues(columnIndex, gameData);
    var mergedValues = RemoveInvalidValues(merge2Arrays(rowValues, columnValues));
    var allValidValues = validValues !== null && validValues !== void 0 ? validValues : getAllValidValues();
    var potentialCandidates = differenceOf2Arrays(allValidValues, mergedValues);
    if (potentialCandidates.length === 0) {
        LOG("Unexpected situation:");
        LOG("All gameValues: ".concat(gameData));
        LOG("rowIndex: ".concat(rowIndex + 1, " and columnIndex: ").concat(columnIndex + 1));
        LOG("allValidValues: ".concat(allValidValues));
        LOG("rowValues: ".concat(rowValues));
        LOG("columnValues: ".concat(columnValues));
        LOG("mergedValues: ".concat(mergedValues));
        LOG("potentialCandidates: ".concat(potentialCandidates));
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
// Log debug information that are sometime cryptic and destinate to developers. The text to log will only be visible if the query parameter "?debug" is used.
function LOG(text) {
    //const urlParams = new URLSearchParams(window.location.search);
    //const debugActivated = urlParams.has("debug");
    //if (debugActivated){
    console.log(text);
    //}
}
// Log informative data that could be useful to user.
function INFO(text) {
    console.log(text);
}
