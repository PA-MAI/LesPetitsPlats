import {
    ApiMenuCards
} from '../api/api.js'

import {
    ModelCardsTemplate
} from '../templates/cards.js'

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
        this.filterOptions = new FilterOptions();
        
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

        this.$searchButton.addEventListener('click', () => {
            const query = this.$searchInput.value.trim();

            // Construire l'ensemble des options sélectionnées
            const selectedOptions = new Set();
            if (window.filterMenus) {
                [...window.filterMenus.ingredientMenu.selectedOptions].forEach(option => selectedOptions.add(option));
                [...window.filterMenus.applianceMenu.selectedOptions].forEach(option => selectedOptions.add(option));
                [...window.filterMenus.utensilMenu.selectedOptions].forEach(option => selectedOptions.add(option));
            }

            // Gestion des requêtes trop courtes
            const inputField = document.getElementById('searchBar');
            let existingWarning = inputField.nextElementSibling;

            if (existingWarning && existingWarning.textContent === 'Veuillez saisir au moins 3 caractères.') {
                existingWarning.remove();
            }

            const warningMessage = document.createElement('div');
            warningMessage.textContent = 'Veuillez saisir au moins 3 caractères.';
            warningMessage.classList.add('warning3c');

            if (query.length < 3) {
                inputField.insertAdjacentElement('afterend', warningMessage);

                // Affiche toutes les recettes si la recherche est trop courte
                const allRecipes = searchRecipes(
                    this.menuCards,
                    '',
                    this.$menuCardsWrapper,
                    (recipe) => new ModelCardsTemplate(recipe).createMenuCard()
                );

                // Met à jour les menus et le compteur
                filterMenuOptions(allRecipes);
                updateResultCount(this.$resultTotal, this.menuCards.length);
                return;
            }

            // Recherche avec la requête et les options sélectionnées
            const filteredRecipes = searchRecipes(
                this.menuCards,
                query,
                this.$menuCardsWrapper,
                (recipe) => new ModelCardsTemplate(recipe).createMenuCard(),
                selectedOptions
            );

            // Met à jour les menus et le compteur
            filterMenuOptions(filteredRecipes);
            updateResultCount(this.$resultTotal, filteredRecipes.length);
        });
    }

    /**
     * Configure les événements pour le bouton de réinitialisation de l'input.
     */
    addClearButtonEvent() {
        // Initialisation d'un conteneur global s'il n'existe pas déjà
        this.$searchInput.addEventListener('input', () => {
            if (this.$searchInput.value.trim() !== '') {
                this.$clearButton.style.display = 'block'
            } else {
                this.$clearButton.style.display = 'none'
            }
        })
        this.$clearButton.addEventListener('click', () => {
            this.$searchInput.value = ''; // Efface la recherche principale
            this.$clearButton.style.display = 'none'; // Cache le bouton de réinitialisation
            this.$searchInput.focus(); // Ramène le focus sur l'input

            const menuCardsWrapper = this.$menuCardsWrapper;

            // Si des options sont actives, recalcule les recettes affichées
            if (window.allSelectedOptions && window.allSelectedOptions.size > 0) {
                console.log('Options actives après suppression de la recherche principale :', [...window.allSelectedOptions]);

                // Recalcule les recettes en fonction des options actives
                const filteredRecipes = searchRecipes(
                    this.menuCards,
                    '', // Recherche principale vide
                    menuCardsWrapper,
                    (recipe) => new ModelCardsTemplate(recipe).createMenuCard(),
                    window.allSelectedOptions // Utilise les options actives
                );
                // Met à jour les menus et le compteur
                this.filterOptions.updateMenusAndCards(filteredRecipes);
            } else {
                // Si aucune option active, réinitialise toutes les recettes
                console.log('Aucune option active, réinitialisation à 50 recettes.');
                renderCards(
                    menuCardsWrapper,
                    this.menuCards, // Toutes les recettes
                    (recipe) => new ModelCardsTemplate(recipe).createMenuCard()
                );
                filterMenuOptions(this.menuCards); // Réinitialise les menus déroulants
                 updateResultCount(document.querySelector('.result__total'), this.menuCards.length);
            }
        });
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