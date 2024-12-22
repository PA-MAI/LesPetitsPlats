import { ApiMenuCards } from '../api/api.js';
import { ModelCardsTemplate } from '../templates/cards.js';
import { searchRecipes } from '../utils/search1.js';

/**
 * Classe principale pour gérer l'application des cartes de menu.
 */
class AppMenuCard {
    constructor() {
        // Sélectionne les éléments DOM nécessaires pour l'application
        this.$menuCardsWrapper = document.querySelector('.cards'); // Conteneur des cartes de recettes
        this.$searchInput = document.getElementById('searchInput'); // Champ de saisie de recherche
        this.$searchButton = document.getElementById('searchButton'); // Bouton de recherche
        this.menuCards = []; // Tableau pour stocker les données des recettes
        this.$sectionOptions = document.querySelector('.section__options');

        this.$resultTotal = null; // Initialisation de la propriété pour la div des résultats

        // Détermine le chemin pour charger les données en fonction de l'environnement
        const basePath = window.location.pathname.includes('/LesPetitsPlats/') ? '/LesPetitsPlats/data/' : './data/';
        this.menuCardsApi = new ApiMenuCards(`${basePath}recipe.json`); // Instance de l'API pour récupérer les recettes

        // Sélectionne le bouton de réinitialisation de la recherche
        this.$clearButton = document.getElementById('clearButton');
    }

    /**
     * Initialise l'application en chargeant les recettes et en configurant les événements.
     */
    async init() {
        try {
            console.log('Loading menu cards...');
            // Charge les données des recettes depuis l'API
            this.menuCards = await this.menuCardsApi.getMenuCards();

            // Ajoute la div pour afficher le nombre de résultats
            this.addDivResult();

            // Affiche toutes les recettes par défaut au démarrage
            searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());

            // Met à jour le nombre de résultats affichés
            this.updateResultCount(this.menuCards.length);

            // Configure les événements pour la recherche et le bouton de réinitialisation
            this.addSearchEvent();
            this.addClearButtonEvent();
        } catch (error) {
            console.error('Failed to initialize search app:', error);
        }
    }

    /**
     * Configure les événements pour la recherche.
     */
    addSearchEvent() {
        this.$searchButton.addEventListener('click', () => {
            const query = this.$searchInput.value.trim();

            // Gestion des messages d'avertissement pour les requêtes courtes
            const inputField = document.getElementById('searchBar');
            let existingWarning = inputField.nextElementSibling;

            if (existingWarning && existingWarning.textContent === 'Veuillez saisir au moins 3 caractères.') {
                existingWarning.remove();
            }

            const warningMessage = document.createElement('div');
            warningMessage.textContent = 'Veuillez saisir au moins 3 caractères.';
            warningMessage.style.color = 'red';

            if (query.length < 3) {
                inputField.insertAdjacentElement('afterend', warningMessage);
                console.warn('Veuillez saisir au moins 3 caractères.');
                searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
                this.updateResultCount(this.menuCards.length); // Met à jour le nombre total de résultats
                return;
            }
            console.log("menucard",this.menuCards); 

            // Lance la recherche avec la requête saisie
            const filteredCards = searchRecipes(this.menuCards, query, this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
            console.log ("filteredcard",filteredCards)
            this.updateResultCount(filteredCards.length); // Met à jour le nombre de résultats affichés
            
        });

        this.$searchInput.addEventListener('input', () => {
            const inputField = document.getElementById('searchBar');
            let existingWarning = inputField.nextElementSibling;

            if (existingWarning && existingWarning.textContent === 'Veuillez saisir au moins 3 caractères.') {
                existingWarning.remove();
            }
        });
    }

    /**
     * Configure les événements pour le bouton de réinitialisation de l'input.
     */
    addClearButtonEvent() {
        this.$searchInput.addEventListener('input', () => {
            if (this.$searchInput.value.trim() !== '') {
                this.$clearButton.style.display = 'block';
            } else {
                this.$clearButton.style.display = 'none';
            }
        });

        this.$clearButton.addEventListener('click', () => {
            this.$searchInput.value = '';
            this.$clearButton.style.display = 'none';
            this.$searchInput.focus();

            // Réinitialise l'affichage des cartes et le nombre total de résultats
            searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
            this.updateResultCount(this.menuCards.length);
        });
    }

    /**
     * Ajoute une div pour afficher le nombre total de résultats.
     */
    addDivResult() {
     
        const resultTotalDiv = document.querySelector('.result__total'); // Sélectionne la div result__total
        if (resultTotalDiv) {
            const divResult = document.createElement('div');
            divResult.classList.add('result__total--div');
            divResult.textContent = "Résultats : "; // Contenu par défaut
    
            // Ajoute la div result__total--div à la div result__total
            resultTotalDiv.appendChild(divResult);
            this.$resultTotal = divResult; // Stocke l'élément pour mise à jour ultérieure
        } else {
            console.warn("La div .result__total n'existe pas.");
        }
    }
    checkNumberDigits(myNumber)
    {
        myNumber = myNumber.toString();
        if ( myNumber.length < 2 )
        {
            return "0" + myNumber;
        }
        return myNumber;
    }
    /**
     * Met à jour le texte affiché pour le nombre total de résultats.
     */
    
    updateResultCount(count) {
        if (this.$resultTotal) {
          // Convertir count en chaîne de caractères
        const countStr = String(count);
        if (countStr.length < 2) {
          count = "0" + countStr;
      }
        this.$resultTotal.textContent = `${count} recettes`;
        } else {
            console.warn("Impossible de mettre à jour les résultats : l'encart n'existe pas encore.");
        }
    }
}

// Instancie et initialise l'application
const app = new AppMenuCard();
app.init();