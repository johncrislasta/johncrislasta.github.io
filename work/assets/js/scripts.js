let skills = {};
// Fetch the JSON file
let skillsJsonFilePath = "data/skills.json";
let coreSkills = ['PHP', 'JavaScript', 'HTML', 'CSS', 'WordPress'];
let otherSkills = [];
fetch(skillsJsonFilePath)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch ${skillsJsonFilePath}`);
        }
        return response.json();
    })
    .then(jsonObject => {
        skills = jsonObject;

        let skillsArray = Object.keys(skills);
        otherSkills =  skillsArray.filter( function( el ) {
            return !coreSkills.includes( el );
        } );

        reshuffleMatchGrid();
    })
    .catch(error => {
        console.error('Error:', error);
    });


// Randomly select from the remaining skills to add into Match items
function getRandomSkills( skillSet, count ) {
    const shuffled = skillSet.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function getSkillsForMatchItems() {
    let matchItems = coreSkills.concat( getRandomSkills ( otherSkills, 5 ) );
    let duplicateMatchItems = [].concat(matchItems, matchItems);
    return duplicateMatchItems.sort(() => Math.random() - 0.5);

}
// let matchItems = ['PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP'];
let staticItems = ['J', 'C', 'Y', 'L'];
const matchFeedback = {
    'didNotBother': "Thanks for scrolling through! If you haven't tried the match-two game yet, give it a shot—it's a fun way to uncover the tech tools I love using.",
    'triedALittle': "Hey there! I noticed you gave the match-two game a go—awesome! Feel free to take another shot when you have a minute. It's a little sneak peek into my love for problem-solving.",
    'solvedOnce': "High five! You solved the match-two game! Your attention to detail is spot on. Dive into the rest of the portfolio for more insights into my technical journey.",
    'solved2X': "Wow, double victory! You've mastered the match-two game. Your persistence is impressive. Explore further to uncover more about my coding adventures and projects.",
    'solvedManyXs': "Incredible! You've conquered the match-two game multiple times—talk about a true champion! Your enthusiasm is contagious. Check out more below to uncover the diverse projects and skills I'm passionate about.",
    'solvedFaster': "Whoa, speedy skills! You aced the match-two game in no time. Your agility is remarkable. Discover more about how this translates into my approach to development projects below.",
    'solvedPerfect': "Perfect execution! You cracked the match-two game with the fewest flips — amazing! Explore the rest of the portfolio to see how this precision plays out in my development endeavors."
}
let matchFeedbackKey = 'didNotBother';

const grid = document.querySelector('#match-grid');
let shuffledMatchItems = [];
let flippedCard = [];
let solvedCards = [];
let numberOfFlips = 0;
let numberOfSolves = getNumOfSolves() ?? 0;

function reshuffleMatchGrid() {
    updateLeastFlips( numberOfFlips );
    setNumOfSolves();
    grid.innerHTML = "";
    flippedCard = [];
    solvedCards = [];
    numberOfFlips = 0;

    shuffledMatchItems = getSkillsForMatchItems();

    shuffledMatchItems.forEach(function(el) {
        let div = document.createElement("div");
        div.className = "flip-card";
        div.innerHTML = `<div class="flip-card-inner" onclick="openCard(this)" data-back="${el}">
                    <div class="flip-card-front">
                    </div>
                    <div class="flip-card-back" title="${skills[el].title}">
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
        matchGridNumOfFlips.style.display = "block";
        matchFeedbackKey = "solvedOnce";
    }
    else if ( numberOfSolves == 2 ) {
        matchGridNumOfFlips.style.display = "block";
        matchGridBest.style.display = "block";
        matchGridNumOfSolves.style.display = "block";
        matchFeedbackKey = "solved2X";
    }
    else if ( numberOfSolves > 2 ) {
        matchFeedbackKey = "solvedManyXs";
    }

    if ( numberOfFlips === shuffledMatchItems.length )
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
        let workGalleryItems = '';
        let workGalleryDots = '';
        let workGalleryItemIndex = 2;
        el.work.forEach(function(w) {
            workDetails += `<li>${w}</li>`;
        })
        el.gallery.forEach(function(g) {
            workGalleryItems += `<div class="work-card-gallery-item" data-index="${workGalleryItemIndex}" style="background-image: url(assets/img/work/${g})"></div>`;
            workGalleryDots += `<div class="work-card-gallery-dot" onclick="goToWorkGallerySlide(this)" data-index="${workGalleryItemIndex}"></div>`;
            workGalleryItemIndex++;
        });
        let workGallery = '';
        if ( el.gallery.length > 0 ) {
            workGallery = `<div class="work-card-gallery">
                            <div class="work-card-gallery-item active" data-index="1" style="background-image: url(assets/img/work/${el.featured_image})"></div>
                            ${workGalleryItems}
                        </div>
                        <div class="work-card-gallery-dots">
                            <div class="work-card-gallery-dot active" onclick="goToWorkGallerySlide(this)" data-index="1"></div>
                            ${workGalleryDots}
                            <div class="work-card-gallery-toggle playing" onclick="toggleWorkGallery(this)" data-index="1"></div>
                        </div>`;
        }

        div.id = "work-card-" + el.id;
        div.className = "work-card";
        div.setAttribute("onclick", "openWorkCard(this)");
        div.innerHTML = `<div class="work-card-inner">
                    <div class="work-card-front" style="background-image: url(assets/img/work/${el.featured_image})">
                        <div class="work-card-navigation">
                            <div class="work-card-prev" onclick="showPrevWorkCard()"></div>
                            <div class="work-card-next" onclick="showNextWorkCard()"></div>
                        </div>
                        ${workGallery}
                        <div class="work-card-front-label">
                            <div class="work-card-buttons">
                                <a href="${el.url}" target="_blank" title="Visit Page">
                                    <i class="button button-launch"></i>
                                </a>
                                <i class="button button-zoom" onclick="event.stopPropagation(); zoomInWorkCardImages(this)"></i>
                                <i class="button button-info" onclick="event.stopPropagation(); zoomOutWorkCardImages(this)"></i>
                                <i class="button button-close" onclick="event.stopPropagation(); closeWorkCard(this)"></i>
                            </div>
                            <h2>${el.title}</h2>
                            <h4>${el.summary}</h4>
                            <h6>${skills}</h6>
                            <ul class="work-card-details">
                                ${workDetails}
                            </ul>
                        </div>                           
                    </div>
                </div>`;
        workSection.appendChild(div);
    });

    initializeWorkGallerySliders();

}

