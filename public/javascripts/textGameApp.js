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
    if (textNode.image != null){
        imageElement.src = textNode.image;
    } 
    else { 
        imageElement.src = "/img/gl.png";
    }
    
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
        id: 01,
        text: 'Macbeth meets these weird sisters who speak of a prophecy. The prophecy hails him Thane of Glamis, Thane of Cawdor, and soon to be king. Macbeth receives news soon after that the title of Thane of Cawdor is now given to him. Macbeth now believes this prophecy and plans for how he will become king. Macbeth and Lady Macbeth decide to have Duncan become drunk and kill him the night he comes over. On the day of his arrival, Macbeth and Lady Macbeth speak to each other about what needs to happen when Duncan is coming tonight. These two decide their major decision of how this is all going to go down tonight.',
        image: 'https://images.pexels.com/photos/136352/pexels-photo-136352.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        options: [
            {
                text: 'Lady Macbeth brings up a different plan of poisoning Duncan rather than killing him inside their home.',
                nextText: 11
            },
            {
                text: 'The two decide to stay with the plan and have Macbeth kill Duncan that night.',
                nextText: 12
            },
            {
                text: 'The two decide to call it off but decide to build up more power and an army to defeat Duncan in a more honorable way while pretending he is still loyal to Duncan.',
                nextText: 13
            }
        ]
    },

    {
        id: 11,
        text: 'Macbeth agrees to go with Lady Macbeth’s plan to poison the alcohol that Duncan will be drinking when he comes over for the night. Duncan comes over and the two come and greet him. They invite him in to have dinner. Duncan without much of a second thought has a great feast before night arrives. He goes off to be while Macbeth and Lady Macbeth are anxious wondering if the poison will kill. Duncan dies of poison quietly at night. The next morning arrives and Macduff finds Duncan dead. Macbeth pretends to be alarmed and responds to the find.',
        image: 'https://images.pexels.com/photos/3280908/pexels-photo-3280908.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        options: [
            {
                text: 'Macbeth calls for someone to take a look at what caused Duncan’s death while also calling someone to sound the alarm.',
                nextText: 99
            },
            {
                text: 'Macbeth tells Macduff and the other men Duncan brought to stay outside so he can investigate and then tell a lie about what happened to Duncan.',
                nextText: 99
            }
        ]
    },

    {
        id: 12,
        text: 'The two follow through with the plan. Macbeth hides in his room while Lady Macbeth goes out and greets Duncan. She guides Duncan to having dinner with her due to Macbeth not being able to be here. Lady Macbeth is able to get Duncan drunk before sending him off to his chambers. Macbeth then goes into Duncan\'s room when he falls asleep and attempts to kill him. He attempts the murder and is successful but hears someone calling murder but then falling back asleep. Macbeth however is not up to the task of framing others with the bloody dagger, so Lady Macbeth has to do the job. The next morning arrives and Macduff finds Duncan dead. Macbeth pretends to be alarmed and responds to the find.',
        image: 'https://images.pexels.com/photos/5538222/pexels-photo-5538222.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        options: [
            {
                text: 'Macbeth calls for someone to sound the alarm of a murder while pondering about the murder he has just caused.',
                nextText: 99
            },
            {
                text: 'Macbeth calls for someone to sound the alarm of a murder while thinking of how to drive the conversation of what happened to Duncan into his favor.',
                nextText: 99
            }
        ]
    },

    {
        id: 13,
        text: 'The two go and greet Duncan when he arrives. They hold a grand feast for him while buttering up to him at the same time. While the two have time during the night. Macbeth is squabbling about being honorable and that they shouldn’t kill him suddenly in the dead of night. The two have slightly differing opinions about the way forward.',
        image: 'https://images.immediate.co.uk/production/volatile/sites/7/2017/05/GettyImages-578338654-56716db.jpg?quality=90&resize=980,654',
        options: [
            {
                text: 'The night goes onward peacefully onto the next morning.',
                nextText: 99
            },
            {
                text: 'Lady Macbeth convinces Macbeth to go with the original plan of killing Duncan at night.',
                nextText: 99
            },
            {
                text: 'Lady Macbeth decides to take hold of the ship and decides to kill Duncan on her own.',
                nextText: 99
            }
        ]
    },
    {
        id: 99,
        text: 'To be continued...',
        image: 'https://i0.wp.com/www.hadeninteractive.com/wp-content/uploads/2014/01/wip.jpg?fit=425%2C283&ssl=1',
        options: [
            {
                text: 'Return to start',
                nextText: -1
            },
        ]
    },
]

startGame();