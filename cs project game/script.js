console.log("js loaded")
//everything "console.log" is for me to see in edge developer tools to make sure my functions are working properly


//database for the plants in the game
const plants = {
    //adds the plant images in and assigns each image to the corresponding plant

    starter: {
        displayName: "tulip",
        images: [
            "images/starter_0.png",
            "images/starter_1.png",
            "images/starter_2.png",
            "images/starter_3.png"
        ],
        requiredTasks: 3,
        //plant requires 3 tasks to grow fully
        cost: 10,
        //price in shop
        requiredLevel: 1
        //minimum level needed to buy
    },

    rose: {
        displayName: "rose",
        images: [
            "images/rose_0.png",
            "images/rose_1.png",
            "images/rose_2.png",
            "images/rose_3.png",
            "images/rose_4.png"
        ],
        requiredTasks: 10,
        cost: 25,
        requiredLevel: 3
    }
};


//global variables of current game state
//using "let" because the numbers will change (increase/decrease) - if "const" was used, the program would crash if i tried to add +10xp
let xp = 0;
let level = 1;
let coins = 0;


//shared function which works on all pages
function toggleMenu() {
    //controls hamburger menu

    const menu = document.querySelector(".nav-menu"); //document = the whole webpage
    //.querySelector = searching for the specific css class
    //find menu list

    const overlay = document.getElementById("overlay");

    menu.classList.toggle("open"); //if the class is there, removes it
    overlay.classList.toggle("show"); //if the class is missing, adds it
    //makes menu slide in and out
}


if (window.location.pathname.includes("index.html")) {
    //if the url includes "index.html"...

    var input = document.getElementById("task_input");
    //lets me talk to the input box later (as opposed to const)

//trigger add_task() when enter key pressed
input.addEventListener("keydown", function(event) {
//runs function when the user pressed a key
    //event listener listens for a specific thing- in this case, when enter key is pressed

    if (event.key === "Enter") {
    //if the event key is enter,

        event.preventDefault();
        //cancels default (so tasks can now be added both by clicking the button and pressing enter)

        add_task();
        //calls add_task function when enter key pressed
    }
});

input.addEventListener("input", function() {
    //listens for input (every time user types something)
    this.style.height = "45px"
    //forces height to 45px

    if (this.scrollHeight > 45) {
        this.style.height = this.scrollHeight + "px";
        //if content is small, stay at 45px, if content is taller than 45, set element height to match scroll height
    }
});

//task function
function add_task(){
        let task_adder = document.getElementById("task_input").value.trim();
        //gets the text the user typed with no spaces

        if (task_adder === "") {
            return; //if the input box is empty, do nothing and stop the function
        }

        const masterlist = document.getElementById("task_list");
        //gets the master list

        let new_list_item = document.createElement("li");
        //create a new list item (that isnt on the screen yet- only appears after adding task)

        //HITBOX LOGIC
        let check_hitbox = document.createElement("span");
        //adds a hitbox container for the check (user friendly interface)
        check_hitbox.className = "checkbox-hitbox";
        //assign css style

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        //creates a new input and makes it a checkbox


        check_hitbox.appendChild(checkbox);

        new_list_item.appendChild(check_hitbox);
        //gives checkbox a hitbox- basically puts one html element inside the other one

        check_hitbox.addEventListener("click", (e) => {
            //makes hitbox for user friendly checkbox hit
            if (e.target === checkbox) return;
            // if user clicks actual box, stop function

            checkbox.checked = !checkbox.checked;
            //if they hit the hitbox then change the checkbox state to the opposite of whatever it is now

            checkbox.dispatchEvent(new Event("change"));
            //trigger change so it does the strike-through
});


        //create the text:
        let task_text = document.createElement("span"); //span is html tag
        task_text.className = "task-text";
        task_text.textContent = task_adder; //puts user input into the span
        new_list_item.appendChild(task_text);


        //checkbox change listener
        checkbox.addEventListener("change", function() {
            const alreadyCompleted = new_list_item.classList.contains("completed-once"); //.contains checks a true/false to see if its been completed already
            //gives specific checkbox an event listener (like an instruction)

            if (this.checked) { //"this" = checkbox being checked
                if (!alreadyCompleted) { //if NOT already completed...
                    rewards(); //gives xp and coins only first time checking (prevents users checking task over again to cheat the system)
                    new_list_item.classList.add("completed-once"); //mark as completed once
                }
                new_list_item.classList.add("checked");
                //if the box is ticked, find the li parent and tag it as being "checked", trigger css strike-through

            } else {
                new_list_item.classList.remove("checked");
                //if the box is not ticked, remove the "checked"
            }
            saveData();
            updateProgress();
        });


        masterlist.appendChild(new_list_item);
        //adds the list input to the user list
        saveData();
        updateProgress();


        //DELETE BUTTON LOGIC
        let delete_button = document.createElement("span");
        //create delete button

        delete_button.innerHTML = "\u00d7";
        //makes the delete button the x symbol

        delete_button.className = "delete-button";
        //assigns it a class name

        new_list_item.appendChild(delete_button);
        //appends delete button to each task added to list

        delete_button.onclick = function() {
            new_list_item.remove();
            //deletes entire row when the delete button is clicked by removing the html element
            saveData();
            updateProgress();
        };


        //EDIT BUTTON LOGIC
        let edit_button = document.createElement("span");
        //create edit button

        edit_button.innerHTML = "\u270e";
        //makes the edit button the pencil symbol

        edit_button.className = "edit-button";
        //assigns it a class name

        new_list_item.appendChild(edit_button);
        //appends edit button to each task in list

        edit_button.onclick = function() {
            new_list_item.classList.add("is-editing");
            task_text.contentEditable = true;
            //unlocks text to make span editable

            const range = document.createRange(); //create new empty range object
            const sel = window.getSelection(); //get the text currently selected by user
            range.selectNodeContents(task_text); //set range to include everything inside of task_text
            range.collapse(false); //collapses the range to one point (cursor)- false puts it at the end of the range (user text) and true puts it at the start
            sel.removeAllRanges(); //clear any existing ranges/selections like highlighted text
            sel.addRange(range); //applies new range

            task_text.focus();
            //put cursor end of text automatically


            //SAVE EDIT runs when you click away .onblur or hit enter
            const saveEdit = () => {
                task_text.contentEditable = false;
                new_list_item.classList.remove("is-editing");

                //if user deletes everything restore default or delete task
                if (task_text.textContent.trim() === "") {
                    task_text.textContent = "New Task"; //stops invisible task forming
                }
                //save to storage
                saveData();
            };


            task_text.onblur = saveEdit;
            //save when pressing enter or click off
            task_text.onkeydown = function(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    //prevents it from adding a default new line
                    task_text.blur();
                    //triggers saveEdit
                }
            };
        };

        input.value = "";
        //clears typing box

        input.style.height = "45px";
}


