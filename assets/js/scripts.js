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

        initializeMatchGrid();

        animateSkillsCloud = new AnimateSkillsCloud();
        animateHeroCubes = new AnimateHeroCubes();
        // renderSkillsCloud();
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
    // Uncomment for testing match feedback
    // matchItems = ['PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP', 'PHP'];
    let duplicateMatchItems = [].concat(matchItems, matchItems);
    return duplicateMatchItems.sort(() => Math.random() - 0.5);
}

function getAllSkills() {
    let allSkills = coreSkills.concat( otherSkills );
    return allSkills;
}


let staticItems = [
    { title: 'LinkedIn', url: 'https://www.linkedin.com/in/jcylasta/', img: '/logos/LinkedIn.png'},
    { title: 'Resume', url: '/resume/John_Cris_Lasta-Resume-2024.pdf', img: '/logos/Resume.png'},
    { title: 'Mail', url: '#contactForm', img: '/logos/Mail.png'},
    { title: 'Back To Top', url: '#intro', img: '/logos/JCYL-logo-bw.png'}
];
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

const matchSection = document.querySelector('#match');
const matchGrid = document.querySelector('#matchGrid');
let isInitialMatchGrid = true;
let shuffledMatchItems = [];
let flippedCard = [];
let solvedCards = [];
let numberOfFlips = 0;
let numberOfSolves = getNumOfSolves() ?? 0;

function initializeMatchGrid() {
    updateLeastFlips( numberOfFlips );
    setNumOfSolves();
    matchGrid.innerHTML = "";
    flippedCard = [];
    solvedCards = [];
    numberOfFlips = 0;

    let allSkills = getAllSkills();

    allSkills.forEach(function(el) {
        let div = document.createElement("div");
        div.className = "flip-card";
        div.innerHTML = `<div class="flip-card-inner initial opened" onclick="openCard(this)" data-back="${el}">
                    <div class="flip-card-front">
                    </div>
                    <div class="flip-card-back" title="${skills[el].title}">
                        <h1>${skills[el].title}</h1>
                    </div>
                </div>`;
        matchGrid.appendChild(div);
    });

    renderStaticCards();

    adjustMatchBackTitleFontSizes();
    matchGrid.dispatchEvent(new Event('initializedMatchGrid'));
}

