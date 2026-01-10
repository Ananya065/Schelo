let milestoneList = JSON.parse(localStorage.getItem('schelo_data')) || [];
let currentPosition = parseInt(localStorage.getItem('schelo_index')) || 0;

syncView();

function handleNewMilestone() {
    const inputField = document.getElementById('milestone-input');
    const title = inputField.value.trim();
    
    if (title) {
        milestoneList.push(title);
        inputField.value = "";
        persistData();
        syncView();
    }
}

function handleStepForward() {
    if (currentPosition < milestoneList.length) {
        currentPosition++;
        persistData();
        syncView();
    }
}

function handleReset() {
    if(confirm("Start a new journey?")) {
        milestoneList = [];
        currentPosition = 0;
        persistData();
        syncView();
    }
}

function persistData() {
    localStorage.setItem('schelo_data', JSON.stringify(milestoneList));
    localStorage.setItem('schelo_index', currentPosition);
}

function syncView() {
    const container = document.getElementById('milestone-container');
    const displayHeader = document.getElementById('current-milestone-display');
    const progressLine = document.getElementById('progress-indicator');

    container.innerHTML = "";
    milestoneList.forEach((text, i) => {
        const node = document.createElement('div');
        node.className = 'milestone-node';
        if (i < currentPosition) node.classList.add('is-complete');
        if (i === currentPosition) node.classList.add('is-active');
        container.appendChild(node);
    });

    if (milestoneList.length > 0) {
        const progressRatio = (currentPosition / (milestoneList.length - 1 || 1)) * 100;
        progressLine.style.width = Math.min(progressRatio, 100) + "%";
    } else {
        progressLine.style.width = "0%";
    }

    if (milestoneList.length === 0) {
        displayHeader.innerText = "No milestones planted yet.";
    } else if (currentPosition >= milestoneList.length) {
        displayHeader.innerText = "🎉 Journey Complete!";
    } else {
        displayHeader.innerText = milestoneList[currentPosition];
    }
}