function saveData() {
    const tasks = []; //create empty list to hold task data

    document.querySelectorAll("#task_list li").forEach(li => {
        //loop through all the list items inside task list to get all the data currently inside

        tasks.push({ //add an object for each task to the list and returns length of the array- a bit like .append in python
            text: li.querySelector(".task-text").textContent,
            //gets tasj description

            checked: li.querySelector('input[type="checkbox"]').checked
            //also get whether it is checked or not
        });
    });

    //json.stringify turns the data into a string like str() in python
    localStorage.setItem("myTodoList", JSON.stringify({
        tasks: tasks,
        xp: xp,
        level: level,
        coins: coins
    }));
    //convert into json string because local storage only stores strings
}

function loadData() {
    const saved = localStorage.getItem("myTodoList");
    //gets json string from local storage under key "myTodoList"
    if (saved) {
        const data = JSON.parse(saved);
        //parse string back to js array to be used

        xp = data.xp || 0; // || 0 means use the saved number or 0 if no number saved
        level = data.level || 1;
        coins = data.coins || 0;
        updateXP();
        updateLevel();
        updateCoins();

        const tasks = data.tasks || []; // use task list otherwise use empty list
        const masterlist = document.getElementById("task_list");
        masterlist.innerHTML = ""; //clear list before reloading

        tasks.forEach(task => {
            // call existing add_task, temporarly set input value, uses the existing logic to create task ui
            let task_input_field = document.getElementById("task_input");
            input.value = task.text;
            add_task();

            // after adding, find the most recent checkbox and set its checked state
            const items = document.querySelectorAll("#task_list li");
            const lastItem = items[items.length - 1];
            const cb = lastItem.querySelector('input[type="checkbox"]');


            if (task.checked) {
                lastItem.classList.add("completed-once");
                cb.checked = true;
                lastItem.classList.add("checked");
            }
            //adds back the checkbox state and the visual checking class
        });

        updateFlower();
        updateProgress();

    }

}