function reshuffleMatchGrid() {
    isInitialMatchGrid = false;
    updateLeastFlips( numberOfFlips );
    setNumOfSolves();
    matchGrid.innerHTML = "";
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
                        <h1>${skills[el].title}</h1>
                    </div>
                </div>`;
        matchGrid.appendChild(div);
    });

    renderStaticCards();

    adjustMatchBackTitleFontSizes();

    matchGrid.dispatchEvent(new Event('reshuffledMatchGrid'));
}

function renderStaticCards(){
    staticItems.forEach(function(el) {
        let div = document.createElement("div");
        let target = el.url.match(/#/) ? "" : "_blank";

        div.className = "static-card";
        div.style = `--background-image: url(../img/${el.img})`;
        div.innerHTML = `<a href="${el.url}" target="${target}"><span>${el.title}</span></a>`;
        matchGrid.appendChild(div);
    });
}

// Add click event listener for static card items
document.addEventListener('click', function(event) {
    if (event.target.matches('.static-card a[href*=contactForm]') ) {
        document.querySelector('#nameInput').focus();
    }
});

// Call the adjustFontSize function initially and on window resize
window.addEventListener('resize', adjustMatchBackTitleFontSizes);


function openCard( card ) {
    if ( matchGrid.classList.contains( 'locked' ) ) return false;
    if ( card.classList.contains( 'opened' ) ) return false;

    isPlayingMatchTwo = true;
    card.classList.add('opened');
    flippedCard.push(card);

    numberOfFlips++;
    updateNumOfFlips( numberOfFlips );

    if( flippedCard.length === 2) {
        matchGrid.classList.add('locked');

        // Check if they match
        if ( flippedCard[0].dataset.back === card.dataset.back ) {
            setTimeout(function(){
                flippedCard[0].classList.add( 'correct' );
                card.classList.add( 'correct' );
                solvedCards.push(flippedCard[0]);
                solvedCards.push(card);
                flippedCard = [];
                matchGrid.classList.remove('locked');

                // Check if all cards are solved
                if ( solvedCards.length === shuffledMatchItems.length ) {
                    matchGrid.dispatchEvent(new Event('matchGridSolved'));

                    isPlayingMatchTwo = false;
                    matchGrid.classList.add('solved');
                    numberOfSolves++;
                    setNumOfSolves();

                    setTimeout(function(){
                        document.querySelectorAll(".flip-card-inner").forEach((el) => {
                            el.classList.add('animate__tada');
                        });
                        matchGrid.classList.remove('solved');
                    }, 5000)

                    // Clear match matchGrid and reshuffle
                    setTimeout( reshuffleMatchGrid, 6000 );

                }
            }, 300);
        } else {
            setTimeout(function(){
                flippedCard.forEach(function(card){
                    closeCard( card );
                })
                flippedCard = [];
                matchGrid.classList.remove('locked');
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

        leastFlipsSpan.innerHTML = flips;
        leastFlipsSpan.setAttribute('title', getCurrentDateTime() );
    } else {
        leastFlipsSpan.innerHTML = leastFlips.count;
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
const playMatchTwo = document.querySelector('#playMatchTwo');
let isPlayingMatchTwo = false;

function getMatchGridFeedback() {
    // console.log('getMatchGridFeedback', numberOfSolves);

    if( isInitialMatchGrid ) return;
    if ( numberOfSolves == 0 ) {

        if( !isPlayingMatchTwo ) {
            matchGridNumOfFlips.style.display = "none";
            matchGridBest.style.display = "none";
            matchGridNumOfSolves.style.display = "none";
        }

        if( numberOfFlips > 0 ) {
            matchFeedbackKey = "triedALittle";
        }

    }
    else if ( numberOfSolves == 1 ) {
        playMatchTwo.style.display = "none";
        matchGridNumOfFlips.style.display = "block";
        matchFeedbackKey = "solvedOnce";
    }
    else if ( numberOfSolves == 2 ) {
        playMatchTwo.style.display = "none";
        matchGridNumOfFlips.style.display = "block";
        matchGridBest.style.display = "block";
        matchGridNumOfSolves.style.display = "block";
        matchFeedbackKey = "solved2X";
    }
    else if ( numberOfSolves > 2 ) {
        playMatchTwo.style.display = "none";
        matchGridNumOfFlips.style.display = "block";
        matchGridBest.style.display = "block";
        matchGridNumOfSolves.style.display = "block";
        matchFeedbackKey = "solvedManyXs";
    }

    if ( numberOfFlips === shuffledMatchItems.length )
        matchFeedbackKey = "solvedPerfect";

    let message = matchFeedback[matchFeedbackKey];

    matchGridFeedbackMessage.innerHTML = message;
    matchGridFeedback.style.display = "flex";
}

matchGrid.addEventListener('matchGridSolved', getMatchGridFeedback);

playMatchTwo.addEventListener('click', function(e) {

    let staggeredTimeout = 0;
    document.querySelectorAll('.flip-card-inner.opened').forEach( function (card) {
        setTimeout( function() { closeCard( card ) }, staggeredTimeout);
        staggeredTimeout += 25;
    })
    setTimeout( reshuffleMatchGrid, 800 );
    playMatchTwo.style.display = "none";
    matchGridNumOfFlips.style.display = "block";
    isPlayingMatchTwo = true;
})

let matchGridFeedbackObserver = new IntersectionObserver(getMatchGridFeedback, {
    root: null,   // default is the viewport
    threshold: 0.75 // percentage of target's visible area. Triggers "onIntersection"
})

/*function onIntersection(entries, opts){
    entries.forEach(entry =>
        entry.target.classList.toggle('visible', entry.isIntersecting)
    )
}*/

const introSection = document.getElementById('intro');
// Use the observer to observe an element
matchGridFeedbackObserver.observe( matchSection )

// To stop observing:
// observer.unobserve(entry.target)

/* --------------------
/* Skills Cloud - Start
/* -------------------- */
const skillsContainer = document.getElementById('skillsCloud');
const skillsContainerWidth = skillsContainer.offsetWidth;
const skillsContainerHeight = skillsContainer.offsetHeight;

// Variables to track the dragging state
let isDraggingSkill = false;
let offset = { x: 0, y: 0 };
let draggedSkill = null;

function renderSkillsCloud() {
    // Create skill divs based on the JSON data
    for (const skill in skills) {
        const skillDiv = document.createElement('div');
        skillDiv.dataset.id = skill;
        skillDiv.dataset.years = skills[skill].years;
        skillDiv.className = 'skill';
        skillDiv.textContent = skills[skill].title;
        skillsContainer.appendChild(skillDiv);

        // Set font size based on years
        const fontSize = 16 + skills[skill].years * 2; // Adjust the multiplier as needed
        skillDiv.style.fontSize = `${fontSize}px`;

        // Position skill divs randomly within the container
        positionSkillDiv(skillDiv, fontSize);

        // Add mousedown event listener to start dragging
        skillDiv.addEventListener('mousedown', (event) => {
            isDraggingSkill = true;
            draggedSkill = skillDiv;
            offset = {
                x: event.clientX - skillDiv.offsetLeft,
                y: event.clientY - skillDiv.offsetTop
            };
            skillDiv.classList.add('grabbing');
            // console.log('drag started', draggedSkill, offset, event.clientY)
        });


    }

    function positionSkillDiv(skillDiv, fontSize) {
        let positionX, positionY, attempts = 0;
        do {
            positionX = Math.random() * (skillsContainerWidth - fontSize);
            positionY = Math.random() * (skillsContainerHeight - fontSize);
            attempts++;
        } while (checkOverlap(positionX, positionY, skillDiv) && attempts < 10);
        let hasOverlapped = checkOverlap(positionX, positionY, skillDiv );
        // console.log('hasOverlapped', hasOverlapped);


        positionX = ( positionX / skillsContainerWidth ) * 100;
        positionY = ( positionY / skillsContainerHeight ) * 100;

        skillDiv.style.left = `${positionX}vw`;
        skillDiv.style.top = `${positionY}vh`;
    }

    function checkOverlap(x, y, skillDiv) {
        // Check if the new position overlaps with existing skill divs
        const existingSkills = document.querySelectorAll('.skill');
        for (const existingSkill of existingSkills) {

            // console.log( skillDiv, existingSkill, skillDiv === existingSkill );
            if( skillDiv === existingSkill ) continue;

            if ( elementsOverlap( skillDiv, existingSkill ) )
                return true;
        }

        let size = skillDiv.getBoundingClientRect();
        // Check if overflowing container
        return x + size.width > skillsContainerWidth ||
            y + size.height > skillsContainerHeight;
        // Not overlapping
    }

    function elementsOverlap(el1, el2) {
        const domRect1 = el1.getBoundingClientRect();
        const domRect2 = el2.getBoundingClientRect();

        // console.log(domRect1.top > domRect2.bottom,
        //     domRect1.right < domRect2.left,
        //     domRect1.bottom < domRect2.top,
        //     domRect1.left > domRect2.right,
        //     domRect1,
        //     domRect2
        //     )

        return !(
            domRect1.top > domRect2.bottom ||
            domRect1.right < domRect2.left ||
            domRect1.bottom < domRect2.top ||
            domRect1.left > domRect2.right
        );
    }

}
// Add mousemove and mouseup event listeners to handle dragging
skillsContainer.addEventListener('mousemove', (event) => {
    if (isDraggingSkill && draggedSkill) {
        const x = event.clientX - offset.x;
        const y = event.clientY - offset.y;
        // console.log(draggedSkill, x, y);
        draggedSkill.style.left = `${x}px`;
        draggedSkill.style.top = `${y}px`;
    }
});

skillsContainer.addEventListener('mouseup', () => {
    if (!draggedSkill) return;
    isDraggingSkill = false;
    draggedSkill.classList.remove('grabbing');
    draggedSkill = null;
});

let animateSkillsCloud;
function AnimateSkillsCloud() {
    this.timeouts = [];
    this.animationDone = false;
    skillsContainer.innerHTML = "";
    skillsContainer.classList.add('loading');
    navActions.intro.classList.add('animating');

    this.timeouts.push( new PausableTimeout(() => {
        renderSkillsCloud();
    }, 8500) );


    this.timeouts.push( new PausableTimeout(function(){
        skillsContainer.classList.add('centered');
    }, 9500) );
    this.timeouts.push( new PausableTimeout(function(){
        skillsContainer.classList.remove('loading');
    }, 10450) );
    this.timeouts.push( new PausableTimeout(function(){
        skillsContainer.classList.remove('centered');
        skillsContainer.classList.add('exploding');
    }, 10500) );
    this.timeouts.push( new PausableTimeout(function(){
        skillsContainer.classList.remove('exploding');
        navActions.intro.classList.remove('animating');
        this.animationDone = true;
    }, 10800) );

    this.isDone = function() {
        return this.animationDone;
    }

    this.pause = function() {
        this.timeouts.forEach( ( timeout ) => {
            timeout.pause();
        })
    }
    this.resume = function() {
        this.timeouts.forEach( ( timeout ) => {
            timeout.resume();
        })
    }
}

/* --------------------
/* Skills Cloud - End
/* -------------------- */


/* --------------------
/* Hero Cubes - Start
/* -------------------- */

const cubeShow = {
    front: { x: 0, y: 0, z: 0 },
    right: { x: 0, y: -90, z: 0 },
    back: { x: 0, y: -180, z: 0 },
    left: { x: 0, y: 90, z: 0 },
    top: { x: -90, y: 0, z: 0 },
    bottom: { x: 90, y: 0, z: 0 }
}

class Cube {
    constructor(cubeId, containerId, faceLabels = ['front', 'back', 'right', 'left', 'top', 'bottom']) {
        this.isDragging = false;
        this.previousX = 0;
        this.previousY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.rotationX = 0;
        this.rotationY = 0;

        this.container = document.getElementById(containerId);
        this.faceLabels = faceLabels;
        this.facing = '';
        this.id = cubeId;
        this.createCube();
        this.addEventListeners();

        this.isAnimating = false;
    }

    createCube() {
        this.cube = document.createElement('div');
        this.cube.id = this.id;
        this.cube.className = 'cube show-front';
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];

        let faceLabelsIdx = 0;
        faces.forEach((face) => {
            let faceLabel = this.faceLabels[faceLabelsIdx];
            const faceElement = document.createElement('div');
            faceElement.className = `cube__face cube__face--${face}`;
            faceElement.textContent = faceLabel;
            faceElement.dataset.label = faceLabel;
            this.cube.appendChild(faceElement);
            faceLabelsIdx++;
        });

        this.container.appendChild(this.cube);
    }

    addEventListeners() {
        document.addEventListener('mousedown', (e) => {
            if( e.target.classList.contains('cube__face') ){
                this.isDragging = true;
                this.previousX = e.clientX;
                this.previousY = e.clientY;
                this.cube.parentElement.classList.add('grabbing');
                this.cube.className = 'cube';
            } else {
                this.isDragging = false;
            }
        });

        document.addEventListener('touchstart', (e) => {
            if( e.target.classList.contains('cube__face') ){
                this.isDragging = true;
                this.previousX = e.changedTouches[0].clientX;
                this.previousY = e.changedTouches[0].clientY;
                this.cube.className = 'cube';
                e.stopPropagation();
            } else {
                this.isDragging = false;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            this.currentX = e.clientX;
            this.currentY = e.clientY;

            const deltaX = this.currentX - this.previousX;
            const deltaY = this.currentY - this.previousY;

            this.rotationY += deltaX * 0.5;
            this.rotationX -= deltaY * 0.5;

            this.cube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;

            this.previousX = this.currentX;
            this.previousY = this.currentY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;

            this.currentX = e.changedTouches[0].clientX;
            this.currentY = e.changedTouches[0].clientY;

            const deltaX = this.currentX - this.previousX;
            const deltaY = this.currentY - this.previousY;

            this.rotationY += deltaX * 0.5;
            this.rotationX -= deltaY * 0.5;

            this.cube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;

            this.previousX = this.currentX;
            this.previousY = this.currentY;
        });

        document.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;

            let face = this.getFacingFace(this.rotationX, this.rotationY);
            this.cube.parentElement.classList.remove('grabbing');
            this.setFacingFace(face);
            this.cube.dataset.face = face;
            this.cube.dispatchEvent(new Event('cubeRotated') );
        });

        document.addEventListener('touchend', () => {
            if (!this.isDragging) return;
            this.isDragging = false;

            let face = this.getFacingFace(this.rotationX, this.rotationY);
            this.setFacingFace(face);
            this.cube.dataset.face = face;
            this.cube.dispatchEvent(new Event('cubeRotated') );
        });

        document.addEventListener('scroll', () => {

            if( this.isAnimating ) return false;
            // Get the scroll percentage
            const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

            // Define the maximum rotation angle (positive or negative) you want when scrolling
            const maxRotation = 30;
            let newRotation = this.rotationX + scrollPercentage;

            if(this.facing === 'left') {
                newRotation = scrollPercentage;
                this.cube.style.transform = `translateZ( calc( var(--cube-length) * -1 ) ) rotateY(${this.rotationY}deg) rotateX(${this.rotationX}deg) rotateZ(${newRotation}deg)`;
            } else if(this.facing === 'right')  {
                newRotation = scrollPercentage * -1;
                this.cube.style.transform = `translateZ( calc( var(--cube-length) * -1 ) ) rotateY(${this.rotationY}deg) rotateX(${this.rotationX}deg) rotateZ(${newRotation}deg)`;
            } else if(this.facing === 'back')  {
                newRotation = this.rotationX + ( scrollPercentage * -1 );
                this.cube.style.transform = `translateZ( calc( var(--cube-length) * -1 ) ) rotateY(${this.rotationY}deg) rotateX(${newRotation}deg) rotateZ(0deg)`;
            } else {
                this.cube.style.transform = `translateZ( calc( var(--cube-length) * -1 ) ) rotateY(${this.rotationY}deg) rotateX(${newRotation}deg) rotateZ(0deg)`;
            }
            // Calculate the new rotation angle based on scroll percentage

            // Apply the new rotation to the cube
            // console.log('scrolling', scrollPercentage, newRotation, this.cube.style);
        });
    }

    clearStyles () {
        this.cube.style = null;
    }

    setFacingFace( face ) {
        this.rotationX = cubeShow[face].x;
        this.rotationY = cubeShow[face].y;

        if( is_safari_apple_silicon ) {
            this.rotationX += 0.1;
            this.rotationY += 0.1;
        }

        this.cube.classList.add('show-' + face);
        this.cube.style.transform = `translateZ( calc( var(--cube-length) * -1 ) )
            rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg) rotateZ(0deg)`;
        this.facing = face;
    }

    getFacingFace(rotationX, rotationY) {
        // Define threshold values for each face
        const threshold = 45;

        // Normalize rotation values to be within the range [0, 360)
        rotationX = (rotationX % 360 + 360) % 360;
        rotationY = (rotationY % 360 + 360) % 360;

        // Check each face based on rotation angles
        if (rotationX >= 90 - threshold && rotationX < 90 + threshold) {
            return 'bottom';
        } else if (rotationX >= 270 - threshold && rotationX < 270 + threshold) {
            return 'top';
        } else if (rotationY < threshold || rotationY >= 360 - threshold) {
            return 'front';
        } else if (rotationY >= 90 - threshold && rotationY < 90 + threshold) {
            return 'left';
        } else if (rotationY >= 180 - threshold && rotationY < 180 + threshold) {
            return 'back';
        } else if (rotationY >= 270 - threshold && rotationY < 270 + threshold) {
            return 'right';
        }

        // If rotationY doesn't fall into any specific range, return null or a default face
        return 'unknown';
    }

    autoRotate() {
        this.rotationY += 1;
        this.cube.style.transform = `rotateX(${this.rotationX}deg) rotateY(${this.rotationY}deg)`;

        requestAnimationFrame(() => this.autoRotate());
    }
}

let heroCubes = [];

const cube1Faces = ['Sol', 'Wo', 'In', 'Web', 'John', 'J'];
heroCubes.push( new Cube('cube1', 'cubeScene1', cube1Faces) );

const cube2Faces = ['ving', 'rd', 'no', 'Dev', 'Cris', 'C'];
heroCubes.push( new Cube('cube2', 'cubeScene2', cube2Faces ) );

const cube3Faces = ['Prob', 'Pr', 'va', 'elo', 'Yañez', 'Y'];
heroCubes.push( new Cube('cube3', 'cubeScene3', cube3Faces ) );

const cube4Faces = ['lems', 'ess', 'tion', 'per', 'Lasta', 'L'];
heroCubes.push( new Cube('cube4', 'cubeScene4', cube4Faces) );


const heroTitles = ['My name is', 'I am a', 'I enjoy', 'I embrace', 'I love', 'I am']
const autoAnimateCubeFace = ['top', 'left', 'front', 'right', 'back', 'bottom'];

const heroTitle = document.querySelector('#heroTitle');

let animateHeroCubes;
function AnimateHeroCubes() {
    this.timeouts = [];
    this.animationDone = false;

    const animation = this;

    heroCubes.forEach(function(cube){
        cube.isAnimating = true;
        cube.setFacingFace('top')
    });
    heroTitle.innerHTML = heroTitles[0];
    for( let i = 1; i <= 5; i++ ){
        this.timeouts.push( new PausableTimeout(function(){
            heroCubes.forEach(function(cube){
                cube.setFacingFace(autoAnimateCubeFace[i])
            });
            heroTitle.innerHTML = heroTitles[i];
        }, 2000 * i ) );
    }
    for( let i = 1; i <= 4; i++ ){
        this.timeouts.push( new PausableTimeout(function(){
            let highlightedCube = document.getElementById("cubeScene" + i);
            highlightedCube.classList.add('highlight');
            if( highlightedCube.previousElementSibling )
                highlightedCube.previousElementSibling.classList.remove('highlight');
        }, 10000 + 100 * i ) );
    }
    this.timeouts.push( new PausableTimeout (function(){
        let highlightedCube = document.getElementById("cubeScene4");
        highlightedCube.classList.remove('highlight');

        navActions.intro.classList.add('show');
        animation.animationDone = true;
        heroCubes.forEach(function(cube){
            cube.isAnimating = false;
        });
    }, 10500 ) );

    this.isDone = function (){
        return this.animationDone;
    }

    this.pause = function() {
        this.timeouts.forEach( ( timeout ) => {
            timeout.pause();
        })
    }
    this.resume = function() {
        this.timeouts.forEach( ( timeout ) => {
            timeout.resume();
        })
    }
}


document.querySelectorAll('.cube').forEach( (cube) =>{
    cube.addEventListener("cubeRotated", function (e) {
        if( e.target.dataset.face ) {
            heroTitle.innerHTML = heroTitles[ autoAnimateCubeFace.indexOf( e.target.dataset.face )];
        }
    });
});


/* --------------------
/* Hero Cubes - End
/* -------------------- */

// Parallax effect on scroll
window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    // Translate skill divs on the Y-axis based on scroll and years
    skillsContainer.querySelectorAll('.skill').forEach(skillDiv => {
        const speed = skills[skillDiv.dataset.id].years / 5; // Adjust the divisor as needed
        const translateY = scrollY * speed;
        skillDiv.style.transform = `translateY(${translateY}px)`;
    });
});

const workSection = document.querySelector('section#work');
let workCards = [];

async function renderWorkGrid() {
    const response = await fetch("data/highlighted-work.json");
    const work = await response.json();
    let workIndex = 0;
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
        div.dataset.url = el.url;
        div.setAttribute("onclick", "openWorkCard(this)");
        div.innerHTML = `<div class="work-card-inner">
                    <div class="work-card-front">
                        <div class="work-card-background"  style="background-image: url(assets/img/work/${el.featured_image})"></div>
                        <div class="work-card-navigation">
                            <div class="work-card-prev" onclick="showPrevWorkCard()"></div>
                            <div class="work-card-next" onclick="showNextWorkCard()"></div>
                        </div>
                        ${workGallery}
                        <div class="work-card-front-label">
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
        workIndex++;
    });

    initializeWorkGallerySliders();
    workCards = document.querySelectorAll('.work-card');

    workSection.dispatchEvent(new Event("renderedWorkGrid"));
}

