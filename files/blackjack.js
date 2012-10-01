var gameDeck, playerHand, dealerHand;
//var dealerlimit = 16;   // value at which the dealer will not deal again
var playerpoints, dealerpoints;
var imagesPath = 'images/';
var hole = 'images/b.gif';
var imagesLoaded = 0;
var isNewCard, playercardmargin, dealercardmargin, playeraces, dealeraces, slideCounter;
var ppStr, dpStr;
// variables to store the string to use to show the player and dealer points.
var money = 100;
var played = 0;
var won = 0;
var draw = 0;
var lost = 0;
var betValue = 0;

$(document).ready(function() {
    play();
});

function play() {
    initialize();
    $("#deal").click(function() {// button Deal/Hit pressed
        betValue = parseInt($(".bet input:radio:checked").val());
        $(".bet input:radio").prop("disabled", true);
        deal();
    });
    $("#done").click(function() {// button Done pressed
        done();
    });
    $("#start").click(function() {// button Start pressed, reloads page/application
        //location.reload();
        restart();
    });
    $(".bet input").change(function() {
        betValue = parseInt($(".bet input:radio:checked").val());
        //if (imagesCached)
        //    $("#deal").prop('disabled', false);
        //$("#debug .red").remove();
    });
}

// Initialize values to restart the game without the need to reload the page
function initialize() {
    gameDeck = new cardDeck(1);
    playerHand = new Array();
    dealerHand = new Array();
    playerpoints = 0;
    dealerpoints = 0;
    playercardmargin = 0;
    dealercardmargin = 0;
    playeraces = 0;
    dealeraces = 0;
    ppStr = '';
    dpStr = '';
    slideCounter = 0;
    isNewCard = true;
    $("#done").hide();
    $("#start").hide();
    if (imagesLoaded == 0) {
        $("#deal").prop('disabled', true);
        preloadImages(gameDeck);
    }
    /*if (betValue == 0) {
        $("#deal").prop('disabled', true);
        $("#debug").empty().append("<span class='red'>Please select your bet.</span>");
    }*/
    $("#money").empty().append(money);
}

function getPoints(hand, who) {
    var points = 0;
    var ace = 0;
    if (who == "player")
        playeraces = 0;
    else
        dealeraces = 0;
    for (i in hand) {
        points += hand[i].value;
        if (hand[i].name == "Ace" && hand[i].value == 11)
            ace++;
    }
    if (points > 21 && ace > 0)
        for (i in hand)
        if (hand[i].name == "Ace" && hand[i].value == 11) {
            hand[i].value = 1;
            points -= 10;
            if (who == "player")
                playeraces++;
            else
                dealeraces++;
            return points;
        }
    return points;
}

// ---------------------------------------------------------------------------   DEAL cards ----------------------------------------------------------------
function deal() {
    var newcard = hit(gameDeck);
    playerHand.push(newcard);
    playerpoints = getPoints(playerHand, "player");
    showCard(newcard, playerpoints, "player");
    if ((dealerpoints < playerpoints && playerpoints <= 21) || dealerHand.length < 2) {
        newcard = hit(gameDeck);
        dealerHand.push(newcard);
        dealerpoints = getPoints(dealerHand, "dealer");
        showCard(newcard, dealerpoints, "dealer");
    }
    $("#deal").prop('value', 'Hit!');
    $("#done").show();
    if (playerpoints == 21) {
        if (dealerpoints < 21) {
            do {
                newcard = hit(gameDeck);
                dealerHand.push(newcard);
                dealerpoints = getPoints(dealerHand, "dealer");
                showCard(newcard, dealerpoints, "dealer");
            } while(dealerpoints<21);
        }
        if (dealerpoints > 21) {
            endGame("You WON with a BLACKJACK (" + playerpoints + " points). Dealer BUSTED with " + dealerpoints + " points.");
            win();
        } else if (dealerpoints == 21) {
            endGame("DRAW!! You got " + playerpoints + " points. Dealer got " + dealerpoints + " points.");
            draw();
        }
    } else if (playerpoints > 21) {
        if (dealerpoints == 21) {
            endGame("Dealer WON with a BLACKJACK (" + dealerpoints + " points). You BUSTED with " + playerpoints + " points.");
            loss();
        } else if (dealerpoints > 21) {
            endGame("DRAW!! Both you and the dealer BUSTED!! You got " + playerpoints + " points. Dealer got " + dealerpoints + " points.");
            draw();
        } else if (dealerpoints < 21) {
            endGame("You BUSTED with " + playerpoints + " points. Dealer WON with " + dealerpoints + " points.");
            loss();
        }
    } else if (playerpoints < 21) {
        if (dealerpoints > 21) {
            endGame("Dealer BUSTED with " + dealerpoints + " points. You WON with " + playerpoints + " points.");
            win();
        }
    }
    // Makes sure it deals two cards to start the game
    if (isNewCard) {
        isNewCard = false;
        deal();
    }
}