//progress counter function
function updateProgress() {
    const total = document.querySelectorAll("#task_list li").length;
    //gets how many tasks are in the list in total

    const completed = document.querySelectorAll("#task_list li.checked").length;
    //gets how many tasks have the checked id

    document.getElementById("progress").textContent = `${completed}/${total} complete`;
    //shows completed/total tasks

    const percent = total === 0 ? 0 : (completed / total) * 100;
    //calculates percentage total

    document.getElementById("progress-fill").style.width = percent + "%";
    //fills bar

    updateFlower();

    const plant = plants[currentPlant];
    const required = plant.requiredTasks;

    const remaining = Math.max(0, required - completed);
    //calculates remaining tasks for plant by subtracting completed from required

    document.getElementById("tasks-to-grow").textContent =
        remaining === 0
        ? "your plant is fully grown!"
        : `${remaining} tasks(s) until your plant grows!`
    //when 0 tasks remain, say plant is fully grown, otherwise print remaining value of tasks
}






let savedPlant = localStorage.getItem("currentPlant");
let currentPlant = savedPlant ? savedPlant : "starter";


function updateFlower() {

    currentPlant = localStorage.getItem("currentPlant") || "starter"; //find which plant is growing right now, or use starter

    const plant = plants[currentPlant];
    //current plant that is being grown

    const completed = document.querySelectorAll("#task_list li.checked").length;
    //get completion progress

    const totalStages = plant.images.length;
    //means that the function works for any flower because it calculates length based off number of images not a number i've given it (for example 3 for the starter plant)

    const required = plant.requiredTasks;
    //gets number of required tasks to grow plant

    let stage = Math.floor((completed / required) * totalStages);
    //convert percent into stage index

    stage = Math.min(stage, totalStages - 1);
    //stops it going past the last stage

    document.getElementById("flower").src = plant.images[stage]; //change source of img tag to show the new stage (next image)

    if (stage === totalStages - 1) {
        //check if grown

        let alreadyGrown = localStorage.getItem("plantFinished") === "true";


        localStorage.setItem("plantFinished", "true");
        //mark plant as finished

        if (!alreadyGrown) {
            let history = JSON.parse(localStorage.getItem("plantHistory")) || [];

            //add plant once
            history.push(currentPlant);
            localStorage.setItem("plantHistory", JSON.stringify(history));

            localStorage.setItem("plantFinished", "true");

            console.log("plant added to garden");
        }
        //loads history

    } else {
        localStorage.setItem("plantFinished", "false")
        //plant still growing
    }

}

const quotes = [
    {text: "\"May your choices reflect your hopes, not your fears.\"", author: "Nelson Mandela"},
    {text: "\"In a moment of decision, the best thing you can do is the right thing to do, the next best thing is the wrong thing, and the worst thing you can do is nothing.\"", author: "Theodore Roosevelt"},
    {text: "\"Success is walking from failure to failure with no loss of enthusiasm.\"", author: "Winston Churchill"},
    {text: "\"Try not to become a person of success, but rather try to become a person of value.\"", author: "Albert Einstein"},
    {text: "\"Many of life's failures are people who did not realize how close they were to success when they gave up.\"", author: "Thomas A. Edison"},
    {text: "\"A good plan violently executed now is better than a perfect plan executed next week.\"", author: "George Patton"},
    {text: "\"You wouldn't worry so much about what others think of you if you realized how seldom they do.\"", author: "Eleanor Roosevelt"},
    {text: "\"Do it or not. There is no try.\"", author: "Yoda"},
    {text: "\"Be the change that you wish to see in the world.\"", author: "Mahatma Gandhi"},
    {text: "\"I have not failed. I've just found 10,000 ways that won't work.\"", author: "Thomas A. Edison"},
    {text: "\"It is never too late to be what you might have been.\"", author: "George Eliot"},
    {text: "\"There is no greater agony than bearing an untold story inside you.\"", author: "Maya Angelou"},
    {text: "\"Life isn't about finding yourself. Life is about creating yourself.\"", author: "George Bernard Shaw"},
    {text: "\"It's the possibility of having a dream come true that makes life interesting.\"", author: "Paulo Coelho"},
    {text: "\"May you live every day of your life.\"", author: "Jonathan Swift"},
    {text: "\"Whatever you are, be a good one.\"", author: "Abraham Lincoln"},
    {text: "\"I really think a champion is defined not by their wins but by how they can recover when they fall.\"", author: "Serena Williams"},
    {text: "\"Don't ever make decisions based on fear. Make decisions based on hope and possibility. Make decisions based on what should happen, not what shouldn't.\"", author: "Michelle Obama"},
    {text: "\"If you're always trying to be normal, you will never know how amazing you can be.\"", author: "Maya Angelou"},
    {text: "\"Let us make our future now, and let us make our dreams tomorrow's reality.\"", author: "Malala Yousafzai"}
];