renderWorkGrid();

let activeWorkIndex = -1;

function openWorkIndex( index ) {
    if( index > workCards.length ) return false;
    const card = workCards[index];
    openWorkCard( card );
}

function openWorkCard( card ) {
    if( card.classList.contains('active') ) return;

    document.querySelectorAll(`.work-card:not(#${card.id})`).forEach(e => {
        e.classList.remove('active');
        pauseWorkGallery(e.id);
    });
    card.classList.add('active');
    workSection.scrollIntoView();
    playWorkGallery(card.id);
    navActions.work.classList.add('opened');
    activeWorkIndex = card.dataset.index;
}
function closeWorkCard( card ) {
    card.classList.remove('active');
    pauseWorkGallery(card.id);
    workSection.scrollIntoView();
    navActions.work.classList.remove('opened');

    zoomOutWorkCardImages( card );
}
function showPrevWorkCard() {
    // console.log(document.querySelector( '.work-card.active' ).previousElementSibling);
    document.querySelector( '.work-card.active' ).previousElementSibling.click();
    event.stopPropagation();
}
function showNextWorkCard() {
    // console.log(document.querySelector( '.work-card.active' ).nextElementSibling);
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
    // console.log('showWorkGallerySlides ' + sliderIndex + "; slide index: " + slideIndex);

    const card = document.querySelector(`#${sliderIndex}`);
    let galleryItems = card.querySelectorAll('.work-card-gallery-item');
    if ( galleryItems.length === 1 ) return false;

    // console.log('gallery items is more than one');

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

        // console.log('gallery is not paused');

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
        // console.log('slider should now play');
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

function zoomInWorkCardImages( card ) {
    const workCardFront = card.querySelector('.work-card-front');
    const workCardBG = workCardFront.querySelector('.work-card-background');
    const workCardGallery = workCardFront.querySelectorAll('.work-card-gallery-item');
    const sliderIndex = workCardFront.closest('.work-card').id;

    pauseWorkGallery( sliderIndex );

    workCardFront.classList.add('zoom');
    // console.log(workCardFront);
    if( workCardFront.dataset.backgroundPosition )
        workCardBG.style.backgroundPosition = workCardFront.dataset.backgroundPosition;

    AttachDragBGTo(workCardFront);

    workCardGallery.forEach(function(item){
        if( item.dataset.backgroundPosition )
            item.style.backgroundPosition = item.dataset.backgroundPosition;
        AttachDragBGTo(item);
    });


    navActions.work.classList.add('zoomed');
}

function zoomOutWorkCardImages( card ) {
    const workCardFront = card.querySelector('.work-card-front');
    const workCardBG = workCardFront.querySelector('.work-card-background');
    const workCardGallery = workCardFront.querySelectorAll('.work-card-gallery-item');

    workCardFront.classList.remove('zoom');

    workCardFront.dataset.backgroundPosition = workCardFront.style.backgroundPosition
    workCardBG.style.backgroundPosition = ''; // Remove background position

    workCardGallery.forEach(function(item){
        item.dataset.backgroundPosition = item.style.backgroundPosition
        item.style.backgroundPosition = ''; // Remove background position
    });

    workSection.scrollIntoView();
    navActions.work.classList.remove('zoomed');

}

const mainNav = document.getElementById('mainNav');

const cubesObserver = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) {
        animateSkillsCloud.pause();
        animateHeroCubes.pause();
        mainNav.classList.add('fixed');
    }
    else {
        if(animateSkillsCloud && animateHeroCubes) {
            animateSkillsCloud.resume();
            animateHeroCubes.resume();
        }
        mainNav.classList.remove('fixed');
    }
});

