(function () {
    "use strict";

    var MCMANAMAN = {};

    MCMANAMAN.game = (function () {
        
        var ctx;
        var canvasHeight = screen.height;
        var canvasWidth = screen.width;

        var blockPositionX = 10;
        var blockPositionY = 10;
        var blockWidth = canvasWidth / 10;
        var blockHeight = canvasHeight / 10;
        var blockAmount = 64;
        var blockFill = "#333";
        var gap = 10;

        var playerMoveLimit = blockAmount - 1;
        var playerMovementX = 1;
        var playerMovementY = 8;
        var playerStartPosition = 25;

        var obstaclePositions = [];
        var obstacleAmount = blockAmount / playerMovementY;

        var opponentPosition = playerStartPosition + (playerMovementX * 2);

        var frameLength = 100;

        var myRect = [];
        var limitRectangles = [];

        var isGameOver = true;


        // Function which is executed as player press space
        function startGame() {
            if (!isGameOver)
                return;
            isGameOver = false;
            FillRectangleArray(); // Fill array with rectangles which act as a one step in game
            gameLoop(); // Looooooop which draws our rectangles all over again
        }

        function FillRectangleArray() {

            ctx.clearRect(0, 0, screen.width, screen.height);
            ctx.fillStyle = '#fe57a1';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight); //fill a rectangle (x, y, width, height)

            while(obstaclePositions.length <= obstacleAmount){
                var obstaclePosition = Math.floor((Math.random() * blockAmount) + 1)
                if (obstaclePosition != playerStartPosition && obstaclePosition != opponentPosition)
                    obstaclePositions.push(obstaclePosition);
                
            }

            for (var i = 0; i <= blockAmount; i++) {
                myRect.push(new RectShape(blockPositionX, blockPositionY, blockWidth, blockHeight, blockFill, i))

                // if we have our last rectangle in x line
                if (i % playerMovementY == 0  && i != 0) {
                    limitRectangles.push(new RectShape(blockPositionX, blockPositionY, blockWidth, blockHeight, blockFill, i));
                    blockPositionY += blockHeight + gap;
                    blockPositionX = 10;
                }
                else {
                    blockPositionX += blockWidth + gap;
                }
            }
            // Draw little rectangles on canvas
            drawAllRectangles()
        }
        // Function for making playground and after that we fill canvas(playground) with rectangles
        function createCanvas() {
            var canvas = document.createElement('canvas');
            canvas.addEventListener("click", startGame, false);
            canvas.id = "gameCanvas";
            canvas.height = canvasHeight;
            canvas.width = canvasWidth;
            document.body.appendChild(canvas);

            var canv = document.getElementById("gameCanvas");
            if (canv.getContext) {
                ctx = canv.getContext('2d'); //get the context
                ctx.clearRect(0, 0, screen.width, screen.height);
                ctx.fillStyle = '#fe57a1';
                ctx.fillRect(0, 0, canvasWidth, canvasHeight); //fill a rectangle (x, y, width, height)                     
            }
        }
        // Function which checks if rectangles collide
        function CheckIfOverlaps() {
            var playerPositionIndex;
            var opponentPositionIndex;
            
            for (var i = 0; i < myRect.length; i++) {
                if (myRect[i].isOpponent == true)
                    opponentPositionIndex = myRect[i].index;
                if (myRect[i].isPlayer == true)
                    playerPositionIndex = myRect[i].index;
            }

            for (var i in obstaclePositions) {
                if (opponentPositionIndex == obstaclePositions[i]) {
                    myRect[opponentPositionIndex].isObstacle = false;
                    obstaclePositions.splice(i, 1);
                    moveOpponent(opponentPositionIndex, -1);
                }
            }
            if (isGameOver == false && playerPositionIndex === opponentPositionIndex) {
                GameWon();
            }
        }
        // Function which checks if our player or opponent are outside of playground
        function CheckIfOverLimits(opponentCurrentIndex) {
            for (var i in limitRectangles) {
                if (limitRectangles[i].index == opponentCurrentIndex)
                    GameOver();
            }
        }
        // Keybindings 
        function bindEvents() {
            var keysToDirections = {
                32: 'space',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
            };

            document.onkeydown = function (event) {
                var key = event.which;
                var direction = keysToDirections[key];

                if (direction) {
                    setDirection(direction);
                }
            };
        }
        // Function that is responsible of our players and opponents movement
        function setDirection(newDirection) {
           
            var playerPositionIndex;
            var opponentPositionIndex;

            for (var i = 0; i < myRect.length ; i++) {
                if (myRect[i].isPlayer == true) {
                    playerPositionIndex = myRect[i].index;
                }
                if (myRect[i].isOpponent == true) {
                    opponentPositionIndex = myRect[i].index;
                }
            }
            
            switch (newDirection) {
                case 'left':
                    break;
                case 'right':
                    if (isGameOver)
                        return;
                    movePlayer(playerPositionIndex, playerMovementX);
                    moveOpponent(opponentPositionIndex, playerMovementX)
                    break;
                case 'up':
                    if (isGameOver)
                        return;
                    movePlayer(playerPositionIndex, -playerMovementY);
                    moveOpponent(opponentPositionIndex, -playerMovementY)
                    break;
                case 'down':
                    if (isGameOver)
                        return;
                    movePlayer(playerPositionIndex, playerMovementY);
                    moveOpponent(opponentPositionIndex, playerMovementY)
                    break;
                case 'space':
                    restart();
                    break;
                default:
                    throw ('Invalid direction');
            }
        }
        // Functions that moves player and opponent
        function movePlayer(playerPositionIndex, steps) {
            myRect[playerPositionIndex].isPlayer = false;
            if (playerPositionIndex + steps < 1 || playerPositionIndex + steps > playerMoveLimit)
                myRect[0].isPlayer = true;
            else
                myRect[(playerPositionIndex + steps)].isPlayer = true;          
        }

        function moveOpponent(opponentPositionIndex, steps) {
            myRect[opponentPositionIndex].isOpponent = false;
            if (opponentPositionIndex + steps < 1 || opponentPositionIndex + steps > playerMoveLimit) {
                CheckIfOverLimits((opponentPositionIndex + steps));
            }
            else {
                myRect[(opponentPositionIndex + steps)].isOpponent = true;
                CheckIfOverLimits((opponentPositionIndex + steps));
            }

        }
        // This function is our gameloop, this goes over and over and over and over again. She does all drawing and overlap checking.
        function gameLoop() {
            drawAllRectangles();
            CheckIfOverlaps();
            setTimeout(gameLoop, frameLength); //do it all again
        }

        // Our one rectangle
        function RectShape(x, y, w, h, fill, index) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
            this.fill = fill;
            this.index = index;
            this.isObstacle = false;
            if (index === playerStartPosition) {
                this.isPlayer = true;
            }
            else if (index === opponentPosition)
                this.isOpponent = true;
            else {
                this.isPlayer = false;
                this.isOpponent = false;
            }
        }
        // function for drawing one rectangle oRec. Different rectangles are in different colors. TODO: GRAPHICS AND ANIMATIONS (Colors should
        // be replaced with images)
        function drawRectangle(oRec) {
            ctx.clearRect(oRec.x, oRec.y, oRec.width, oRec.height);
            if (oRec.isPlayer)
                ctx.fillStyle = "#00CCFF";
            else if (oRec.isOpponent)
                ctx.fillStyle = "#B80000";
            else if (oRec.isObstacle)
                ctx.fillStyle = "#00FF00";
            else {
                ctx.fillStyle = oRec.fill;
            }
            ctx.fillRect(oRec.x, oRec.y, oRec.width, oRec.height);
        }
        // Function which draws all rectangles in rectangle array.
        function drawAllRectangles() {
            for (var i in myRect) {
                var oRec = myRect[i];
                for (var i in obstaclePositions) {
                    if (oRec.index == obstaclePositions[i])
                        oRec.isObstacle = true;
                }
                drawRectangle(oRec);
            }
        }
        // GameOver screen
        function GameOver() {
            isGameOver = true;
            ctx.save();
            myRect = [];
            ctx.clearRect(0, 0, screen.width, screen.height);
            ctx.fillStyle = '#fe57a1';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight); //fill a rectangle (x, y, width, height) 
            ctx.font = 'bold 72pt sans-serif';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            var centreX = screen.width / 2;
            var centreY = screen.height / 2;
            ctx.strokeText('Game Over', centreX, centreY - 10);
            ctx.fillText('Game Over', centreX, centreY - 10);
            ctx.font = 'bold 36px sans-serif';
            ctx.strokeText('Press space to restart', centreX, centreY + 50);
            ctx.fillText('Press space to restart', centreX, centreY + 50);
            ctx.restore();
        }
        // GameWon screen
        function GameWon() {
            isGameOver = true;
            ctx.save();
            myRect = [];
            ctx.clearRect(0, 0, screen.width, screen.height);
            ctx.fillStyle = '#fe57a1';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight); //fill a rectangle (x, y, width, height) 
            ctx.font = 'bold 72pt sans-serif';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            var centreX = screen.width / 2;
            var centreY = screen.height / 2;
            ctx.strokeText('You won the game!', centreX, centreY - 10);
            ctx.fillText('You won the game!', centreX, centreY - 10);
            ctx.font = 'bold 36px sans-serif';
            ctx.strokeText('Press space to restart', centreX, centreY + 50);
            ctx.fillText('Press space to restart', centreX, centreY + 50);
            ctx.restore();
        }
        // The name tells it all
        function restart() {
            myRect = [];
            blockPositionX = 10;
            blockPositionY = 10;
            blockWidth = canvasWidth / 10;
            blockHeight = canvasHeight / 10;
            blockAmount = 64;
            blockFill = "#333";
            gap = 10;
            startGame();
        }
        // same as above
        function init() {
            createCanvas();
            ctx.clearRect(0, 0, screen.width, screen.height);
            ctx.fillStyle = '#fe57a1';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight); //fill a rectangle (x, y, width, height) 
            ctx.font = 'bold 36pt sans-serif';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            var centreX = screen.width / 2;
            var centreY = screen.height / 2;
            ctx.strokeText('Welcome to Catch MR.MCMANAMAN!', centreX, centreY - 10);
            ctx.fillText('Welcome to Catch MR.MCMANAMAN!', centreX, centreY - 10);
            


            bindEvents();
        }

        return {
            init: init
        };
    })();


    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);
        MCMANAMAN.game.init();
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
} )();