function done() {
    $("#done").hide();
    if (dealerpoints < playerpoints) {
        do {
            var newcard = hit(gameDeck);
            dealerHand.push(newcard);
            dealerpoints = getPoints(dealerHand, "dealer");
            showCard(newcard, dealerpoints, "dealer");
        } while (dealerpoints<playerpoints && dealerpoints < 21);
    }
    if (playerpoints == dealerpoints) {
        if (dealerpoints > 10) {
            endGame("DRAW!! You got " + playerpoints + " points. Dealer got " + dealerpoints + " points.");
            drawGame();
        } else {
            var newcard = hit(gameDeck);
            dealerHand.push(newcard);
            dealerpoints = getPoints(dealerHand, "dealer");
            showCard(newcard, dealerpoints, "dealer");
            done();
            return false;
        }
    }
    if (playerpoints < dealerpoints) {
        if (dealerpoints < 21) {
            endGame("You LOST!! You got " + playerpoints + " points. Dealer WON with " + dealerpoints + " points.");
            loss();
        }
        else if (dealerpoints == 21) {
            endGame("Dealer WON with a BLACKJACK (" + dealerpoints + " points). You LOST with " + playerpoints + " points.");
            loss();
        }
        else if (dealerpoints > 21) {
            endGame("You WON!! You got " + playerpoints + " points. Dealer BUSTED with " + dealerpoints + " points.");
            win();
        }
        return true;
    }
    return false;
}

function win() {
    won++;
    money+=betValue*2;
    updateStats();
}

function drawGame() {
    draw++;
    updateStats();
}

function loss() {
    lost++;
    money-=betValue;
    updateStats();
}

function updateStats() {
    $("#dealerhand .firstcard").attr("src", dealerHand[0].image);
    $("#dealerpoints").empty().append(dpStr);
    played++;
    $("#played").empty().append(played);
    $("#won").empty().append(won + " <span class='percent'>(" + Math.round((won/played)*100) + "%)</span>");
    $("#draw").empty().append(draw + " <span class='percent'>(" + Math.round((draw/played)*100) + "%)</span>");
    $("#lost").empty().append(lost + " <span class='percent'>(" + Math.round((lost/played)*100) + "%)</span>");
    $("#money").empty().append(money);
    $(".bet input:radio").prop("disabled", false);
}

function showCard(card, points, who) {
    var placeID;
    //var pointsID;
    if (who == "player") {
        placeID = "#playerhand";
        //pointsID = "#playerpoints";
    } else if (who == "dealer") {
        placeID = "#dealerhand";
        //pointsID = "#dealerpoints";
    }
    placeID += " .cards";
    if (isNewCard) {
        if(who == "player")
            var newCard = $("<img class='firstcard' src='" + card.image + "' />").hide();
        else
            var newCard = $("<img class='firstcard' src='" + hole + "' />").hide();
    } else {
        var newCard = $("<img class='card' src='" + card.image + "' />").hide();
    }
    $(placeID).append(newCard);
    $("#deal, #done").prop("disabled", true);
    if (who == "player")
        ppStr = points + " points";
    else
        dpStr = points + " points";
    //$(pointsID).append(points + " points");
    if (who == "player") {
        slide(newCard, playercardmargin);
        playercardmargin += 30;
        if (playeraces == 1)
            ppStr += " (" + playeraces + " Ace counting 1 point)";
        else if (playeraces > 1)
            ppStr += " (" + playeraces + " Aces counting 1 point each)";
    } else {
        slide(newCard, dealercardmargin);
        dealercardmargin += 30;
        if (dealeraces == 1)
            dpStr += " (" + dealeraces + " Ace counting 1 point)";
        else if (dealeraces > 1)
            dpStr += " (" + dealeraces + " Aces counting 1 point each)";
    }

}

