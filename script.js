/**
 * Multimedia kotelezo program
 * 2020/21/2
 * Space Invaders
 *
 * Nev: Varga Klaudia
 * Neptun: QBB82W
 **/

let gameArea;
let gameAreaWidth, gameAreaHeight;

let enemy, enemyArray = [];
let startEnemyX = -50, startEnemyY = 100, endEnemyY = 700;
let enemyNumber = 10, actualEnemyNumber;
let offsetX = (endEnemyY - startEnemyY) / enemyNumber;

let defender;
let defenderWidth = offsetX, defenderHeight;
let moveStep = defenderWidth / 2;

let moveInterval, collisionCheckInterval, enemyNumberCheckInterval;
let score = 0, highScore = 0, round;
let topListArray = {}, topListArraySorted, userName, previousName;

let backgroundMusicInGame = new Audio("audio/bg_music.mp3");
let backgroundMusicHappy = new Audio("audio/happy_bg_music.mp3");
let shootSound = new Audio("audio/beep_sound.mp3");
let enemyInitSound = new Audio("audio/explosion_sound.wav");
let gameOverSound = new Audio("audio/gameOver_sound.mp3");

let inGame = false;

$(document).ready(function () {
   // gamearea
    gameArea = $("#gameArea");
    gameAreaWidth = parseInt(gameArea.css("width"));
    gameAreaHeight = parseInt(gameArea.css("height"));


    // info
    gameArea.append("<div id='scoreTab'>Score: <span id='score'></span></div>");
    $("#score").text(score);
    gameArea.append("<div id='highScoreTab'>High score: <span id='highScore'></span></div>");
    $("#highScore").text(highScore);
    gameArea.append("<div><span id='gameOver'>Game over!</span><span id='newHighScore'> New high score!</span></div>");
    $("#gameOver").hide();
    $("#newHighScore").hide();
    gameArea.append("<div id='startMessage'>Press space or click to start a new game!</div>");
    gameArea.append("<div><span id='topList'>Top list</span></div>");
    $("#topList").hide();


    // add defender
    defender = $("<img src='img/rocket.png' id='defender' alt=''>");
    gameArea.append(defender);
    defender.on("load", function () { initDefender(); });


    // add enemy
    enemy = $("<img src='img/monster.png' alt=''>");


    // events
    $(document).on("keydown", moveDefender);
    gameArea.on("mousemove", mouseMoveDefender);
    gameArea.on("click", function () {
        if (inGame) {
            shootDefender();
        } else {
            newGame();
        }
    });
});

// defender

function initDefender() {
    defender.css({
        width: defenderWidth,
    });
    defenderHeight = parseInt(defender.css("height"));
    defender.css({
        top: gameAreaHeight - defenderHeight - 20,
    });
}

function moveDefender(event) {
    let pressedKey = event.which;
    if (pressedKey === 39) {
        if (parseInt(defender.css("left")) + defenderWidth < gameAreaWidth) { defender.animate({ left: "+=" + moveStep }, 1); }
        else { defender.animate({ left: gameAreaWidth - defenderWidth }, 1); }
    }
    if (pressedKey === 37) {
        if (parseInt(defender.css("left")) - moveStep > 0) { defender.animate({left: "-=" + moveStep}, 1); }
        else { defender.animate({ left: 0 }, 1); }
    }
    if (pressedKey === 32) {
        if (inGame) { shootDefender(); }
        else { newGame(); }
    }
}

function mouseMoveDefender(event) {
    let gameAreaPosition = gameArea.offset();
    let mousePositionX = Math.ceil(event.clientX - gameAreaPosition.left - moveStep);
    if (mousePositionX > 0 && mousePositionX < gameAreaWidth -defenderWidth) {
        defender.css({
            left: mousePositionX,
        });
    }
}

// enemy

function initEnemy() {
    enemyInitSound.play();
    enemyArray = [];
    round++;
    for (let i = 0; i < enemyNumber; i++) {
        enemyArray.push({
            x_pos: startEnemyY + i * offsetX,
            y_pos: startEnemyX,
            imgObj: enemy.clone()
        });
        actualEnemyNumber++;
    }
    drawEnemy();
    moveInterval = setInterval(moveEnemy, 1500 / round );
}