cubesObserver.observe(document.querySelector("#cubeContainer"));

let observerThresholds = {
    intro: calculateThresholds('intro'),
    work: calculateThresholds('work'),
    about: calculateThresholds('about'),
    match: calculateThresholds('match')
}

const navMenuItems = {
    intro: document.querySelector('#introMenuItem'),
    work: document.querySelector('#workMenuItem'),
    about: document.querySelector('#aboutMenuItem'),
    match: document.querySelector('#matchMenuItem'),
}

const navActions = {
    intro: document.querySelector('#introActions'),
    work: document.querySelector('#workActions'),
    about: document.querySelector('#aboutActions'),
    match: document.querySelector('#matchGridFeedback'),
}

function calculateThresholds( sectionID ) {
    const section = document.querySelector( '#' + sectionID );
    const vwHeight = window.innerHeight;

    if( section.offsetHeight === 0 ) return 0;

    let threshold = 0.4 * vwHeight / section.offsetHeight;

    // console.log('threshold: ' + threshold, vwHeight, section.offsetHeight, section);
    return threshold;
}

function updateObserverThresholds() {
    observerThresholds = {
        intro: calculateThresholds('intro'),
        work: calculateThresholds('work'),
        about: calculateThresholds('about'),
        match: calculateThresholds('match')
    }
}

