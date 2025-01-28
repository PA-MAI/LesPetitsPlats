import {
    ModelCardsTemplate
} from '../templates/cards.js';
import {
    searchRecipes,
    updateResultCount,
    renderCards
} from '../utils/search1.js';

/**
 * Classe pour gérer les filtres et les recherches
 */
export class FilterOptions {
    constructor(type, items, menuCards) {
        this.type = type; // Type du menu (e.g., ingrédients, appareils, ustensiles)
        this.items = items; // Tableau des options disponibles dans ce menu
        this.selectedOptions = new Set(); // Ensemble des options sélectionnées
        this.menuCards = menuCards; // Recettes disponibles
        this.dropdownList = null; // Élément <ul> du menu déroulant
        // Initialisation d'un conteneur global s'il n'existe pas déjà
        if (!window.allSelectedOptions) {
            window.allSelectedOptions = new Set(); // Conteneur global pour toutes les options
        }

    }

    // Création du menu déroulant
    createDropdown() {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('dropdown', `dropdown--${this.type}`);

        // Bouton pour ouvrir/fermer le menu
        const dropdownButton = document.createElement('button');
        dropdownButton.classList.add('dropdown__button');
        dropdownButton.setAttribute('aria-expanded', 'false');
        dropdownButton.textContent = `${this.type}`;
        const icon = document.createElement('i');
        icon.classList.add('fa-solid');
        icon.classList.add('fa-chevron-down');
    
        dropdownButton.append(icon);
        dropdownContainer.appendChild(dropdownButton);

        // Conteneur de recherche
        const inputContainer = document.createElement('div');
        inputContainer.classList.add('input__container');

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.classList.add('dropdown__search');
        searchInput.placeholder = `${this.type.toLowerCase()}...`;
        inputContainer.appendChild(searchInput);

        // Ajout des icônes
        const clearIcon = document.createElement('span');
        clearIcon.classList.add('clear__icon');
        clearIcon.innerHTML = '✖';
        inputContainer.appendChild(clearIcon);

        const searchIcon = document.createElement('span');
        searchIcon.classList.add('search__icon');
        searchIcon.innerHTML = '<img src="./assets/logo/ploupe.png">';
        inputContainer.appendChild(searchIcon);

        // Liste déroulante
        this.dropdownList = document.createElement('ul');
        this.dropdownList.classList.add('dropdown__list');
        this.dropdownList.setAttribute('aria-hidden', 'true');

        // Ajout des items au menu
        this.items.forEach(item => this.addDropdownItem(item));

        dropdownContainer.appendChild(inputContainer);
        dropdownContainer.appendChild(this.dropdownList);

        // Gérer les interactions
        this.addDropdownInteractions(dropdownContainer, dropdownButton, this.dropdownList, searchInput, inputContainer, clearIcon);

        return dropdownContainer;
    }

    // Ajout dynamique d'un item au menu
    addDropdownItem(item) {
        const listItem = document.createElement('li');
        listItem.classList.add('dropdown__item');
        listItem.textContent = item;

        // Ajouter l'événement de sélection
        listItem.addEventListener('click', () => {
            console.log(`${item} sélectionné dans ${this.type}`);
            this.selectedOptions.add(item);
            this.addToResultOptions(item);
            this.updateDropdownItems();

        });

        this.dropdownList.appendChild(listItem);
       
    }

    // Mise à jour des items dans le menu déroulant
    updateDropdownItems() {
        console.log('Mise à jour des items du menu déroulant pour', this.type);

        // Supprime les items déjà affichés
        const existingItems = Array.from(this.dropdownList.querySelectorAll('.dropdown__item'));
        existingItems.forEach(item => item.remove());

        // Recrée uniquement les items non sélectionnés
        this.items
            .filter(item => !this.selectedOptions.has(item))
            .forEach(item => this.addDropdownItem(item));
    }

