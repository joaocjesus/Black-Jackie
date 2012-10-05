var gameDeck, playerHand, dealerHand, playercardmargin, dealercardmargin, slideCounter, cycle, money;
var dealerlimit = 17;  // value at which the dealer will not deal again
var imagesPath = 'images/';
var hole = 'images/b.gif';
var imagesLoaded = 0;
var ppStr, dpStr;
var money = 100;
var webMoney = false;
var played = 0;
var won = 0;
var draw = 0;
var lost = 0;
var betValue = 0;
var hasWebStorage = false;
var doubled = false;
var webcount = 0;
var totalplayed = 0;
var totalwon = 0;
var totallost = 0;
var totaldraw = 0;
var blackjacks = 0;

$(document).ready(function() {
    $("#header").delay(500).slideDown(1000);
    cycle = getParameterByName("cycle");
    hasWebStorage = ('localStorage' in window) && window['localStorage'] !== null;
    if (hasWebStorage) {
        if (parseInt(localStorage.getItem("webcount")) > 0) {
            money = parseFloat(localStorage.getItem('money')).toFixed(1);
            totalplayed = parseInt(localStorage.getItem('played'));
            totalwon = parseInt(localStorage.getItem('won'));
            totallost = parseInt(localStorage.getItem('lost'));
            totaldraw = parseInt(localStorage.getItem('draw'));
            blackjacks = parseInt(localStorage.getItem('blackjacks'));
            webcount = parseInt(localStorage.getItem('webcount'));
            webcount++;
            localStorage.setItem("webcount", webcount);
            updateWebStats();
        }
        else {
            localStorage.setItem("money", money);
            localStorage.setItem("played", played);
            localStorage.setItem("won", won);
            localStorage.setItem("lost", lost);
            localStorage.setItem("draw", draw);
            localStorage.setItem("blackjacks", blackjacks);
            localStorage.setItem("webcount", 1);
        }        
        $("#info").append("Using HTML5 Web Storage");
    }
    else {
        $("#total").remove();
    }
    if(parseFloat(getParameterByName("money")).toFixed(1)>-1) {
        money = parseFloat(getParameterByName("money")).toFixed(1);
        if (money%1==0)
            money = parseInt(money);
    }
    play();
    if(cycle=='true' || cycle==true)
        runcycle();
});

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)')
                    .exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

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
    $(".bet input").change(function() {  // gets the bet value when the user selects a new value
        betValue = parseInt($(".bet input:radio:checked").val());
    });
    $("#showstats").click(function() {  //  Shows stats window
        window.scrollTo(0, 0);
        $("#stats").show();
        $("#stats").animate({"top": "0px"}, "slow");
        $("#closestats").click(function() {
            $("#stats").animate({"top": "-300px"}, "slow").fadeOut();
        });
        
    });
    $("#clearstats").click(function() {
        if(confirm("Are you sure you want to delete all statistics?")) {
            localStorage.clear();
            location.reload();
        }
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
    doubled = false;
    playercardmargin = 0;
    dealercardmargin = 0;
    ppStr = '';
    dpStr = '';
    slideCounter = 0;
    $(".bet input:radio").prop("disabled", false);
    $("#done").hide();
    $("#start").hide();
    $("#double").prop('disabled', true);
    if (imagesLoaded == 0) {
        $("#deal").prop('disabled', true);
        preloadImages(gameDeck);
    }
    $("#money").empty().append(money);
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
    if ($("#deal").prop("value") == "Deal" && $("#deal").is(":visible") &&  !$("#deal").is(":disabled")) {
        if (money>=betValue) {
            setBalance(-betValue);
            $("#pot").hide();
            $("#pot").empty().append(betValue);
            $("#pot").fadeIn();
        } 
        else {
            noMoney();
            return;
        }
    }
    $("#deal").prop("disabled", true);
    dealcards();
}

function noMoney() {
    if(money<1)
        $("#results").empty().append("You don't have enough money to play.<br />You can Clear stats to start over.");
    else {
        $("#results").empty().append("You don't have enough money to place that bet.<br />Please place a lower bet.");
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
        if (playerHand.blackjack) {
            blackjacks++;  // adds to the player blackjacks count
            if(!dealerHand.blackjack) {
                endGame("You WON with a BLACKJACK!!");
                win();
                return;
            }
            else {
                endGame("DRAW!! Both you and the dealer got a BLACKJACK!!");
                tie();
                return;
            }
        if (dealerHand.blackjack)
             if(!playerHand.blackjack) {
                endGame("You LOST!! Dealer wins with a BLACKJACK!!");
                loss();
                return;
            }
            else {
                endGame("DRAW!! Both you and the dealer got a BLACKJACK!!");
                tie();
                return;  
            }
        }
        if (betValue <= money)
            $("#double").show();
    } else if (playerHand.size()==1) {
            deal();  // deals a second card each if there is only one at each hand
            return;
    }
    else 
        if (playerHand.points() > 21) {
            if(!doubled)  // if the player doubled it will run the done() function later
                done();
            return;
        }
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
            return;
        }
        else {
            endGame("Both you and the dealer BUSTED!! You lost. (house advantage)");
            loss();
            return;
        }
    else if (playerHand.points() == dealerHand.points()) {
        endGame("DRAW!! You and the dealer got the same points.");
        tie();
    } else if (playerHand.points() < dealerHand.points()) {
        if (dealerHand.points() <= 21) {
            endGame("You LOST!! Dealer WON!!");
            loss();
            return;
        } else if (dealerHand.points() > 21) {
            endGame("You WON!! Dealer BUSTED!!");
            win();
            return;
        }
    } else if (playerHand.points() > dealerHand.points()) {
        if (dealerHand.points() < 21) {
            endGame("You WON!!");
            win();
            return;
        } else if (dealerHand.points() > 21) {
            endGame("You WON!! Dealer BUSTED!!");
            win();
            return;
        }
    }
}