function getQuote() {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem("dailyQuote"));

    //if quote has already been saved for today, show the same quote
    if (saved && saved.date === today) {
        document.getElementById("quote-text").textContent = saved.quote.text;
        document.getElementById("author-name").textContent = "- " + saved.quote.author;
        return;
    }

    //pick a new quote
    let randomIndex = Math.floor(Math.random() * quotes.length);
    let quote = quotes[randomIndex];

    //display it
    document.getElementById("quote-text").textContent = quote.text;
    document.getElementById("author-name").textContent = "- " + quote.author;


    //save for rest of day
    localStorage.setItem("dailyQuote", JSON.stringify({date: today, quote: quote}));
}


function addXP(amount) {
    xp += amount;
    calculateLevel();
}

function calculateLevel() {
    level = Math.floor(xp / 100) + 1;
    //100 xp per level, level 1 starts at 0 xp, when 100 xp is reached, add 1 level
    //.floor gets rid of decimals
}

function rewards() {
    xp += 10;
    coins += 5;
    calculateLevel();
    updateXP();
    updateLevel();
    updateCoins();
}

function updateXP() {
    document.getElementById("xp-display").textContent = "XP: " + xp;
}

function updateLevel() {
    document.getElementById("level-display").textContent = "level: " + level;
}

function updateCoins() {
    document.getElementById("coins-display").textContent = "coins: " + coins;
}

const start = document.getElementById("start");
const stop = document.getElementById("stop");
const reset = document.getElementById("reset");
const timer = document.getElementById("timer");

let timeLeft = 1500;
let interval;

const updateTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timer.innerHTML = `${minutes.toString().padStart(2,"0")}
    :
    ${seconds.toString().padStart(2, "0")}`;
}

const startTimer = () => {
    interval = setInterval(() => {
        timeLeft--;
        updateTimer();

        if(timeLeft === 0) {
            clearInterval(interval);
            alert("time's up!");
            timeLeft = 1500;
            updateTimer();
        }
    }, 1000)
}

const stopTimer = () => clearInterval(interval);

const resetTimer = () => {
    clearInterval(interval);
    timeLeft = 1500;
    updateTimer()
}

start.addEventListener("click", startTimer);
stop.addEventListener("click", stopTimer);
reset.addEventListener("click", resetTimer);




window.onload = getQuote;

//run when script loads
loadData();
input.value = "";
input.style.height = "45px";
updateProgress();
}

if (window.location.pathname.includes("shop.html")) {

    const saved = localStorage.getItem("myTodoList"); //pulls saved game string from local storage

    let gameData = saved ? JSON.parse(saved) : {xp: 0, level: 1, coins: 0, tasks: []}; //if saved exists, turn to js object, if not, create default starter values

    console.log("shop loaded current coins in storage:", gameData.coins );

    const status = document.getElementById("shop-status"); //gets html element where messages are displayed

    status.textContent = `you have ${gameData.coins} coins` //${} is equivalent of python f string, displays current coins

    let plantFinished = localStorage.getItem("plantFinished") === "true"; //checks local storage to see if current plant is finished growing
    //convert string "true" from the saved storage into a boolean- if it isnt finished, false- if it is, true


    //show status message
    if (plantFinished) { //if true
        //updates status text
        status.textContent = "your plant is fully grown! you can buy a new one!";
    } else {
        status.textContent = "finish growing your current plant before buying a new one!";
    }

    //disable buttons if plant not finished


    //debugging logs
    console.log("plantFinished raw:", localStorage.getItem("plantFinished"));
    console.log("plantFinished boolean:", plantFinished);
    console.log("coins:", gameData.coins);
    console.log("tasks:", gameData.tasks);
    console.log("completed tasks:", gameData.tasks.filter(t => t.checked).length);
    console.log("starter required tasks:", plants["starter"].requiredTasks);


    function buyPlant(plantName) {

        //look up stats of plant from plant database
        const plantRequirement = plants[plantName].requiredTasks;
        const plantCost = plants[plantName].cost;

        //if plant not already finished...
        if (!plantFinished) {
            status.textContent = "finish growing your current plant before buying a new one!";
            alert("finish growing your current plant before buying a new one!");
            return; //stops function
        }

        //if player doesnt have enough coins...
        if (gameData.coins < plantCost) {
            alert("not enough coins!");
            return;
        }

        //if player not higher than required level...
        if (gameData.level < plants[plantName].requiredLevel) {
            alert(`you must be level ${plants[plantName].requiredLevel} to buy this plant!`);
            return;
        }


        //if player doesnt have enough completed tasks...
        const completedTasks = gameData.tasks.filter(t => t.checked).length; //number of items in the list (number of tasks)

        if (completedTasks < plantRequirement) {
            status.textContent = `you need ${plantRequirement} completed tasks to buy this plant!`;
            alert(`you need ${plantRequirement} completed tasks to buy this plant!`);
            return;
        }

        let checkedCount = 0;
        gameData.tasks = gameData.tasks.filter(task => {
            if (task.checked && checkedCount < plantRequirement) {
                //if task checked AND player hasnt reached requirement yet...
                checkedCount++;
                return false; //removes task from array and counts it as "spent"
            }
            return true; //keeps task
        });


        gameData.coins -= plantCost;

        localStorage.setItem("myTodoList", JSON.stringify(gameData));
        //save updated data of coins and task list

        localStorage.setItem("currentPlant", plantName);
        //set new plant as currentPlant

        localStorage.setItem("plantFinished", "false");
        //reset plant progress

            alert(`you bought the ${plantName}! ${checkedCount} completed tasks were archived`);
            window.location.href = "index.html"; //redirect to task page
    }

    //calls function for each buy plant button
    document.getElementById("buy-starter").onclick = () => buyPlant("starter");
    document.getElementById("buy-rose").onclick = () => buyPlant("rose");
}