    // Ajoute une option sélectionnée aux résultats et met à jour les cartes
    addToResultOptions(option) {
        const resultOptions = document.querySelector('.result__options');
        const menuCardsWrapper = document.querySelector('.cards');

        // Vérifie si l'option est déjà affichée dans les résultats actifs
        if ([...resultOptions.children].some(child => child.textContent.includes(option))) return;

        // Crée l'élément pour l'option sélectionnée
        const resultItem = document.createElement('div');
        resultItem.className = 'result__item';
        resultItem.innerHTML = `${option} <span class="remove-option">✖</span>`;
        resultOptions.appendChild(resultItem);

        // Ajoute l'option sélectionnée à CE menu ET au conteneur global
        this.selectedOptions.add(option);
        window.allSelectedOptions.add(option);

        // Ajoute un gestionnaire pour la suppression de l'option
        resultItem.querySelector('.remove-option').addEventListener('click', () => {
            resultItem.remove();

            // Supprime l'option de CE menu et du conteneur global
            this.selectedOptions.delete(option);
            window.allSelectedOptions.delete(option);

            console.log(`Option supprimée : ${option}`);
            console.log('Options globales restantes :', [...window.allSelectedOptions]);

            // Récupère la recherche principale actuelle
            const query = document.getElementById('searchInput').value.trim();

            // Si aucune option globale et pas de recherche principale, réinitialiser
            if ((window.allSelectedOptions.size === 0 && query === '') || (window.allSelectedOptions.size === 0 && query !== '')) {
                // Si aucune option ET aucune recherche, ou seulement recherche, réinitialiser
                console.log('Réinitialisation ou recalcul...');
                if (query === '') {
                    renderCards(
                        menuCardsWrapper,
                        this.menuCards, // Toutes les recettes
                        (recipe) => new ModelCardsTemplate(recipe).createMenuCard()
                    );
                    filterMenuOptions(this.menuCards); // Réinitialise les menus
                    updateResultCount(document.querySelector('.result__total'), this.menuCards.length);
                    this.adjustCardsPosition('remove'); // Réinitialise également la marge
                } else {
                    // Si seulement une recherche est active, recalculer
                    const filteredRecipes = searchRecipes(
                        this.menuCards,
                        query,
                        menuCardsWrapper,
                        (recipe) => new ModelCardsTemplate(recipe).createMenuCard(),
                        new Set() // Pas d'options sélectionnées
                    );

                    this.updateMenusAndCards(filteredRecipes, 'remove');
                }
                return;
            }

            // Sinon, recalculer dynamiquement les recettes affichées
            const filteredRecipes = searchRecipes(
                this.menuCards,
                query, // Applique la recherche principale
                menuCardsWrapper,
                (recipe) => new ModelCardsTemplate(recipe).createMenuCard(),
                window.allSelectedOptions // Utilise uniquement les options restantes
            );

            // Met à jour les menus et le compteur avec les recettes filtrées
            this.updateMenusAndCards(filteredRecipes, 'remove');
        });

        // Filtrer les recettes affichées après ajout de l'option
        const query = document.getElementById('searchInput').value.trim();
        const filteredRecipes = searchRecipes(
            this.menuCards,
            query, // Applique la recherche principale
            menuCardsWrapper,
            (recipe) => new ModelCardsTemplate(recipe).createMenuCard(),
            window.allSelectedOptions // Utilise uniquement les options sélectionnées
        );

        // Met à jour les menus et le compteur avec les nouvelles recettes affichées
        this.updateMenusAndCards(filteredRecipes, 'add');
    }

    
    chevronInteraction(dropdownButton) {
        const icon = dropdownButton.querySelector('.fa-solid'); // Cible l'icône du bouton actuel
        const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
    
        if (isExpanded) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up'); // Chevron bas
        } else {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down'); // Chevron haut
        }
    }
    
    // Gestion des interactions css pour les menus
    addDropdownInteractions(container, dropdownButton, dropdownList, searchInput, inputContainer, clearIcon) {
        // Ouverture/fermeture du menu
        dropdownButton.addEventListener('click', () => {
            const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
            dropdownButton.setAttribute('aria-expanded', !isExpanded);
            dropdownList.setAttribute('aria-hidden', isExpanded);
            dropdownList.classList.toggle('dropdown__list--visible', !isExpanded);
            inputContainer.classList.toggle('input__container--visible', !isExpanded);
            searchInput.classList.toggle('dropdown__search--visible', !isExpanded);
            dropdownButton.classList.toggle('dropdown__button--selected', !isExpanded);

            // Change la direction de l'icône
            this.chevronInteraction(dropdownButton)

        });

        // Filtrage des items dans le menu
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            Array.from(dropdownList.querySelectorAll('.dropdown__item')).forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(query) ? '' : 'none';
            });
        });

        // Réinitialisation de la barre de recherche
        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
        });


        // Fermeture du menu au clic extérieur
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdownButton.setAttribute('aria-expanded', 'false');
                dropdownList.setAttribute('aria-hidden', 'true');
                dropdownList.classList.remove('dropdown__list--visible');
                inputContainer.classList.remove('input__container--visible');
                searchInput.classList.remove('dropdown__search--visible');
                dropdownButton.classList.remove('dropdown__button--selected');
                dropdownButton.setAttribute('aria-expanded', 'false'); // Ferme le menu
                dropdownButton.setAttribute('aria-expanded', 'false'); // Ferme le menu
                // Change la direction de l'icône
                this.chevronInteraction(dropdownButton)
        
            }
            
        });
    }
    //centralisation des actions sur les menus déroulants
    updateMenusAndCards(filteredRecipes, action) {
        // Mise à jour des menus déroulants
        filterMenuOptions(filteredRecipes);
        
        // Mise à jour du compteur
        const resultTotalElement = document.querySelector('.result__total');
        updateResultCount(resultTotalElement, filteredRecipes.length);

        // Repositionnement de la section .cards
        this.adjustCardsPosition(action);
    }

    // Ajuste la position de la section des cartes
    adjustCardsPosition(action) {
        const cards = document.querySelector('.cards');
        if (!cards) return; // Si `.cards` n'existe pas, ne rien faire

        const currentMargin = parseInt(cards.style.marginTop || 0, 10);

        if (action === 'add') {
            // Ajouter 60px si une option est ajoutée
            cards.style.marginTop = `${currentMargin + 60}px`;
        } else if (action === 'remove') {
            // Soustraire 60px mais s'assurer que la marge ne devient pas négative
            const newMargin = Math.max(currentMargin - 60, 0);
            cards.style.marginTop = `${newMargin}px`;
        }
    }
}