function doubledown() {
    doubled = true;
    setBalance(-betValue);
    betValue*=2;
    $("#pot").hide();
    $("#pot").empty().append(betValue);
    $("#pot").fadeIn();
    deal();
    done();
}

function win() {
    won++;
    setBalance(betValue);
    $("#pot").hide();
    $("#pot").empty().append("(" + betValue + ")+" + betValue);
    $("#pot").fadeIn();
    if (playerHand.blackjack) {
        setBalance(betValue * 1.5);
    } else
        setBalance(betValue);
    updateStats();
}

function tie() {
    draw++;
    setBalance(betValue);
    $("#pot").hide();
    $("#pot").empty().append("(" + betValue + ")");
    $("#pot").fadeIn();
    updateStats();
}

function loss() {
    lost++;
    $("#pot").hide();
    $("#pot").empty().append("-(" + betValue + ")");
    $("#pot").fadeIn();
    updateStats();
}

function setBalance(cash) {
    money+=cash;
    $("#money").empty().append(money);
    if(hasWebStorage)
        localStorage.setItem("money", money);
}

function updateStats() {
    setTimeout(function () {
        $("#dealerhand .firstcard").attr("src", dealerHand.image(0));  // Shows the first dealer card
        $("#dealerpoints").empty().append(dpStr);
        played++;
        $("#session .played").empty().append(played);
        $("#session .won").empty().append(won + " <span class='percent'>(" + Math.round((won / played) * 100) + "%)</span>");
        $("#session .draw").empty().append(draw + " <span class='percent'>(" + Math.round((draw / played) * 100) + "%)</span>");
        $("#session .lost").empty().append(lost + " <span class='percent'>(" + Math.round((lost / played) * 100) + "%)</span>");
        $(".bet input:radio").prop("disabled", false);
        if (hasWebStorage)
            updateWebStats();
    }, slideCounter*500);
}

function updateWebStats() {
    var tplayed = totalplayed + played;
    var twon = totalwon + won;
    var tlost = totallost + lost;
    var tdraw = totaldraw + draw;
    localStorage.setItem("played", tplayed);
    localStorage.setItem("won", twon);
    localStorage.setItem("lost", tlost);
    localStorage.setItem("draw", tdraw);
    localStorage.setItem("blackjacks", blackjacks);
    $("#total .played").empty().append(tplayed);
    $("#stats .played").empty().append(tplayed);
    if(tplayed > 0) {
        $("#stats .won").empty().append(twon + " <span class='percent'>(" + Math.round((twon / tplayed) * 100) + "%)</span>");
        $("#stats .draw").empty().append(tdraw + " <span class='percent'>(" + Math.round((tdraw / tplayed) * 100) + "%)</span>");
        $("#stats .lost").empty().append(tlost + " <span class='percent'>(" + Math.round((tlost / tplayed) * 100) + "%)</span>");
        $("#stats .blackjacks").empty().append(blackjacks + " <span class='percent'>(" + Math.round((blackjacks / tplayed) * 100) + "%)</span>");
    }
    else {
        $("#stats .won").empty().append(twon);
        $("#stats .draw").empty().append(tdraw);
        $("#stats .lost").empty().append(tlost);
        $("#stats .blackjacks").empty().append(blackjacks);
     }    
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
    } else {
        slide(newCard, dealercardmargin);
        dealercardmargin += 30;
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
    $("#pot").empty();
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

function runcycle() {
    $("#debug").show();
    $("#debug").empty().append("<input id='stopdebug' type='button' value='Stop Cycle' />");
    var rundebug = setInterval(function(){
        if(slideCounter==0) {
            if(($("#deal").is(':visible') && $("#deal").prop("disabled", false)) && !$("#done").is(':visible'))
                $("#deal").click();
            else
                if($("#done").is(':visible') && $("#done").prop("disabled", false))
                    $("#done").click();
                else
                    if($("#start").is(':visible') && $("#start").prop("disabled", false))
                        $("#start").click();
        }
        if (money<1)
            clearInterval(rundebug);
    }, 1000);
    $("#stopdebug").click(function() {
         clearInterval(rundebug);
         $("#stopdebug").remove();
    });
}