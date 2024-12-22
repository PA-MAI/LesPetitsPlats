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

        
        this.$resultTotal = document.querySelector('.result__total');

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

            // Affiche toutes les recettes par défaut au démarrage
            searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());

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
        // Écouteur d'événement sur le bouton de recherche
        this.$searchButton.addEventListener('click', () => {
            const query = this.$searchInput.value.trim(); // Récupère la valeur de recherche saisie

            // Gestion des messages d'avertissement pour les requêtes courtes
            const inputField = document.getElementById('searchBar'); // Champ de recherche
            let existingWarning = inputField.nextElementSibling;

            // Supprime tout message d'avertissement existant
            if (existingWarning && existingWarning.textContent === 'Veuillez saisir au moins 3 caractères.') {
                existingWarning.remove();
            }

            const warningMessage = document.createElement('div'); // Crée un élément pour afficher un avertissement
            warningMessage.textContent = 'Veuillez saisir au moins 3 caractères.';
            warningMessage.style.color = 'red';

            // Si la requête est trop courte, affiche un message et montre toutes les recettes
            if (query.length < 3) {
                inputField.insertAdjacentElement('afterend', warningMessage); // Insère le message sous le champ de recherche
                console.warn('Veuillez saisir au moins 3 caractères.');
                searchRecipes(this.menuCards, '', this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
                return;
            }

            // Lance la recherche avec la requête saisie
            searchRecipes(this.menuCards, query, this.$menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
        });

        // Écouteur d'événement sur le champ de saisie pour supprimer les avertissements en cas de nouvelle saisie
        this.$searchInput.addEventListener('input', () => {
            const inputField = document.getElementById('searchBar'); // Champ de recherche
            let existingWarning = inputField.nextElementSibling;

            // Supprime tout message d'avertissement existant
            if (existingWarning && existingWarning.textContent === 'Veuillez saisir au moins 3 caractères.') {
                existingWarning.remove();
            }
        });
    }

    /**
     * Configure les événements pour le bouton de réinitialisation de l'input.
     */
    addClearButtonEvent() {
        // Affiche ou masque le bouton de réinitialisation en fonction de la saisie
        this.$searchInput.addEventListener('input', () => {
            if (this.$searchInput.value.trim() !== '') {
                this.$clearButton.style.display = 'block'; // Affiche le bouton si du texte est présent
            } else {
                this.$clearButton.style.display = 'none'; // Cache le bouton si le champ est vide
            }
        });

        // Réinitialise le champ de recherche lorsqu'on clique sur le bouton de réinitialisation
        this.$clearButton.addEventListener('click', () => {
            this.$searchInput.value = ''; // Vide le champ de recherche
            this.$clearButton.style.display = 'none'; // Cache le bouton de réinitialisation
            this.$searchInput.focus(); // Donne le focus au champ de recherche
        });
    }
}

// Instancie et initialise l'application
const app = new AppMenuCard();
app.init();