// Fonction pour gérer les menus déroulants globalement
export function filterMenuOptions(menuCards) {
    if (!menuCards || menuCards.length === 0) {
        console.warn('Aucune carte de menu n\'est disponible pour extraire les options.');
        return;
    }

    console.log('Mise à jour globale des menus déroulants...');
    const menuOptionsContainer = document.querySelector('.menu__options');

    // Initialisation de window.filterMenus si nécessaire
    if (!window.filterMenus) {
        window.filterMenus = {
            ingredientMenu: new FilterOptions('ingrédients', [], menuCards),
            applianceMenu: new FilterOptions('appareils', [], menuCards),
            utensilMenu: new FilterOptions('ustensiles', [], menuCards),
        };

        // Ajout des menus au DOM lors de la première initialisation
        menuOptionsContainer.appendChild(window.filterMenus.ingredientMenu.createDropdown());
        menuOptionsContainer.appendChild(window.filterMenus.applianceMenu.createDropdown());
        menuOptionsContainer.appendChild(window.filterMenus.utensilMenu.createDropdown());
    }

    // Récupérer les options déjà sélectionnées
    const selectedIngredients = window.filterMenus.ingredientMenu ? [...window.filterMenus.ingredientMenu.selectedOptions] : [];
    const selectedAppliances = window.filterMenus.applianceMenu ? [...window.filterMenus.applianceMenu.selectedOptions] : [];
    const selectedUtensils = window.filterMenus.utensilMenu ? [...window.filterMenus.utensilMenu.selectedOptions] : [];

    // Calculer les options restantes dans les recettes affichées
    const ingredients = [...new Set(
        menuCards.flatMap(card => card.ingredients.map(ing => ing.ingredient))
    )].filter(ingredient => !selectedIngredients.includes(ingredient));

    const appliances = [...new Set(menuCards.map(card => card.appliance))]
        .filter(appliance => !selectedAppliances.includes(appliance));

    const utensils = [...new Set(menuCards.flatMap(card => card.ustensils))]
        .filter(utensil => !selectedUtensils.includes(utensil));

    // Mise à jour des menus existants
    window.filterMenus.ingredientMenu.items = ingredients;
    window.filterMenus.applianceMenu.items = appliances;
    window.filterMenus.utensilMenu.items = utensils;

    window.filterMenus.ingredientMenu.updateDropdownItems();
    window.filterMenus.applianceMenu.updateDropdownItems();
    window.filterMenus.utensilMenu.updateDropdownItems();
}