function drawEnemy() {
    for (let e in enemyArray) {
        let actualImage = enemyArray[e].imgObj;
        gameArea.append(actualImage);
        actualImage.css({
            left: enemyArray[e].x_pos,
            top: enemyArray[e].y_pos,
            width: offsetX
        });
        actualImage.addClass("enemy");
    }
}

function moveEnemy() {
    $(".enemy").each(function () {
        if ($(this).position().top < gameAreaHeight - defenderHeight - 80) {
            $(this).css({
                top: "+=20",
            });
        } else {
            clearInterval(moveInterval);
            clearInterval(collisionCheckInterval);
            clearInterval(enemyNumberCheckInterval);
            gameOver();
        }
    });
}

// bomb

function shootDefender() {
    shootSound.play();
    let bombX = defender.position().left + moveStep;
    let bombY = defender.position().top - defenderHeight;
    let bomb = $("<img src='img/bomb.png' class='bomb' alt=''>");
    bomb.css({
        width: offsetX / 5,
        top: bombY,
        left: bombX,
    });
    bomb.animate({
        top: -30
    }, 1000, function () {
        bomb.remove();
    });
    gameArea.append(bomb);
}

// check

function collisionCheck() {
    $(".bomb").each(function () {
        let actualBomb = $(this);
        let actualBombPosition = {
            x : actualBomb.position().left + (parseInt(actualBomb.css("width")) / 2),
            y: actualBomb.position().top
        };
        $(".enemy").each(function () {
            let actualEnemy = $(this);
            let actualEnemyPosition = {
                x : actualEnemy.position().left + (parseInt(actualEnemy.css("width")) / 2),
                y : actualEnemy.position().top + parseInt($(this).css("height")) / 2
            };
            if (distance(actualBombPosition, actualEnemyPosition) <= parseInt($(this).css("height")) / 2) {
                $(this).remove();
                actualBomb.remove();
                score++;
                $("#score").text(score);
                actualEnemyNumber--;
            }
        });
    });
}

function distance(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt((dx * dx) + (dy * dy));
}

function enemyNumberCheck() {
    if (actualEnemyNumber === 0) {
        clearInterval(moveInterval);
        initEnemy();
    }
}

// game

function newGame() {
    backgroundMusicInGame.play();
    backgroundMusicHappy.pause();

    $("#startMessage").hide();
    $("#gameOver").hide();
    $("#newHighScore").hide();
    $("#topList").hide();

    $(".enemy").each(function () { $(this).remove(); });

    inGame = true;
    round = 0;
    score = 0;
    actualEnemyNumber = 0;
    previousName = ""

    $("#score").text(score);

    enemy.on("load", function () { initEnemy(); });

    collisionCheckInterval = setInterval(collisionCheck, 1);
    enemyNumberCheckInterval = setInterval(enemyNumberCheck, 1);
}

function gameOver() {
    clearInterval(moveInterval);
    clearInterval(collisionCheckInterval);
    clearInterval(enemyNumberCheckInterval);

    backgroundMusicInGame.pause();
    gameOverSound.play();
    backgroundMusicHappy.play();

    $("#startMessage").show();
    $("#gameOver").show();
    if (score > highScore) {
        highScore = score;
        $("#highScore").text(highScore);
        $("#newHighScore").show();
    }

    topList();
    inGame = false;
}

function topList() {
    if (userName !== previousName) {
        userName = prompt("Name:", "Anonymus");
        previousName = userName;
    }
    topListArray[userName] = score;
    topListArraySorted = [];

    for (let topListItem in topListArray) {
        topListArraySorted.push([topListItem, topListArray[topListItem]]);
    }

    topListArraySorted.sort(function (a, b) {
        return b[1] - a[1];
    })

    $("#topList").text("");
    $("#topList").append("<br>Top List<br>");

    for (let topListItem in topListArraySorted) {
        $("#topList").append(" " + topListArraySorted[topListItem][1] + " - " + topListArraySorted[topListItem][0] + "<br>");
    }

    $("#topList").show();
}
