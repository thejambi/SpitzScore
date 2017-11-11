
var playerNames = ["", "", "", "", ""];
var playerScores = [0, 0, 0, 0, 0];

var callingPlayer = 0;
var call = ["", ""];
var blackQueensTeam = new Array();

var numAces = 0;
var numTens = 0;
var numKings = 0;
var numQueens = 0;
var numJacks = 0;

var cardPoints  = 0;

var qPointsEarned = 0;

var noTricks = false;
var allTricks = false;

var storage = window.localStorage;

for (var i = 1; i <= 4; i++) {
	document.getElementById("nameInput" + i).value = storage.getItem("playerName" + i);
}

// Keys
var savedGameKey = "savedGame";
var playerNameKey = "playerName";	// To add player num after
var playerScoreKey = "playerScore";	// To add player num after
var dealerKey = "dealer";

if (storage.getItem(savedGameKey) == "true") {
	startGame();
} else {
	document.getElementById("playerEntryContainer").className = "topLevelShown";
}

function startGame() {
	// Get player names
	for (var i = 1; i <= 4; i++) {
		playerNames[i] = document.getElementById("nameInput" + i).value;
		if (playerNames[i] === "") {
			return;
		}
		document.getElementById("nameDisp" + i).textContent = playerNames[i];
		storage.setItem(playerNameKey + i, playerNames[i]);
		
		if (!isNaN(parseInt(storage.getItem(playerScoreKey + i)))) {
			playerScores[i] = parseInt(storage.getItem(playerScoreKey + i));
		}
	}

	// Fire it up
	showContainer("mainContainer");
	showEndGameButton();
	storage.setItem(savedGameKey, "true");
	updatePlayerScores();
	resetHand();
}

function hideContainers() {
	var containerIds = [];
	containerIds.push('playerEntryContainer');
	containerIds.push('mainContainer');
	containerIds.push('rulesContainer');
	containerIds.push('playChartContainer');

	for (var index in containerIds) {
		var containerId = containerIds[index];
		document.getElementById(containerId).classList.remove('topLevelShown');
		document.getElementById(containerId).classList.add('topLevelHidden');
	}
}

function showContainer(containerId) {
	hideContainers();
	document.getElementById(containerId).classList.remove('topLevelHidden');
	document.getElementById(containerId).classList.add('topLevelShown');
}

function deactivateTabs() {
	var tabIds = [];
	tabIds.push('scoreNav');
	tabIds.push('rulesNav');
	tabIds.push('playChartNav');

	for (var index in tabIds) {
		var id = tabIds[index];
		document.getElementById(id).classList.remove('active');
	}
}

function setActiveTab(theTab) {
	deactivateTabs();
	theTab.classList.add("active");
}

function setNavTab(theTab, containerIdToShow) {
	if (containerIdToShow === 'mainContainer' && storage.getItem(savedGameKey) != "true") {
		containerIdToShow = 'playerEntryContainer';
	}
	showContainer(containerIdToShow);
	setActiveTab(theTab);
}

function initiateCall(playerNum) {
	var shown = document.getElementById("callSelection").className === "callSelectionShown";
	if (shown) {
		document.getElementById("callSelection").className = "callSelectionHidden";
	} else {
		document.getElementById("callSelection").className = "callSelectionShown";
	}
	
	callingPlayer = playerNum;
}

function resetCallIndicators() {
	call = ["", ""];
	for (var i = 1; i <= 4; i++) {
		var elem = document.getElementById("callIndicator" + i);
		elem.className = "callIndicator";
		elem.textContent = "+";
	}
}

function resetBlackQueenIndicators() {
	blackQueensTeam = new Array();
	for (var i = 1; i <= 4; i++) {
		document.getElementById("queenIndicator" + i).className = "queenIndicator";
	}
}

function updatePlayerScores() {
	for (var i = 1; i <= 4; i++) {
		document.getElementById("scoreDisp" + i).textContent = playerScores[i]; // storage.getItem(playerScoreKey + i);
	}
}

function shadowNumCards() {
	var cardNames = ["Aces", "Tens", "Kings", "Queens", "Jacks"];

	for (var i = 0; i < cardNames.length; i++) {
		setNumCards(cardNames[i], 0, false);
		document.getElementById("0" + cardNames[i]).className = "ptOff";
	}
}

