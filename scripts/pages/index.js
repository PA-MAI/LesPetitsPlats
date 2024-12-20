import { ApiMenuCards } from './api/api.js';
import { ModelCardsTemplate } from './templates/cards.js';
import { searchRecipes } from './utils/search1.js';

class AppMenuCard {
    constructor() {
        this.$menuCardsWrapper = document.querySelector('.cards'); // Conteneur des cartes
        this.$searchInput = document.getElementById('searchInput'); // Input de recherche
        this.$searchButton = document.getElementById('searchButton'); // Bouton de recherche
        this.menuCards = []; // Stockage des recettes chargées


        this.menuCardsApi = new ApiMenuCards('./data/recipe.json'); // API des recettes
    }

    async init() {
        try {
          console.log('Loading menu cards...');
          this.menuCards = await this.menuCardsApi.getMenuCards();
          this.renderCards(this.menuCards); // Affiche toutes les recettes au démarrage
          this.addSearchEvent(); // Ajoute l'événement de recherche
        } catch (error) {
          console.error('Failed to initialize search app:', error);
        }
      }
    
      // Affiche les cartes dynamiquement
      renderCards(menuCards) {
        this.$menuCardsWrapper.innerHTML = ''; // Supprime les cartes existantes
        if (menuCards.length === 0) {
          this.$menuCardsWrapper.innerHTML = '<p>Aucune recette trouvée.</p>'; // Message si aucune recette
          return;
        }
        menuCards.forEach((menuCard) => {
          const template = new ModelCardsTemplate(menuCard);
          this.$menuCardsWrapper.appendChild(template.createMenuCard());
        });
      }
    
      // Ajoute l'événement de recherche
      addSearchEvent() {
        this.$searchButton.addEventListener('click', () => {
            
          const query = this.$searchInput.value.trim(); // Récupère la valeur de l'input

          const inputField = document.getElementById('searchBar'); 

          let existingWarning = inputField.nextElementSibling; // Récupère l'élément suivant (le message d'avertissement)
          if (existingWarning && existingWarning.textContent === 'Veuillez saisir au moins 3 caractères.') {
            existingWarning.remove(); // Supprime le message d'avertissement existant
          }
      
          const warningMessage = document.createElement('div');
          warningMessage.textContent = 'Veuillez saisir au moins 3 caractères.'; // Texte du message
          warningMessage.style.color = 'red'; // Applique une couleur rouge au message
          // Vérifie si la recherche est invalide (moins de 3 caractères)
          if (query.length < 3) {
            inputField.insertAdjacentElement('afterend', warningMessage);
            console.warn('Veuillez saisir au moins 3 caractères.');
            this.renderCards(this.menuCards); // Réaffiche toutes les recettes
            return;
          }
    
          // Filtre les cartes correspondant à la recherche
          const filteredCards = searchRecipes(this.menuCards, query);
          // Affiche les résultats filtrés
          this.renderCards(filteredCards); 
        });

         // Ajoute un événement pour supprimer le message lors de la saisie dans l'input
        this.$searchInput.addEventListener('input', () => {
        const inputField = document.getElementById('searchBar');
        let existingWarning = inputField.nextElementSibling; // Vérifie s'il y a un message d'avertissement
        if (existingWarning && existingWarning.textContent === 'Veuillez saisir au moins 3 caractères.') {
        existingWarning.remove(); // Supprime le message d'avertissement si l'utilisateur saisit quelque chose
        }
        });
    }
}
    
    const app = new AppMenuCard();
    app.init();