// Updates points and also enabled the buttons to continue playing
function updatePoints() {
    $("#playerpoints").empty().append(ppStr);
    $("#deal, #done").prop("disabled", false);
}

function slide(card, cardmargin) {
    slideCounter++;
    setTimeout(function() {
        card.css({
            left : 280,
            display : 'block',
            opacity : 0
        }).animate({
            left : cardmargin,
            opacity : 1
        }, 500);
        slideCounter--;
        if (slideCounter == 0)
            updatePoints();
    }, slideCounter * 500);
}

function restart() {
    $("#deal").prop("value", "Deal");
    $("#deal").prop("disabled", false);
    $("#deal").show();
    $("#game img").remove();
    $("#dealerpoints, #playerpoints, #results").empty();
    $("#results").empty();
    initialize();
}

function preloadImages(cards) {
    var images = new Array();
    for (i in cards) {
        images[i] = new Image();
        images[i].src = cards[i].image;
        images[i].onload = function() {
            imgLoad(images[i].src)
        }
    }
}

function imgLoad(image) {
    imagesLoaded++;
    setLoader(imagesLoaded / gameDeck.length);
    if (imagesLoaded == gameDeck.length) {
        $("#deal").prop('disabled', false);
        $('#loader').empty().append("Deck loaded!!").fadeOut("slow").remove();
    }
}

function setLoader(value) {
    var loading = value * 100;
    loading = "Loading deck: " + loading.toFixed() + "%";
    if ($('#debug #loader').length > 0)
        $('#debug #loader').empty().append(loading);
    else
        $('#debug').append("<span id='loader'>" + loading + "</span>");
}

function endGame(result) {
    $("#start").prop({
        "value" : "Restart",
        "disabled" : true
    });
    $("#start").show();
    $("#done").hide();
    $("#deal").hide();
    $("#results").append(result);
    $("#start").prop("disabled", false);
}

function hit(deck) {
    var index = rnd(deck.length);
    var card = deck[index];
    deck.splice(index, 1);
    return card;
}

function rnd(num) {
    return Math.floor(Math.random() * num);
}

function cardDeck(num) {
    var suit = new Array('clubs', 'hearts', 'spades', 'diamonds');
    var suitLetter = new Array('c', 'h', 's', 'd');
    var deck = new Array();
    for (i=0; i < num; i++) 
        for (i in suit) {
            deck.push(new card(suit[i], 'Ace', 11, imagesPath + suitLetter[i] + '1.gif'));
            deck.push(new card(suit[i], 'Two', 2, imagesPath + suitLetter[i] + '2.gif'));
            deck.push(new card(suit[i], 'Three', 3, imagesPath + suitLetter[i] + '3.gif'));
            deck.push(new card(suit[i], 'Four', 4, imagesPath + suitLetter[i] + '4.gif'));
            deck.push(new card(suit[i], 'Five', 5, imagesPath + suitLetter[i] + '5.gif'));
            deck.push(new card(suit[i], 'Six', 6, imagesPath + suitLetter[i] + '6.gif'));
            deck.push(new card(suit[i], 'Seven', 7, imagesPath + suitLetter[i] + '7.gif'));
            deck.push(new card(suit[i], 'Eight', 8, imagesPath + suitLetter[i] + '8.gif'));
            deck.push(new card(suit[i], 'Nine', 9, imagesPath + suitLetter[i] + '9.gif'));
            deck.push(new card(suit[i], 'Ten', 10, imagesPath + suitLetter[i] + '10.gif'));
            deck.push(new card(suit[i], 'Jack', 10, imagesPath + suitLetter[i] + 'j.gif'));
            deck.push(new card(suit[i], 'Queen', 10, imagesPath + suitLetter[i] + 'q.gif'));
            deck.push(new card(suit[i], 'King', 10, imagesPath + suitLetter[i] + 'k.gif'));
        }
    return deck;
}

function card(suit, name, value, image) {
    this.suit = suit;
    this.name = name;
    this.value = value;
    this.image = image;
}