renderWorkGrid();

function openWorkCard( card ) {
    if( card.classList.contains('active') ) return;

    document.querySelectorAll(`.work-card:not(#${card.id})`).forEach(e => {
        e.classList.remove('active');
        pauseWorkGallery(e.id);
    });
    card.classList.add('active');
    workSection.scrollIntoView();
    playWorkGallery(card.id);
}
function closeWorkCard( button ) {
    let card = button.closest('.work-card');
    card.classList.remove('active');
    pauseWorkGallery(card.id);
    workSection.scrollIntoView();
}
function showPrevWorkCard() {
    console.log(document.querySelector( '.work-card.active' ).previousElementSibling);
    document.querySelector( '.work-card.active' ).previousElementSibling.click();
    event.stopPropagation();
}
function showNextWorkCard() {
    console.log(document.querySelector( '.work-card.active' ).nextElementSibling);
    document.querySelector('.work-card.active').nextElementSibling.click();
    event.stopPropagation();
}

let workGallerySliders = [];

function initializeWorkGallerySliders() {
    let workCards = document.querySelectorAll('.work-card');

    workCards.forEach(function( card ) {
        let galleryItems = card.querySelectorAll('.work-card-gallery-item');
        if ( galleryItems.length <= 1 ) return false;
        workGallerySliders[card.id] = {
            index: 1,
            isPaused: true,
            slideInterval: null
        };
    })

}

let sliderSpeed = 5000;

function gotoWorkGallerySlide(sliderIndex, slideIndex) {
    console.log('showWorkGallerySlides ' + sliderIndex + "; slide index: " + slideIndex);

    const card = document.querySelector(`#${sliderIndex}`);
    let galleryItems = card.querySelectorAll('.work-card-gallery-item');
    if ( galleryItems.length === 1 ) return false;

    console.log('gallery items is more than one');

    let galleryDots = card.querySelectorAll('.work-card-gallery-dot');

    if (slideIndex > galleryItems.length) {
        slideIndex = 1;
    }
    galleryItems.forEach(e => e.classList.remove('active'));
    galleryDots.forEach(e => e.classList.remove('active'));

    galleryItems[slideIndex - 1].classList.add('active');
    galleryDots[slideIndex - 1].classList.add('active');

    return slideIndex;
}

function autoPlayWorkGallerySlides(sliderIndex) {

    const slider = workGallerySliders[sliderIndex];
    if (!slider.isPaused) {

        console.log('gallery is not paused');

        slider.index++;

        slider.index = gotoWorkGallerySlide(sliderIndex, slider.index);

        slider.slideInterval = setTimeout(() => autoPlayWorkGallerySlides(sliderIndex), sliderSpeed);
    }
}

function pauseWorkGallery(sliderIndex) {
    const slider = workGallerySliders[sliderIndex];
    if ( slider === undefined ) return false;

    if ( !slider.isPaused )
        clearTimeout(slider.slideInterval);

    slider.isPaused = true;
    const toggle = document.querySelector('#' + sliderIndex ).querySelector('.work-card-gallery-toggle');

    toggle.classList.add('paused');
    toggle.classList.remove('playing');

}

function playWorkGallery(sliderIndex) {
    const slider = workGallerySliders[sliderIndex];
    if ( slider === undefined ) return false;

    if ( slider.isPaused ) {
        console.log('slider should now play');
        setTimeout(() => autoPlayWorkGallerySlides(sliderIndex), sliderSpeed);
    }

    const toggle = document.querySelector('#' + sliderIndex ).querySelector('.work-card-gallery-toggle');

    toggle.classList.add('playing');
    toggle.classList.remove('paused');

    slider.isPaused = false;
}

