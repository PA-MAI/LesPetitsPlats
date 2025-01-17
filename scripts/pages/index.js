import { ApiMenuCards } from '../api/api.js';
import { ModelCardsTemplate } from '../templates/cards.js';
//import { searchRecipes, renderCards } from '../utils/search1.js';
import { searchRecipes,updateResultCount, renderCards } from '../utils/search2.js';
import { FilterOptions } from '../templates/filterOptions.js';


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
        this.renderCards=renderCards
        this.$clearButton = document.getElementById('clearButton');
        this.$resultTotal = document.querySelector('.result__total');// Initialisation de la propriété pour la div des résultats

        // Détermine le chemin pour charger les données en fonction de l'environnement
        const basePath = window.location.pathname.includes('/LesPetitsPlats/') ? '/LesPetitsPlats/data/' : './data/';
        this.menuCardsApi = new ApiMenuCards(`${basePath}recipe.json`); // Instance de l'API pour récupérer les recettes

        // Sélectionne le bouton de réinitialisation de la recherche
        this.$clearButton = document.getElementById('clearButton');
    }
    /**
     * Méthode statique pour initialiser l'application après chargement du DOM.
     */
        static initOnDOMContentLoaded() {
            document.addEventListener('DOMContentLoaded', async () => {
                const app = new AppMenuCard();
                await app.init();
            });
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

            // Ajoute les menus déroulants
            this.filterMenuOptions();

            // Met à jour le nombre de résultats affichés
            updateResultCount(this.$resultTotal, this.menuCards.length);;

            //définition de $resultTotal
            document.addEventListener('DOMContentLoaded', () => {
            const resultTotalElement = document.querySelector('.result__total');
            const filterOptions = new FilterOptions();
            filterOptions.$resultTotal = resultTotalElement;

            // Initialisation du filtre
            const dropdown = filterOptions.createDropdown();
            document.querySelector('.filters').appendChild(dropdown);
        });

            // Configure les événements pour la recherche et le bouton de réinitialisation
            this.addSearchEvent();
            this.addClearButtonEvent();
            console.log('Application initialized successfully.');

        } catch (error) {
            console.error('Failed to initialize search app:', error);
        }
    }

    /**
     * Configure les événements pour la recherche.
     */
    addSearchEvent() {
        this.$searchButton.addEventListener('click', () => {
            const filter = new FilterOptions();
            const query = this.$searchInput.value.trim();
            const selectedOptions = this.getSelectedOptions();
            // Gestion des messages d'avertissement pour les requêtes courtes
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
                console.warn('Veuillez saisir au moins 3 caractères.');
                
                // Affiche toutes les recettes si la recherche est vide
                filter.resetDisplay(menuCardsWrapper, menuCards);
                
               const allRecipes = searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
                this.updateResultCount(allRecipes.length);
                return;
            }
    
            const fullyFilteredCards = searchRecipes(this.menuCards,query, this.$menuCardsWrapper,
             (recipe) => new ModelCardsTemplate(recipe).createMenuCard(),selectedOptions
           );
    
            updateResultCount(this.$resultTotal, fullyFilteredCards.length);
            renderCards(this.$menuCardsWrapper, fullyFilteredCards, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
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
          //  renderCards(this.$menuCardsWrapper, this.menuCards, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
           searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
            updateResultCount(this.$resultTotal, this.menuCards.length);
        });
    }
    
       
    filterMenuOptions() {
        if (!this.menuCards || this.menuCards.length === 0) {
            console.warn('Aucune carte de menu n\'est disponible pour extraire les options.');
            return;
        }
    
        const menuOptionsContainer = document.querySelector('.menu__options');
        const selectedOptions = new Set();
    
        // Récupération des données uniques
        const ingredients = [...new Set(this.menuCards.flatMap(card => card.ingredients.map(ing => ing.ingredient)))];
        const appliances = [...new Set(this.menuCards.map(card => card.appliance))];
        const utensils = [...new Set(this.menuCards.flatMap(card => card.ustensils))];
    
        // Création des menus via FilterOptions avec injection des recettes
        const ingredientMenu = new FilterOptions('ingrédients', ingredients, this.updateIngredients);
        ingredientMenu.menuCards = this.menuCards; // Injecte les recettes dans le menu des ingrédients
        menuOptionsContainer.appendChild(ingredientMenu.createDropdown());
    
        const applianceMenu = new FilterOptions('appareils', appliances, this.updateIngredients);
        applianceMenu.menuCards = this.menuCards; // Injecte les recettes dans le menu des appareils
        menuOptionsContainer.appendChild(applianceMenu.createDropdown());
    
        const utensilMenu = new FilterOptions('ustensiles', utensils, this.updateIngredients);
        utensilMenu.menuCards = this.menuCards; // Injecte les recettes dans le menu des ustensiles
        menuOptionsContainer.appendChild(utensilMenu.createDropdown());
        // Ajoute des interactions pour les filtres
        [ingredientMenu, applianceMenu, utensilMenu].forEach(menu => {
            menu.addDropdownInteractions = (container, dropdownButton, dropdownList, searchInput) => {
                dropdownList.addEventListener('click', (e) => {
                    if (e.target.classList.contains('dropdown__item')) {
                        const option = e.target.textContent;
            
                        if (selectedOptions.has(option)) {
                            selectedOptions.delete(option);
                        } else {
                            selectedOptions.add(option);
                        }
            
                        // Filtre les recettes en fonction de la recherche et des options sélectionnées
                        const query = this.$searchInput.value.trim();
                        const fullyFilteredCards = this.filterRecipes(query, selectedOptions);
            
                        // Mise à jour du nombre de résultats
                        this.updateResultCount(fullyFilteredCards.length);
                        this.renderCards(this.$menuCardsWrapper, fullyFilteredCards, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
                    }
                });
            };
        });

    }
    updateIngredients(filteredItems) {
        const dropdown = document.querySelector('.dropdown--ingredients');
        dropdown.innerHTML = ''; // On vide le menu déroulant actuel
    
       filteredItems.forEach(item => {
           if (!ingredientFilter.selectedOptions.has(item)) {  // Ne pas afficher l'ingrédient déjà sélectionné
               const listItem = document.createElement('li');
               listItem.textContent = item;
               dropdown.appendChild(listItem);
            }
         });
            // event suite à selection d' un ingrédient
        document.querySelector(`dropdown--${this.type}`).addEventListener('change', (e) => {
        const selectedIngredient = e.target.value;
        ingredientFilter.addToSelectedOptions(selectedIngredient);
        });
        }


         /**
         * Récupère les options sélectionnées dans les menus déroulants.
         * @returns {Set} Ensemble des options sélectionnées.
         */
        getSelectedOptions() {
            const selectedOptions = new Set();
            document.querySelectorAll('.result__item').forEach(option => {
                selectedOptions.add(option.textContent.trim());
            });
            console.log("Options récupérées (nettoyées1) :", [...selectedOptions]);
            return selectedOptions;
        }
        /**
         * Ajoute une div pour afficher le nombre total de résultats.
         */

        addDivResult() {
        const resultTotalDiv = document.querySelector('.result__total'); // Sélectionne la div result__total
        if (resultTotalDiv) {
            const divResult = document.createElement('div');
            divResult.classList.add('result__total--div');
           
    
            // Ajoute la div result__total--div à la div result__total
            resultTotalDiv.appendChild(divResult);
            this.$resultTotal = divResult; // Stocke l'élément pour mise à jour ultérieure
        } else {
            console.warn("La div .result__total n'existe pas.");
        }
    }

}

// Instancie et initialise l'application
const app = new AppMenuCard();
app.init();
