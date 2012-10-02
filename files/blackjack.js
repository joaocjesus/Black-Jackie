var gameDeck, playerHand, dealerHand;
var dealerlimit = 17;  // value at which the dealer will not deal again
var imagesPath = 'images/';
var hole = 'images/b.gif';
var imagesLoaded = 0;
var playercardmargin, dealercardmargin, slideCounter;
var ppStr, dpStr;
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
    $("#deal").click(function() {  // button Deal/Hit pressed
        betValue = parseInt($(".bet input:radio:checked").val());
        $(".bet input:radio").prop("disabled", true);
        deal();
    });
    $("#done").click(function() {  // button Done pressed
        done();
    });
    $("#double").click(function() {  // button Double pressed
        doubledown();
    });
    $("#start").click(function() {  // button Start pressed, reloads application
        restart();
    });
    $(".bet input").change(function() {
        betValue = parseInt($(".bet input:radio:checked").val());
    });
    $("#toggler").click(function() {
        if($("#instructions").is(":visible")) {
            $("#instructions").slideUp("slow");
            $("#toggler").empty().append("Show instructions");
        } else {
            $("#instructions").slideDown("slow");
            $("#toggler").empty().append("Hide instructions");
        }
     
    });
}


// Initialize values to restart the game without the need to reload the page
function initialize() {
    gameDeck = new cardDeck(1);
    playerHand = new Hand();
    dealerHand = new Hand();
    playercardmargin = 0;
    dealercardmargin = 0;
    playeraces = 0;
    dealeraces = 0;
    ppStr = '';
    dpStr = '';
    slideCounter = 0;
    $("#done").hide();
    $("#start").hide();
    $("#double").prop('disabled', true);
    if (imagesLoaded == 0) {
        $("#deal").prop('disabled', true);
        preloadImages(gameDeck);
    }
    $("#money").empty().append(money);
    //$("#double").attr("value","DoubleDown");
}

function Hand() {
    var cards = new Array();
    this.blackjack = false;
    this.aces = 0;
    this.value = function(x) {
        return cards[x].value;
    };
    this.suit = function(x) {
        return cards[x].suit;
    };
    this.name = function(x) {
        return cards[x].name;
    };
    this.image = function(x) {
        return cards[x].image;
    };
    this.points = function() {
        var p = 0;
        for (i = 0; i < this.size(); i++) {
            p+=this.value(i);
         }
        return p;
    };
    this.size = function() {
        return cards.length;
    };
    this.add = function(card) {
        cards.push(card);
        if(this.size() == 2)
            if ((this.value(0) + this.value(1)) == 21)
                this.blackjack = true;
        if (this.points() > 21) 
            for (i=0; i<this.size(); i++)
                if (this.name(i) == "Ace" && this.value(i) == 11) {
                    cards[i].value = 1;
                    this.aces++;
                    break;
                }
    };
}

// ---------------------------------------------------------------------------   DEAL cards ----------------------------------------------------------------
function deal() {
    if (money>=betValue) {
        dealcards();
    } else
        noMoney();
}

function noMoney() {
    if(money==0)
        $("#results").empty().append("You don't have enough money to play.<br /> You lost all your money.");
    else {
        $("#results").empty().append("You don't have enough money to place that bet.<br /> Please place a lower bet.");
        $(".bet input:radio").prop("disabled", false);
    }
}

function dealcards() {
    $("#results").empty();
    var newcard = hit(gameDeck);
        playerHand.add(newcard);
        showCard(newcard, playerHand.points(), "player");
        if (dealerHand.size() < 2) {
            newcard = hit(gameDeck);        
            dealerHand.add(newcard);
            showCard(newcard, dealerHand.points(), "dealer");
        }
        if (playerHand.size()==2) {
            if (playerHand.blackjack)
                if(!dealerHand.blackjack) {
                    endGame("You WON with a BLACKJACK!!");
                    win();
                    return true;
                }
                else {
                    endGame("DRAW!! Both you and the dealer got a BLACKJACK!!");
                    tie();
                    return true;
                }
            if (dealerHand.blackjack)
                 if(!playerHand.blackjack) {
                    endGame("You LOST!! Dealer wins with a BLACKJACK!!");
                    loss();
                    return true;
                }
                else {
                    endGame("DRAW!! Both you and the dealer got a BLACKJACK!!");
                    tie();
                    return true;  
                }
            $("#double").show();
        } else if (playerHand.size()==1)
                deal();  // deals a second card each if there is only one at each hand
        else 
            if (playerHand.points() > 21)
                done();
        // only shows the following buttons if there are at least 2 cards on each hand.
        if (playerHand.size()>1) {
            if (playerHand.size()>2)
                $("#double").hide();
            $("#deal").prop('value', 'Hit!');
            $("#done").show();
        }
}

