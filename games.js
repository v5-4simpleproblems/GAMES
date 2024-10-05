function search_game() {
    let input = document.getElementById('searchbar').value.toLowerCase();
    
    // Select the container with the class "game-container"
    let gameContainer = document.getElementsByClassName('games')[0];
    
    // Select all elements within the container
    let allElements = gameContainer.getElementsByTagName('*');

    for (let i = 0; i < allElements.length; i++) {
        let element = allElements[i];
        let elementText = element.textContent.toLowerCase();
        
        // Check if the element has the class "dontsearch"
        let hasDontSearchClass = element.classList.contains('dontsearch');

        // Check if the element text includes the search input and doesn't have the class "dontsearch"
        if (!elementText.includes(input) || hasDontSearchClass) {
            element.style.display = "none";
        } else {
            element.style.display = "list-item";
        }
    }
}