function selectAllNumCards() {
	var cardNames = ["Aces", "Tens", "Kings", "Queens", "Jacks"];

	for (var i = 0; i < cardNames.length; i++) {
		setNumCards(cardNames[i], 4, false);
	}
}

function setAllNumCardsZero() {
	var cardNames = ["Aces", "Tens", "Kings", "Queens", "Jacks"];

	for (var i = 0; i < cardNames.length; i++) {
		setNumCards(cardNames[i], 0, true);
	}
}

function disableApplyBtn() {
	document.getElementById("applyPointsDiv").className = "disabled";
}

function setNoTricks() {
	disableApplyBtn();

	if (call[1] == "P" || call[1] == "S" || call[1] == "") {
		setAllNumCardsZero();
		return;
	}

	noTricks = true;
	allTricks = false;

	document.getElementById("noTricksDiv").className = "ptOn";
	document.getElementById("allTricksDiv").className = "ptOff";

	shadowNumCards();

	updateCardPointsEarned();
	updateQPointsEarned();
}

function setAllTricks() {
	disableApplyBtn();

	noTricks = false;
	allTricks = true;

	document.getElementById("noTricksDiv").className = "ptOff";
	document.getElementById("allTricksDiv").className = "ptOn";

	selectAllNumCards();

	updateCardPointsEarned();
	updateQPointsEarned();
}

function resetNoTricksAllTricks() {
	document.getElementById("noTricksDiv").className = "ptOff";
	document.getElementById("allTricksDiv").className = "ptOff";
	noTricks = false;
	allTricks = false;
}

function resetHand() {
	resetCallIndicators();
	resetBlackQueenIndicators();
	// shadowNumCards();
	setAllNumCardsZero();
	resetNoTricksAllTricks();
	document.getElementById("pointsEarnedDiv").textContent = "Card Points: 0";
	document.getElementById("QPtsEarnedDiv").textContent = "Q Points: 0";
}

function okToApplyPoints() {
	// Validate
	if (call[1] == "P" || call[1] == "") {
		if (blackQueensTeam.length == 2) {
			return true;
		}
	} else if (call[1] == "S" || call[1] == "Z" || call[1] == "ZS" || call[1] == "ZSS") {
		return true;
	} else {
		return false;
	}
}

var applyPtsTimeout = 0;

function applyPoints() {
	if (!okToApplyPoints()) {
		return;
	}

	clearTimeout(applyPtsTimeout);

	var elem = document.getElementById("applyPointsDiv");
	if (elem.className == "disabled") {
		elem.className = "enabled";
		applyPtsTimeout = setTimeout(function() {
			elem.className = "disabled";
		}, 2000);
		return;
	}

	if (qPointsEarned >= 0) {
		var numQs = blackQueensTeam.length;
		var p = 0;
		for (var i = 0; i < numQs; i++) {
			p = blackQueensTeam[i];
			playerScores[p] += qPointsEarned;
			storage.setItem(playerScoreKey + p, playerScores[p]);
		}
	} else {
		for (var i = 1; i <= 4; i++) {
			if (blackQueensTeam.indexOf(i) < 0) {
				// If not black queen team
				playerScores[i] += Math.abs(qPointsEarned);
				storage.setItem(playerScoreKey + i, playerScores[i]);
			}
		}
	}

	shiftDealer();

	updatePlayerScores();

	elem.className = "disabled";
	resetHand();
}

function shiftDealer() {
	// Clear dealer displays
	var dealerDispIds = [];
	dealerDispIds.push('dealerDisp1');
	dealerDispIds.push('dealerDisp2');
	dealerDispIds.push('dealerDisp3');
	dealerDispIds.push('dealerDisp4');
	for (var index in dealerDispIds) {
		var id = dealerDispIds[index];
		document.getElementById(id).innerText = "";
	}

	var currentDealerIndex = storage.getItem(dealerKey);
	if (!currentDealerIndex) {
		storage.setItem(dealerKey, 0);
		currentDealerIndex = 0;
	} else {
		currentDealerIndex = (parseInt(currentDealerIndex) + 1) % 4;
	}
	storage.setItem(dealerKey, currentDealerIndex);
	document.getElementById(dealerDispIds[currentDealerIndex]).innerText = "*";
}

