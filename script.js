document.addEventListener("DOMContentLoaded", function () {
    const burgerMenu = document.getElementById("burger-menu");
    const navMenuContainer = document.querySelector(".nav-menu-container");

    if (burgerMenu && navMenuContainer) {
        burgerMenu.addEventListener("click", function () {
            navMenuContainer.classList.toggle("active");
        });
    }

    const form = document.getElementById('card-search-form');
    const searchInput = document.getElementById('search-input');
    const cardContainer = document.getElementById('card-container');
    const typeSelect = document.getElementById('type-select');
    const attributeSelect = document.getElementById('attribute-select');
    const raceSelect = document.getElementById('race-select');
    const archetypeSelect = document.getElementById('archetype-select');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const query = searchInput.value.trim();
            const filters = {
                type: typeSelect.value,
                attribute: attributeSelect.value,
                race: raceSelect.value,
                archetype: archetypeSelect.value,
            };
            searchCards(query, filters);
        });
    }

    async function searchCards(query, filters) {
        try {
            const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${query}`);
            const data = await response.json();
            const cards = data.data;
    
            const filteredCards = cards.filter(card => {
                // Normalize archetype values to lower case for case-insensitive comparison
                const cardArchetype = (card.archetype || '').toLowerCase();
                const filterArchetype = filters.archetype.toLowerCase();
    
                return (filters.type === "Select Type" || card.type === filters.type) &&
                       (filters.attribute === "Select Attribute" || card.attribute === filters.attribute) &&
                       (filters.race === "Select Race" || card.race === filters.race) &&
                       (filters.archetype === "Select Archetype" || cardArchetype === filterArchetype);
            });
    
            displayCards(filteredCards);
        } catch (error) {
            console.error('Error fetching card data:', error);
        }
    }

    function displayCards(cards) {
        cardContainer.innerHTML = '';
        if (cards.length === 0) {
            cardContainer.innerHTML = '<p>No cards found.</p>';
            return;
        }
    
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.innerHTML = `
                <img src="${card.card_images[0].image_url}" alt="${card.name}">
                <h3>${card.name}</h3>
                <p>${card.type}</p>
                <p>Attribute: ${card.attribute}</p>
                <p>Level: ${card.level}</p>
                <p>ATK: ${card.atk} / DEF: ${card.def}</p>
                <p>Description: ${card.desc}</p>
            `;
            cardContainer.appendChild(cardElement);
        });
    }

    document.getElementById("archetype-select").addEventListener("input", function() {
        const filterValue = this.value.toLowerCase();
        const options = document.querySelectorAll("#archetype-select option");
    
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            if (text.includes(filterValue)) {
                option.classList.remove('hidden');
            } else {
                option.classList.add('hidden');
            }
        });
    });

    // Chatbot
    const openChatbotButton = document.getElementById('open-chatbot');
    const closeChatbotButton = document.getElementById('close-chatbot');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const sendMessageButton = document.getElementById('send-message');

    function addMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(type === 'user-message' ? 'user-message' : 'bot-message');
        messageElement.innerText = message;
        chatbotMessages.appendChild(messageElement);
    }

    if (openChatbotButton && closeChatbotButton && chatbotContainer && chatbotMessages && chatbotInput && sendMessageButton) {
        openChatbotButton.addEventListener('click', () => {
            console.log('Opening chatbot...');
            chatbotContainer.style.display = 'flex';
            openChatbotButton.style.display = 'none';
        });

        closeChatbotButton.addEventListener('click', () => {
            console.log('Closing chatbot...');
            chatbotContainer.style.display = 'none';
            openChatbotButton.style.display = 'block';
        });

        sendMessageButton.addEventListener('click', () => {
            const userMessage = chatbotInput.value.trim();
            if (userMessage) {
                addMessage(userMessage, 'user-message');
                chatbotInput.value = '';
                getBotResponse(userMessage).then(response => {
                    addMessage(response, 'bot-message');
                }).catch(error => {
                    console.error('Error getting bot response:', error);
                    addMessage('Sorry, I couldn\'t fetch a response at the moment.', 'bot-message');
                });
            }
        });

        chatbotInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessageButton.click();
            }
        });
    } else {
        console.error('One or more chatbot elements not found.');
    }

    async function getBotResponse(message) {
        console.log('Sending request to serverless function...');
        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Response from backend:', data);
            return data.response.trim();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    window.downloadFile = function(url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = url.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    
    // Add event listeners for random card and random deck
    const randomCardBtn = document.getElementById('random-card');
    const randomDeckBtn = document.getElementById('random-deck');

    if (randomCardBtn) {
        randomCardBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            await displayRandomCard();
        });
    }

    if (randomDeckBtn) {
        randomDeckBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            await displayRandomDeck();
        });
    }

    async function displayRandomCard() {
        try {
            const response = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
            const data = await response.json();
            const cards = data.data;
            const randomIndex = Math.floor(Math.random() * cards.length);
            displayCards([cards[randomIndex]]); 
        } catch (error) {
            console.error('Error fetching random card:', error);
        }
    }

    async function displayRandomDeck() {
        try {
            const response = await fetch('https://db.ygoprodeck.com/api/v7/archetypes.php');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch archetypes. Status: ${response.status}`);
            }
            
            const archetypesData = await response.json();
            console.log('Archetypes API response:', archetypesData); // Log the entire API response for inspection
    
            // Check if archetypesData is an array and has items
            if (!Array.isArray(archetypesData) || archetypesData.length === 0) {
                throw new Error('No archetypes found or unexpected response format.');
            }
    
            const randomIndex = Math.floor(Math.random() * archetypesData.length);
            const randomArchetype = archetypesData[randomIndex].archetype_name; // Assuming the property name is 'archetype_name', adjust as per actual API response
            console.log('Selected random archetype:', randomArchetype); // Log the selected archetype for debugging
    
            if (!randomArchetype) {
                throw new Error('Random archetype is undefined or null.');
            }
            
            const cardsResponse = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${encodeURIComponent(randomArchetype)}`);
            
            if (!cardsResponse.ok) {
                throw new Error(`Failed to fetch cards for archetype ${randomArchetype}. Status: ${cardsResponse.status}`);
            }
            
            const cardsData = await cardsResponse.json();
            const cards = cardsData.data;
            
            if (!Array.isArray(cards)) {
                throw new Error('Unexpected response format: Expected an array of cards.');
            }
            
            const filteredCards = cards.filter(card => card.archetype === randomArchetype);
    
            // Displaying the type of deck
            console.log(`Current deck type: ${randomArchetype}`);
    
            displayCards(filteredCards);
        } catch (error) {
            console.error('Error fetching random deck:', error);
        }
    }
    
});