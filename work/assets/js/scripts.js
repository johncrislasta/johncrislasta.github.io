let matchItems = ['PHP', 'JavaScript', 'HTML', 'CSS', 'WordPress', 'jQuery', 'WPBakery', 'Elementor', 'SEO', 'MySQL'];
// let matchItems = ['PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP'];
let staticItems = ['J', 'C', 'Y', 'L'];
let duplicateMatchItems = [].concat(matchItems, matchItems);
const matchFeedback = {
    'didNotBother': "Thanks for scrolling through! If you haven't tried the match-two game yet, give it a shot—it's a fun way to uncover the tech tools I love using.",
    'triedALittle': "Hey there! I noticed you gave the match-two game a go—awesome! Feel free to take another shot when you have a minute. It's a little sneak peek into my love for problem-solving.",
    'solvedOnce': "High five! You cracked the match-two game! Your attention to detail is spot on. Dive into the rest of the portfolio for more insights into my technical journey.",
    'solved2X': "Wow, double victory! You've mastered the match-two game. Your persistence is impressive. Explore further to uncover more about my coding adventures and projects.",
    'solvedManyXs': "Incredible! You've conquered the match-two game multiple times—talk about a true champion! Your enthusiasm is contagious. Check out more below to uncover the diverse projects and skills I'm passionate about.",
    'solvedFaster': "Whoa, speedy skills! You aced the match-two game in no time. Your agility is remarkable. Discover more about how this translates into my approach to development projects below.",
    'solvedPerfect': "Perfect execution! You cracked the match-two game with the fewest flips — amazing! Explore the rest of the portfolio to see how this precision plays out in my development endeavors."
}
let matchFeedbackKey = 'didNotBother';

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
let numberOfSolves = getNumOfSolves() ?? 0;

reshuffleMatchGrid();

function reshuffleMatchGrid() {
    updateLeastFlips( numberOfFlips );
    setNumOfSolves();
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

    staticItems.forEach(function(el) {
        let div = document.createElement("div");
        div.className = "static-card";
        div.innerHTML = `<span>${el}</span>`;
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
                    grid.classList.add('solved');
                    numberOfSolves++;
                    setNumOfSolves();

                    setTimeout(function(){
                        document.querySelectorAll(".flip-card-inner").forEach((el) => {
                            el.classList.add('animate__tada');
                        });
                        grid.classList.remove('solved');
                    }, 5000)

                    // Clear match grid and reshuffle
                    setTimeout( reshuffleMatchGrid, 6000 );
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

function setNumOfSolves() {
    localStorage.setItem( 'numSolves',  numberOfSolves );
    document.querySelector('#numOfSolves').innerHTML = numberOfSolves;
}

function getNumOfSolves() {
    return localStorage.getItem('numSolves' );
}

const matchGridFeedback = document.querySelector('#matchGridFeedback');
const matchGridFeedbackMessage = document.querySelector('#matchGridFeedbackMessage');
const matchGridNumOfFlips = document.querySelector('#matchGridNumOfFlips');
const matchGridBest = document.querySelector('#matchGridBest');
const matchGridNumOfSolves = document.querySelector('#matchGridNumOfSolves');

function getMatchGridFeedback() {

    if ( numberOfSolves == 0 ) {

        matchGridNumOfFlips.style.display = "none";
        matchGridBest.style.display = "none";
        matchGridNumOfSolves.style.display = "none";

        if( numberOfFlips > 0 ) {
            matchFeedbackKey = "triedALittle";
        }

    }
    else if ( numberOfSolves == 1 ) {
        matchFeedbackKey = "solvedOnce";
    }
    else if ( numberOfSolves == 2 ) {
        matchFeedbackKey = "solved2X";
    }
    else if ( numberOfSolves > 2 ) {
        matchFeedbackKey = "solvedManyXs";
    }

    if ( numberOfFlips == shuffledMatchItems.length )
        matchFeedbackKey = "solvedPerfect";

    let message = matchFeedback[matchFeedbackKey];

    matchGridFeedbackMessage.innerHTML = message;
    matchGridFeedback.style.display = "block";
}

// define an observer instance
let matchGridFeedbackObserver = new IntersectionObserver(getMatchGridFeedback, {
    root: null,   // default is the viewport
    threshold: 0.75 // percentage of target's visible area. Triggers "onIntersection"
})

// callback is called on intersection change
function onIntersection(entries, opts){
    entries.forEach(entry =>
        entry.target.classList.toggle('visible', entry.isIntersecting)
    )
}
// Use the observer to observe an element
matchGridFeedbackObserver.observe( document.querySelector('#intro') )

// To stop observing:
// observer.unobserve(entry.target)

const workSection = document.querySelector('section#work');

async function renderWorkGrid() {
    const response = await fetch("data/highlighted-work.json");
    const work = await response.json();
    work.forEach(function(el) {
        let div = document.createElement("div");
        let skills = el.skills.join(' | ');
        let workDetails = '';
        el.work.forEach(function(w) {
            workDetails += `<li>${w}</li>`;
        })
        div.id = "work-card-" + el.id;
        div.className = "work-card";
        div.innerHTML = `<div class="work-card-inner" onclick="openWorkCard(this)">
                    <div class="work-card-front" style="background-image: url(assets/img/work/${el.featured_image})">
                        <div class="work-card-front-label">
                            <div class="work-card-buttons">
                                <a href="${el.url}" target="_blank" title="Visit Page">
                                    <i class="button button-new-window"></i>
                                </a>
                                <i class="button button-close" onclick="event.stopPropagation(); closeWorkCard(this)"></i>
                            </div>
                            <h4>${el.title}</h4>
                            <h6>${skills}</h6>
                            <ul class="work-card-details">
                                ${workDetails}
                            </ul>
                        </div>                           
                    </div>
                </div>`;
        workSection.appendChild(div);
    });
}

renderWorkGrid();

function openWorkCard( card ) {
    if( card.parentElement.classList.contains('active') ) return;

    document.querySelector(`.work-card:not(#${card.parentElement.id})`).classList.remove('active');
    card.parentElement.classList.add('active');
    card.scrollIntoView();
}
function closeWorkCard( button ) {
    console.log(button.closest('.work-card').classList.contains('active'))
    button.closest('.work-card').classList.remove('active');
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