function playerCall(callType) {
	if ((call[0] == callingPlayer && call[1] == callType) || callType == "P") {
		resetCallIndicators();
		resetBlackQueenIndicators();
		initiateCall();
		return;
	}

	resetCallIndicators();
	resetBlackQueenIndicators();

	if (blackQueensTeam.indexOf(callingPlayer) < 0) {
		setBlackQueen(callingPlayer);
	}

	call[0] = callingPlayer;
	call[1] = callType;

	var elem = document.getElementById("callIndicator" + callingPlayer);
	elem.className = "callIndicatorOn";
	elem.textContent = callType;

	// Hide call stuff
	initiateCall();

	updateQPointsEarned();
}

function setBlackQueen(playerNum) {
	if (call[1] != "P" && call[1] != "") {
		return;
	}
	// if indicated as black queen, undo that
	var index = blackQueensTeam.indexOf(playerNum);
	if (index >= 0) {
		blackQueensTeam.splice(index, 1);
		document.getElementById("queenIndicator" + playerNum).className = "queenIndicator";
		return;
	}

	if (blackQueensTeam.length >= 2) {
		return;
	}

	document.getElementById("queenIndicator" + playerNum).className = "queenIndicatorOn";
	blackQueensTeam.push(playerNum);
}

function updateCardPointsEarned() {
	var pts = 0;

	pts += numAces * 11;
	pts += numTens * 10;
	pts += numKings * 4;
	pts += numQueens * 3;
	pts += numJacks * 2;

	cardPoints  = pts;

	document.getElementById("pointsEarnedDiv").textContent = "Card Points: " + pts;
}

function updateQPointsEarned() {
	var pts = 0;

	if (call[1] == "S") {
		if (noTricks) {
			return;
		} else if (allTricks) {
			pts = 15;
		} else if (cardPoints <= 30) {
			pts = -9;
		} else if (cardPoints <= 60) {
			pts = -6;
		} else if (cardPoints <= 89) {
			pts = 9;
		} else if (cardPoints <= 120) {
			pts = 12;
		}
	} else if (call[1] == "Z") {
		if (noTricks) {
			-15;
		} else if (allTricks) {
			pts = 36;
		} else if (cardPoints <= 30) {
			pts = -12;
		} else if (cardPoints <= 60) {
			pts = -9;
		} else if (cardPoints <= 89) {
			pts = 18;
		} else if (cardPoints <= 120) {
			pts = 27;
		}
	} else if (call[1] == "ZS") {
		if (noTricks) {
			-42;
		} else if (allTricks) {
			pts = 39;
		} else if (cardPoints <= 30) {
			pts = -36;
		} else if (cardPoints <= 60) {
			pts = -24;
		} else if (cardPoints <= 89) {
			pts = -18;
		} else if (cardPoints <= 120) {
			pts = 36;
		}
	} else if (call[1] == "ZSS") {
		if (noTricks) {
			pts = -42;
		} else if (allTricks) {
			pts = 42;
		} else if (cardPoints <= 30) {
			pts = -42;
		} else if (cardPoints <= 60) {
			pts = -39;
		} else if (cardPoints <= 89) {
			pts = -33;
		} else if (cardPoints <= 120) {
			pts = -27;
		}
	} else {
		// Normal
		if (noTricks) {
			return;
		} else if (allTricks) {
			pts = 9;
		} else if (cardPoints <= 30) {
			pts = -9;
		} else if (cardPoints <= 60) {
			pts = -6;
		} else if (cardPoints <= 89) {
			pts = 3;
		} else if (cardPoints <= 120) {
			pts = 6;
		}
	}

	qPointsEarned = pts;

	var sign = "";
	if (pts > 0) {
		sign = "+";
	}
	document.getElementById("QPtsEarnedDiv").textContent = "Q Points: " + sign + pts;
}

function setNumCards(cardStr, num, resetTricks) {
	disableApplyBtn();

	if (cardStr == "Aces") {
		numAces = num;
	} else if (cardStr == "Tens") {
		numTens = num;
	} else if (cardStr == "Kings") {
		numKings = num;
	} else if (cardStr == "Queens") {
		numQueens = num;
	} else if (cardStr == "Jacks") {
		numJacks = num;
	} else {
		return;
	}

	if (resetTricks) {
		resetNoTricksAllTricks();
	}

	var cName = "ptOff";
	if (num == 0) {
		cName = "ptOn";
	}
	document.getElementById("0" + cardStr).className = cName;
	
	for (var i = 1; i <= 4; i++) {
		cName = "ptOff";
		if (i <= num) {
			cName = "ptOn";
		}
		document.getElementById(i + cardStr).className = cName;
	}

	updateCardPointsEarned();
	updateQPointsEarned();
}