function goToWorkGallerySlide(dot) {
    let n = dot.dataset.index;
    let sliderIndex = dot.closest('.work-card').id;

    const slider = workGallerySliders[sliderIndex];
    pauseWorkGallery(sliderIndex);
    slider.index = n;
    gotoWorkGallerySlide(sliderIndex, slider.index);
}

function toggleWorkGallery( toggle ) {
    let sliderIndex = toggle.closest('.work-card').id;

    const slider = workGallerySliders[sliderIndex];
    if( slider.isPaused ) {
        playWorkGallery(sliderIndex);
    } else {
        pauseWorkGallery(sliderIndex);
    }
}

function zoomInWorkCardImages( button ) {
    const workCardFront = button.closest('.work-card-front');
    const workCardGallery = workCardFront.querySelectorAll('.work-card-gallery-item');
    const sliderIndex = workCardFront.closest('.work-card').id;

    pauseWorkGallery( sliderIndex );

    workCardFront.classList.add('zoom');
    if( workCardFront.dataset.backgroundPosition )
        workCardFront.style.backgroundPosition = workCardFront.dataset.backgroundPosition;

    AttachDragBGTo(workCardFront);

    workCardGallery.forEach(function(item){
        if( item.dataset.backgroundPosition )
            item.style.backgroundPosition = item.dataset.backgroundPosition;
        AttachDragBGTo(item);
    });
}

function zoomOutWorkCardImages( button ) {
    const workCardFront = button.closest('.work-card-front');
    const workCardGallery = workCardFront.querySelectorAll('.work-card-gallery-item');

    workCardFront.classList.remove('zoom');

    workCardFront.dataset.backgroundPosition = workCardFront.style.backgroundPosition
    workCardFront.style.backgroundPosition = ''; // Remove background position

    workCardGallery.forEach(function(item){
        item.dataset.backgroundPosition = item.style.backgroundPosition
        item.style.backgroundPosition = ''; // Remove background position
    });

    workSection.scrollIntoView();
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

let AttachDragBGTo = (function () {
    let _AttachDragBGTo = function (el) {
        this.el = el;
        this.mouse_is_down = false;

        this.init();
    };

    _AttachDragBGTo.prototype = {
        onMousemove: function (e) {
            if ( !this.mouse_is_down ) return;
            let tg = e.target,
                x = e.clientX,
                y = e.clientY;

            tg.style.backgroundPositionX = x - this.origin_x + this.origin_bg_pos_x + 'px';
            tg.style.backgroundPositionY = y - this.origin_y + this.origin_bg_pos_y + 'px';
        },

        onTouchmove: function (e) {
            console.log('touch is moving: ', e);
            if ( !this.mouse_is_down ) return;
            let tg = e.target,
                x = e.changedTouches[0].clientX,
                y = e.changedTouches[0].clientY;

            tg.style.backgroundPositionX = x - this.origin_x + this.origin_bg_pos_x + 'px';
            tg.style.backgroundPositionY = y - this.origin_y + this.origin_bg_pos_y + 'px';
        },

        onMousedown: function(e) {
            this.mouse_is_down = true;
            this.origin_x = e.clientX;
            this.origin_y = e.clientY;
        },

        onTouchstart: function(e) {
            this.mouse_is_down = true;
            this.origin_x = e.changedTouches[0].clientX;
            this.origin_y = e.changedTouches[0].clientY;
        },

        onMouseup: function(e) {
            let tg = e.target,
                styles = getComputedStyle(tg);

            this.mouse_is_down = false;
            this.origin_bg_pos_x = parseInt(styles.getPropertyValue('background-position-x'), 10);
            this.origin_bg_pos_y = parseInt(styles.getPropertyValue('background-position-y'), 10);
        },

        onTouchend: function(e) {
            let tg = e.target,
                styles = getComputedStyle(tg);

            this.mouse_is_down = false;
            this.origin_bg_pos_x = parseInt(styles.getPropertyValue('background-position-x'), 10);
            this.origin_bg_pos_y = parseInt(styles.getPropertyValue('background-position-y'), 10);
        },

        init: function () {
            let styles = getComputedStyle(this.el);
            this.origin_bg_pos_x = parseInt(styles.getPropertyValue('background-position-x'), 10);
            this.origin_bg_pos_y = parseInt(styles.getPropertyValue('background-position-y'), 10);

            //attach events
            this.el.addEventListener('mousedown', this.onMousedown.bind(this), false);
            this.el.addEventListener('mouseup', this.onMouseup.bind(this), false);
            this.el.addEventListener('mousemove', this.onMousemove.bind(this), false);

            this.el.addEventListener('touchstart', this.onTouchstart.bind(this), false);
            this.el.addEventListener('touchend', this.onTouchend.bind(this), false);
            this.el.addEventListener('touchmove', this.onTouchmove.bind(this), false);
        }
    };

    return function ( el ) {
        new _AttachDragBGTo(el);
    };
})();