if (window.location.pathname.includes("plants.html")) {
    displayGarden();

    function displayGarden() {
        //find <div> where plants should be drawn
        const gallery = document.getElementById("plant-gallery");
        if (!gallery) return; //if gallery doesnt exist in html, stop here

        let history = JSON.parse(localStorage.getItem("plantHistory")) || []; //get plantHistory array, if it doesnt exist yet, do an empty array
        gallery.innerHTML = ""; //clears the slot before drawing new things (so it updates when you update your plants)

        if (history.length === 0) { //if no plants...
            gallery.innerHTML = "<p class = 'empty-msg'> your garden is empty! grow some plants to see them here </p>";
            return;
        }

        const counts = {}; //create empty object to store how many of each plant user owns
        history.forEach(plant => {
            counts[plant] = (counts[plant] || 0) +1; //if plant exists in count, add one; if not, start at 1
        });

        Object.keys(counts).forEach(plantName => { //loo[p through each unique plant name in "counts"

            const plantData = plants[plantName]; //gets image and name for this plant

            if (plantData) { //proceed if plant actually exists

                let wrapper = document.createElement("div"); //create container div for the specific plant ytype
                wrapper.className = "garden-item-wrapper";

                //create plant image
                let img = document.createElement("img");
                img.src = plantData.images [plantData.images.length-1]; //access last image in plant image array
                img.className = "garden-item-img";

                //create text labe for plant
                let nameTag = document.createElement("p");
                nameTag.textContent = plantData.displayName || plantName; //use display name, if no display name use id name

                //creates badge (for multiple plants of same type)
                if (counts[plantName] > 1) {
                    let badge = document.createElement("span");
                    badge.className = "plant-count-badge"; //give badge class name to edit in css
                    badge.textContent = `${counts[plantName]}` //set badge text to number of plants owned
                    wrapper.appendChild(badge); //add badge to wrapper
                }
                wrapper.appendChild(img);
                wrapper.appendChild(nameTag);
                gallery.appendChild(wrapper); //add completed wrapper to main gallery
            }
        });

    }
}

if (window.location.pathname.includes("profile.html")) {
    updateProfile();

    function updateProfile() {

        const history = JSON.parse(localStorage.getItem("plantHistory")) || []; //gets list of finished plants, if no list, default to empty list
        const saved = localStorage.getItem("myTodoList"); //gets main game data string (xp, coins, level)

        //set default values (in case user is new and has no saved data)
        let xpVal = 0;
        let coinVal = 0;
        let levelVal = 1;

        //parse saved data (turn into js object)
        if (saved) {
            const data = JSON.parse(saved);
            xpVal = data.xp || 0;
            coinVal = data.coins || 0;
            levelVal = data.level || 1;
        }

        //finds the html space on the page where numbers should go
        const elPlants = document.getElementById("total-plants");
        const elCoins = document.getElementById("profile-coins");
        const elXp = document.getElementById("profile-xp");
        const elLevel = document.getElementById("profile-level");

        //update ui
        //check if element exists, then change its text (stops code crashing)
        if (elPlants) elPlants.textContent = history.length; //displays the length of the history array
        if (elCoins) elCoins.textContent = coinVal;
        if (elXp) elXp.textContent = xpVal;
        if (elLevel) elLevel.textContent = levelVal;
    }
}

