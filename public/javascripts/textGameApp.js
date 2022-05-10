const textElement = document.getElementById('text');
const imageElement = document.getElementById('image');
const optionButtonsElement = document.getElementById('option-buttons');

let state = {}

function startGame(){
    state = {};
    showTextNode(1);
}

function showTextNode(textNodeIndex){
    const textNode = textNodes.find(textNode => textNode.id === textNodeIndex);
    textElement.innerText = textNode.text;
    while (optionButtonsElement.firstChild){
        optionButtonsElement.removeChild(optionButtonsElement.firstChild);
    }

    textNode.options.forEach(option => {
        if (showOption(option)){
            const button = document.createElement('button');
            button.innerText = option.text;
            button.classList.add('btn');
            button.addEventListener('click', () => selectOption(option));
            optionButtonsElement.appendChild(button);
        }
    })
}
function showOption(option){
    return option.requiredState == null || option.requiredState(state)
}

function selectOption(option){
    const nextTextNodeId = option.nextText;
    if (nextTextNodeId <= 0){
        return startGame();
    }
    state = Object.assign(state, option.setState);
    showTextNode(nextTextNodeId)
}

const textNodes = [
    {
        id: 1,
        text: 'You find le meme.',
        options: [
            {
                text: 'Take the meme.',
                setState: {meme: true},
                nextText: 2
            },
            {
                text: 'Abandon the meme.',
                // setState: {meme: false},
                nextText: 2
            },
            {
                text: 'Ahhhhhhhhhhhh.',
                // setState: {meme: false},
                nextText: 2
            }
        ]
    },

    {
        id: 2,
        text: 'You find a memer.',
        options: [
            {
                text: 'Donate your meme.',
                setState: {meme: true},
                nextText: 3
            },
            {
                text: 'Leave.',
                // setState: {meme: false},
                nextText: 3
            }
        ]
    }
]

startGame();