workSection.addEventListener('renderedWorkGrid', (e) => { updateObserverThresholds(); observeSections(); } );
matchGrid.addEventListener('initializedMatchGrid', (e) => updateObserverThresholds() );

let sectionIntersectionObservers = {};
// Section Observer
function observeSections() {
    document.querySelectorAll("section").forEach(function(section){
        sectionIntersectionObservers[section.id] = new IntersectionObserver( function(entries){
            let section = entries[0].target;
            // console.log(entries);
            // console.log(section.id, navActions, navActions[section.id]);
            if ( !entries[0].isIntersecting ) {
                navMenuItems[section.id].classList.remove('active');
                navActions[section.id].classList.remove('show');

            } else {
                navMenuItems[section.id].classList.add('active');
                navActions[section.id].classList.add('show');
                // console.log(section.id + ' is intersecting yes!', navActions[section.id].classList);

                // alert('section: ' + section.id);
                if(section.id !== 'intro')
                    mainNav.classList.add('fixed');
                else
                    mainNav.classList.remove('fixed');
            }

        }, {
            root: null,   // default is the viewport
            threshold: observerThresholds[section.id] // percentage of target's visible area. Triggers "onIntersection"
        });

        sectionIntersectionObservers[section.id].observe(section);
    })
}
/* --------------------------------------
    Nav actions event listeners - START
/* -------------------------------------- */
document.getElementById("restartAnimationAction").addEventListener("click", function(e){
    e.target.parentElement.classList.remove('show');
    animateSkillsCloud = new AnimateSkillsCloud();
    animateHeroCubes = new AnimateHeroCubes();
});
document.getElementById("openWork").addEventListener("click", function(e){
    if(activeWorkIndex < 0 || activeWorkIndex === undefined)
        openWorkIndex(0);
    else
        openWorkIndex(activeWorkIndex);
});
document.getElementById("closeWork").addEventListener("click", function(e){
    const card = document.querySelector('.work-card.active');
    closeWorkCard(card);
});
document.getElementById("visitSiteWork").addEventListener("click", function(e){
    const card = document.querySelector('.work-card.active');
    window.open(card.dataset.url);
});
document.getElementById("zoomInWork").addEventListener("click", function(e){
    const card = document.querySelector('.work-card.active');
    zoomInWorkCardImages( card );
});
document.getElementById("zoomOutWork").addEventListener("click", function(e){
    const card = document.querySelector('.work-card.active');
    zoomOutWorkCardImages( card );
});
/* --------------------------------------
    Nav actions event listeners - END
/* -------------------------------------- */