function done() {
    $("#start").prop("disabled", true).show();
    $("#done").hide();
    $("#double").hide();
    $("#deal").hide();
    var newcard;
    while (dealerHand.points() < dealerlimit) {
        newcard = hit(gameDeck);
        dealerHand.add(newcard);
        showCard(newcard, dealerHand.points(), "dealer");
    }
    if (playerHand.points() > 21)
        if (dealerHand.points() <= 21) {
            endGame("You BUSTED!! Dealer WINS!!");
            loss();
        }
        else {
            endGame("Both you and the dealer BUSTED!! You lost. (house advantage)");
            loss();
        }
    else if (playerHand.points() == dealerHand.points()) {
        endGame("DRAW!! You and the dealer got the same points.");
        tie();
    } else if (playerHand.points() < dealerHand.points()) {
        if (dealerHand.points() <= 21) {
            endGame("You LOST!! Dealer WON!!");
            loss();
        } else if (dealerHand.points() > 21) {
            endGame("You WON!! Dealer BUSTED!!");
            win();
        }
    } else if (playerHand.points() > dealerHand.points()) {
        if (dealerHand.points() < 21) {
            endGame("You WON!!");
            win();
        } else if (dealerHand.points() > 21) {
            endGame("You WON!! Dealer BUSTED!!");
            win();
        }
    }
}

function doubledown() {
     betValue*=2;
     deal();
     done();
}

function win() {
    won++;
    if (playerHand.blackjack) {
        money += betValue * 1.5;
    } else
        money += betValue;
    updateStats();
}

function tie() {
    draw++;
    updateStats();
}

function loss() {
    lost++;
    money -= betValue;
    updateStats();
}

function updateStats() {
    setTimeout(function () {
        $("#dealerhand .firstcard").attr("src", dealerHand.image(0));  // Shows the first dealer card
        $("#dealerpoints").empty().append(dpStr);
        played++;
        $("#played").empty().append(played);
        $("#won").empty().append(won + " <span class='percent'>(" + Math.round((won / played) * 100) + "%)</span>");
        $("#draw").empty().append(draw + " <span class='percent'>(" + Math.round((draw / played) * 100) + "%)</span>");
        $("#lost").empty().append(lost + " <span class='percent'>(" + Math.round((lost / played) * 100) + "%)</span>");
        $("#money").empty().append(money);
        $(".bet input:radio").prop("disabled", false);
    }, slideCounter*500);
}

function showCard(card, points, who) {
    var placeID;
    if (who == "player")
        placeID = "#playerhand";
    else if (who == "dealer")
        placeID = "#dealerhand";
    placeID += " .cards";
    if(who == "player")
        if(playerHand.size()==1)
            var newCard = $("<img class='firstcard' src='" + card.image + "' />").hide();
        else
            var newCard = $("<img class='card' src='" + card.image + "' />").hide();
    else
        if(dealerHand.size()==1)
            var newCard = $("<img class='firstcard' src='" + hole + "' />").hide();
        else
            var newCard = $("<img class='card' src='" + card.image + "' />").hide();
    $(placeID).append(newCard);
    $("#deal, #done").prop("disabled", true);
    if (who == "player")
        ppStr = points + " points";
    else
        dpStr = points + " points";
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
    $("#deal, #done, #double").prop("disabled", false);
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
        $("#loader").empty().append("Deck loaded!!");
        setTimeout(function() {
            $("#loader").fadeOut("slow");
        }, 2000);
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
    setTimeout(function () {
        $("#start").prop({
            "value" : "Restart",
            "disabled" : true
        });
        $("#start").show();
        $("#done").hide();
        $("#deal").hide();
        $("#double").hide();
        $("#results").empty().append(result);
        $("#start").prop("disabled", false);
    }, slideCounter*500);
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
    for ( i = 0; i < num; i++)
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


