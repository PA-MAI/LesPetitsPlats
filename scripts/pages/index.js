import {
  ApiMenuCards
} from '../api/api.js'
import {
  ModelCardsTemplate
} from '../templates/cards.js'
//import { searchRecipes, renderCards } from '../utils/search1.js';
import {
  searchRecipes,
  updateResultCount,
  renderCards
} from '../utils/search2.js'
import {
  FilterOptions,
  filterMenuOptions
} from '../templates/filterOptions.js'


/**
* Classe principale pour gérer l'application des cartes de menu.
*/
class AppMenuCard {
  constructor() {
      // Sélectionne les éléments DOM nécessaires pour l'application
      this.$menuCardsWrapper = document.querySelector('.cards') // Conteneur des cartes de recettes
      this.$searchInput = document.getElementById('searchInput') // Champ de saisie de recherche
      this.$searchButton = document.getElementById('searchButton') // Bouton de recherche
      this.menuCards = [] // Tableau pour stocker les données des recettes
      this.$clearButton = document.getElementById('clearButton')
      this.$resultTotal = document.querySelector('.result__total') // Initialisation de la propriété pour la div des résultats

      // Détermine le chemin pour charger les données en fonction de l'environnement
      const basePath = window.location.pathname.includes('/LesPetitsPlats/') ? '/LesPetitsPlats/data/' : './data/'
      this.menuCardsApi = new ApiMenuCards(`${ basePath }recipe.json`) // Instance de l'API pour récupérer les recettes

      // Sélectionne le bouton de réinitialisation de la recherche
      this.$clearButton = document.getElementById('clearButton')
      
  }

  /**
   * Méthode statique pour initialiser l'application après chargement du DOM.
   */
  static initOnDOMContentLoaded() {
      document.addEventListener('DOMContentLoaded', async () => {
          const app = new AppMenuCard()
          await app.init()
      })
  }

  /**
   * Initialise l'application en chargeant les recettes et en configurant les événements.
   */
  async init() {
      try {
          console.log('Loading menu cards...')
          // Charge les données des recettes depuis l'API
          this.menuCards = await this.menuCardsApi.getMenuCards()

          // Ajoute la div pour afficher le nombre de résultats
          this.addDivResult()

          // Affiche toutes les recettes par défaut au démarrage
          searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard())

          // Ajoute les menus déroulants
          filterMenuOptions(this.menuCards)

          // Met à jour le nombre de résultats affichés
          updateResultCount(this.$resultTotal, this.menuCards.length)

          // Configure les événements pour la recherche et le bouton de réinitialisation
          this.addSearchEvent()
          this.addClearButtonEvent()
          console.log('Application initialized successfully.')

      } catch (error) {
          console.error('Failed to initialize search app:', error)
      }
  }

  /**
   * Configure les événements pour la recherche.
   */
  addSearchEvent() {
    const searchInput = document.querySelector('#searchInput');
    this.$searchButton.addEventListener('click', () => {
        const query = this.$searchInput.value.trim();

        // Récupère les options sélectionnées à partir de FilterOptions
        this.filterOptions = new FilterOptions()
        const selectedOptions = this.filterOptions.getSelectedOptions();

        // Gestion des messages d'avertissement pour les requêtes courtes
        const inputField = document.getElementById('searchBar');
        let existingWarning = inputField.nextElementSibling;

        // Supprime l'avertissement existant si présent
        if (existingWarning && existingWarning.textContent === 'Veuillez saisir au moins 3 caractères.') {
            existingWarning.remove();
        }

        const warningMessage = document.createElement('div');
        warningMessage.textContent = 'Veuillez saisir au moins 3 caractères.';
        warningMessage.classList.add('warning3c');

        // Si la recherche est trop courte, affiche un avertissement et toutes les recettes
        if (query.length < 3) {
            inputField.insertAdjacentElement('afterend', warningMessage);
            console.warn('Veuillez saisir au moins 3 caractères.');

            // Affiche toutes les recettes si la recherche est vide
            const allRecipes = searchRecipes(
                this.menuCards,
                '',
                this.$menuCardsWrapper,
                (recipe) => new ModelCardsTemplate(recipe).createMenuCard()
            );

            // Filtrer les menus et arrêter l'exécution
            filterMenuOptions(allRecipes);
            return;
        }

        // Effectue une recherche filtrée avec les options sélectionnées
        const fullyFilteredCards = searchRecipes(
            this.menuCards,
            query,
            this.$menuCardsWrapper,
            (recipe) => new ModelCardsTemplate(recipe).createMenuCard(),
            selectedOptions
        );

        // Met à jour le compteur de résultats
        updateResultCount(this.$resultTotal, fullyFilteredCards.length);

        // Affiche les cartes filtrées
        renderCards(
            this.$menuCardsWrapper,
            fullyFilteredCards,
            (recipe) => new ModelCardsTemplate(recipe).createMenuCard()
        );

        // Met à jour les options des menus déroulants
        filterMenuOptions(fullyFilteredCards);
    });
}


  /**
   * Configure les événements pour le bouton de réinitialisation de l'input.
   */
  addClearButtonEvent() {
      this.$searchInput.addEventListener('input', () => {
          if (this.$searchInput.value.trim() !== '') {
              this.$clearButton.style.display = 'block'
          } else {
              this.$clearButton.style.display = 'none'
          }
      })

      this.$clearButton.addEventListener('click', () => {
          this.$searchInput.value = ''
          this.$clearButton.style.display = 'none'
          this.$searchInput.focus()

          // Réinitialise l'affichage des cartes et le nombre total de résultats
          //  renderCards(this.$menuCardsWrapper, this.menuCards, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
          searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard())
          updateResultCount(this.$resultTotal, this.menuCards.length)
      })
  }


 

  /**
   * Ajoute une div pour afficher le nombre total de résultats.
   */

  addDivResult() {
      const resultTotalDiv = document.querySelector('.result__total') // Sélectionne la div result__total
      if (resultTotalDiv) {
          const divResult = document.createElement('div')
          divResult.classList.add('result__total--div')


          // Ajoute la div result__total--div à la div result__total
          resultTotalDiv.appendChild(divResult)
          this.$resultTotal = divResult // Stocke l'élément pour mise à jour ultérieure
      } else {
          console.warn('La div .result__total n\'existe pas.')
      }
  }

}

// Instancie et initialise l'application
const app = new AppMenuCard()
app.init()