/* -------------------
/*  Utilities - START
/* ------------------- */

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
            // console.log('touch is moving: ', e);
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

function adjustMatchBackTitleFontSizes(){
    let baseFontSize = 22;
    if(window.outerWidth < 412)
        baseFontSize = 12;
    else if(window.outerWidth < 490)
        baseFontSize = 18;

    let matchH1s = document.querySelectorAll('.flip-card-back h1');
    matchH1s.forEach(function(h1) {
        adjustFontSize( h1.parentElement, h1, baseFontSize);
    })
    let staticSpans = document.querySelectorAll('.static-card span');
    staticSpans.forEach(function(span) {
        adjustFontSize( span.parentElement, span, baseFontSize);
    })
}

// Function to adjust font size based on container width and text length
function adjustFontSize(container, adjustableText, baseFontSize) {

    const containerStyles = window.getComputedStyle(container, null);
    const containerWidth = container.offsetWidth;
    const textLength = adjustableText.scrollWidth;

    baseFontSize = baseFontSize ?? 32;
    // Calculate the font size based on the ratio of container width to text length
    let fontSize = containerWidth / textLength * baseFontSize;
    fontSize = fontSize > baseFontSize ? baseFontSize : fontSize;
    // console.log(container, adjustableText, containerWidth, textLength, baseFontSize, fontSize);

    // Apply the calculated font size to the text element
    adjustableText.style.fontSize = `${fontSize}px`;
}

