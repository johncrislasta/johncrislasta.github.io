let matchItems = ['PHP', 'JS', 'HTML', 'CSS', 'WordPress', 'ReactJS', 'Laravel'];
let duplicateMatchItems = [].concat(matchItems, matchItems);

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

const grid = document.querySelector('#match-grid');
let shuffledMatchItems = [];
let flippedCard = [];
let solvedCards = [];
let numberOfFlips = 0;

reshuffleMatchGrid();

function reshuffleMatchGrid() {
    updateLeastFlips( numberOfFlips );
    grid.innerHTML = "";
    flippedCard = [];
    solvedCards = [];
    numberOfFlips = 0;

    shuffledMatchItems = shuffle(duplicateMatchItems);

    shuffledMatchItems.forEach(function(el) {
        let div = document.createElement("div");
        div.className = "flip-card";
        div.innerHTML = `<div class="flip-card-inner" onclick="openCard(this)" data-back="${el}">
                    <div class="flip-card-front">
                    </div>
                    <div class="flip-card-back">
                        <h1>${el}</h1>
                    </div>
                </div>`;
        grid.appendChild(div);
    });
}

function openCard( card ) {
    if ( grid.classList.contains( 'locked' ) ) return false;
    if ( card.classList.contains( 'opened' ) ) return false;

    card.classList.add('opened');
    flippedCard.push(card);

    numberOfFlips++;
    updateNumOfFlips( numberOfFlips );

    if( flippedCard.length === 2) {
        grid.classList.add('locked');

        console.log([flippedCard[0].dataset.back === card.dataset.back , flippedCard[0].dataset.back, card.dataset.back ])
        // Check if they match
        if ( flippedCard[0].dataset.back === card.dataset.back ) {
            setTimeout(function(){
                flippedCard[0].classList.add( 'correct' );
                card.classList.add( 'correct' );
                solvedCards.push(flippedCard[0]);
                solvedCards.push(card);
                flippedCard = [];
                grid.classList.remove('locked');

                // Check if all cards are solved
                if ( solvedCards.length === shuffledMatchItems.length ) {
                    document.querySelectorAll(".flip-card-inner").forEach((el) => {
                        el.classList.add('animate__tada');
                    });

                    // Clear match grid and reshuffle
                    setTimeout( reshuffleMatchGrid, 1000 );
                }
            }, 300);
        } else {
            setTimeout(function(){
                flippedCard.forEach(function(card){
                    closeCard( card );
                })
                flippedCard = [];
                grid.classList.remove('locked');
            }, 1000);
        }
    }
}

function closeCard( card ) {
    card.classList.remove('opened');
}

function updateNumOfFlips( number ) {
    document.querySelector('#numOfFlips' ).innerHTML = number ;
}

function updateLeastFlips( flips ) {
    let leastFlips = JSON.parse( localStorage.getItem('leastFlips') ) ?? { count: 99999, date: '' };
    if ( flips === 0 ) {
        if ( leastFlips.date === "" )
            return;
        else
            flips = leastFlips.count;
    }

    const leastFlipsSpan = document.querySelector('#leastFlips' );

    if( leastFlips.count > flips ) {
        localStorage.setItem('leastFlips', JSON.stringify({ count: flips, date: getCurrentDateTime() }))

        leastFlipsSpan.innerHTML = flips + " flips";
        leastFlipsSpan.setAttribute('title', getCurrentDateTime() );
    } else {
        leastFlipsSpan.innerHTML = leastFlips.count + " flips";
        leastFlipsSpan.setAttribute('title', leastFlips.date );
    }
}

function getCurrentDateTime(){
    let currentdate = new Date();
    let datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth()+1)  + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    return datetime;
}