function hidePlayerEntryContainer() {
	document.getElementById("playerEntryContainer").className = "topLevelHidden";
}
function showPlayerEntryContainer() {
	document.getElementById("playerEntryContainer").className = "topLevelShown";
}
function hideMainContainer() {
	document.getElementById("mainContainer").className = "topLevelHidden";
}
function showMainContainer() {
	document.getElementById("mainContainer").className = "topLevelShown";
}
function hideRules() {
	document.getElementById("rulesContainer").className = "topLevelHidden";
}
function showRules() {
	document.getElementById("rulesContainer").className = "topLevelShown";
	hideEndGameButton();
}
function hideEndGameButton() {
	document.getElementById("endGameButton").classList.remove("disabled");
	document.getElementById("endGameButton").classList.add("endGameHidden");
}
function showEndGameButton() {
	document.getElementById("endGameButton").classList.remove("endGameHidden");
	document.getElementById("endGameButton").classList.add("disabled");
}

var endGameTimeout = 0;

function endGame() {
	clearTimeout(endGameTimeout);
	var elem = document.getElementById("endGameButton");
	// if (elem.className == "disabled") {
	// 	elem.className = "enabled";
	// 	endGameTimeout = setTimeout(function() {
	// 		elem.className = "disabled";
	// 	}, 2000);
	// 	return;
	// }
	if (elem.classList.contains("disabled")) {
		elem.classList.remove("disabled");
		elem.classList.add("enabled");
		endGameTimeout = setTimeout(function() {
			elem.classList.remove("enabled");
		elem.classList.add("disabled");
		}, 2000);
		return;
	}

	resetHand();
	document.getElementById("playerEntryContainer").className = "topLevelShown";
	document.getElementById("mainContainer").className = "topLevelHidden";
	hideEndGameButton();

	for (var i = 1; i <= 4; i++) {
		storage.setItem(playerScoreKey + i, 0);
		playerScores[i] = 0;
	}

	storage.setItem(savedGameKey, "false");
}

function exitRules() {
	if (storage.getItem(savedGameKey) == "true") {
		document.getElementById("playerEntryContainer").className = "topLevelHidden";
		document.getElementById("mainContainer").className = "topLevelShown";
		showEndGameButton();
	} else {
		document.getElementById("playerEntryContainer").className = "topLevelShown";
	}

	document.getElementById("rulesTextContainer").className = "rulesContainer";
	document.getElementById("playChartContainer").className = "hidden";

	document.getElementById("showPlayChartButton").innerText = strShowPlayChart;

	hideRules();
}

var prompts = [
	["Can you follow suit?", 1, 4], // 0
	["Can you beat the current high card in the trick?", 2, 3], // 1
	["Play, following suit and beating the current high card in the trick.", 0, 0], // 2
	["Play any card that follows suit. You won't be taking this trick!", 0, 0], // 3
	["Can you play trump?", 5, 8], // 4
	["Can you beat the current high card in the trick?", 6, 7], // 5
	["Play a trump card beating the current high card in the trick.", 0, 0], // 6
	["Play any trump card. You won't be taking this trick!", 0, 0], // 7
	["Play an offsuit card and hope your partner does well.", 0, 0]]; // 8
var currentPrompt = 0;

function hidePromptAnswers() {
	document.getElementById("choiceYes").className = "hidden";
	document.getElementById("choiceNo").className = "hidden";
	document.getElementById("restartPlayChartButton").className = "restartPlayChartButton";
}
function showPromptAnswers() {
	document.getElementById("choiceYes").className = "choiceYes";
	document.getElementById("choiceNo").className = "choiceNo";
	document.getElementById("restartPlayChartButton").className = "hidden";
}

function showPrompt(promptNum) {
	document.getElementById("playChartQuestion").innerText = prompts[promptNum][0];
	currentPrompt = promptNum;

	if (prompts[promptNum][1] == 0) {
		hidePromptAnswers();
	}
}

function answerYes() {
	showPrompt(prompts[currentPrompt][1]);
}
function answerNo() {
	showPrompt(prompts[currentPrompt][2]);
}

function startPlayChart() {
	showPromptAnswers();
	showPrompt(0);
}