function PausableTimeout(callback, delay) {
    this.timerId,
    this.start,
    this.remaining = delay;

    this.pause = function() {
        clearTimeout(this.timerId);
        this.remaining -= Date.now() - this.start;
    };

    this.resume = function() {
        if( this.remaining < 0 ) return false;
        this.start = Date.now();
        clearTimeout(this.timerId);
        this.timerId = setTimeout(callback, this.remaining);
        return true;
    };

    this.resume();
}

const is_safari_apple_silicon = checkIfBrowserIsSafariAppleSilicon();

function checkIfBrowserIsSafariAppleSilicon() {
    let is_mac_os_x_10_15 = navigator.userAgent.match(/OS X 10_([789]|1[012345])/);
    let is_safari = navigator.userAgent.match(/\(KHTML, like Gecko\) Version\/1[67].[01234]/);

    return !!(is_mac_os_x_10_15 && is_safari);
}

// Function to get browser and device information
function getClientInfo() {
    let browserInfo = {
        userAgent: navigator.userAgent,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        vendor: navigator.vendor,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio
    };
    return browserInfo;
}

// Usage example
let clientInfo = getClientInfo();

/*
console.log(clientInfo);

const successCallback = (position) => {
    console.log(position);
    // Handle the user's location data (latitude and longitude) here
};

const errorCallback = (error) => {
    console.log(error);
    // Handle errors (e.g., permission denied, location unavailable) here
};

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
        enableHighAccuracy: true, // Request high accuracy if available
        timeout: 5000, // Set a timeout for the request
        maximumAge: 0 // Don't use cached location data
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}
*/

/* -------------------
/*  Utilities - END
/* ------------------- */


/* ----------------------
/*  Contact Form - START
/* ---------------------- */

const contactForm = document.getElementById("contactForm");
let submissionAuthenticator = {};

async function contactHandleSubmit(event) {
    event.preventDefault();
    const status = document.getElementById("formStatus");
    const submitButton = document.getElementById("submitButton");
    let data = new FormData(event.target);
    submissionAuthenticator['timeTaken'] = timesTaken;

    let matchTwoDetails = {
        leastFlips: localStorage.getItem('leastFlips'),
        numSolves: getNumOfSolves(),
    }
    timesTaken = {};

    data.append("submissionAuthenticator", JSON.stringify(submissionAuthenticator));
    data.append("matchTwoDetails", JSON.stringify(matchTwoDetails));
    data.append("clientInfo", JSON.stringify(clientInfo));

    console.log(submissionAuthenticator);

    submitButton.innerText = 'Sending...';
    submitButton.disabled = true;
    fetch(event.target.action, {
        method: contactForm.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            response.json().then(data => {
                console.log(data);

                if ( data.success ) {
                    status.innerHTML = "Many thanks for reaching out! I'll get back to you as fast as I can!";
                    contactForm.reset()
                }
                else{
                    status.innerHTML = "Failed to send message. " + data.error;

                }
            })
        } else {
            response.json().then(data => {
                if (Object.hasOwn(data, 'error')) {
                    status.innerHTML = data["error"].map(error => error["message"]).join(", ")
                } else {
                    status.innerHTML = "Oops! There was a problem submitting your form"
                }
            })
        }

        submitButton.innerText = 'Send';
        submitButton.disabled = false;
    }).catch(error => {
        status.innerHTML = "Oops! There was a problem submitting your form";

        submitButton.innerText = 'Send';
        submitButton.disabled = false;
    });
}
contactForm.addEventListener("submit", contactHandleSubmit);

const startTime = {}; // Store start times for each field
let timesTaken = {}; // Store start times for each field

// Record start time when user focuses on an input field
function recordStartTime(event) {
    const fieldId = event.target.id;
    startTime[fieldId] = Date.now();
}

// Calculate and display time taken when user blurs an input field
function calculateTimeTaken(event) {
    const fieldId = event.target.id;
    const endTime = Date.now();
    const timeTaken = (endTime - startTime[fieldId]) / 1000; // Convert to seconds
    if( timesTaken[fieldId] )
        timesTaken[fieldId] += timeTaken;
    else
        timesTaken[fieldId] = timeTaken;
    console.log(`Time taken for ${fieldId}: ${timeTaken} seconds`);
}

// Attach event listeners to input fields

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const messageArea = document.getElementById("messageArea");

nameInput.addEventListener('focus', recordStartTime);
emailInput.addEventListener('focus', recordStartTime);
messageArea.addEventListener('focus', recordStartTime);

nameInput.addEventListener('blur', calculateTimeTaken);
emailInput.addEventListener('blur', calculateTimeTaken);
messageArea.addEventListener('blur', calculateTimeTaken);


/* -------------------
/*  Contact Form - END
/* ------------------- */
