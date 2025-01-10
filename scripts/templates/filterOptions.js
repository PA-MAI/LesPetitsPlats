import { ModelCardsTemplate } from '../templates/cards.js';
import { searchRecipes,updateResultCount,renderCards} from '../utils/search2.js';



export class FilterOptions {
    constructor(type, items) {
        this.type = type; // Type du menu (e.g., ingrédients, appareils, ustensiles)
        this.items = items; // Tableau des options à afficher
        this.$resultTotal = document.querySelector('.result__total');
    }

    // Méthode pour créer le menu déroulant
    createDropdown() {
        // Conteneur principal du menu
        const dropdownContainer = document.createElement('div');
            dropdownContainer.classList.add('dropdown', `dropdown--${this.type}`);

        // Bouton pour ouvrir/fermer le menu
        const dropdownButton = document.createElement('button');
            dropdownButton.classList.add('dropdown__button');
            dropdownButton.setAttribute('aria-expanded', 'false');
            dropdownButton.textContent = `${this.type}`;
            dropdownContainer.appendChild(dropdownButton);


         // Liste déroulante
         const dropdownList = document.createElement('ul');
            dropdownList.classList.add('dropdown__list');
            dropdownList.setAttribute('aria-hidden', 'true');

         // conteneur pour l'input et les icônes
         const inputContainer = document.createElement('div');
             inputContainer.classList.add('input__container');

         // Barre de recherche
         const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.classList.add('dropdown__search');
            searchInput.placeholder = `${this.type.toLowerCase()}...`;
            searchInput.name = 'dropdown-search';

            // Crée l'élément pour la croix
            const clearIcon = document.createElement('span');
            clearIcon.classList.add('clear__icon');
            clearIcon.innerHTML = '✖';

            // Crée l'élément pour la loupe (tu peux aussi utiliser une balise <img>)
            const searchIcon = document.createElement('span');
            searchIcon.classList.add('search__icon');
            searchIcon.innerHTML = '<img src="./assets/logo/ploupe.png">';  

            // Ajoute l'input, la croix et la loupe dans le conteneur
            inputContainer.appendChild(searchInput);
            inputContainer.appendChild(clearIcon);
            inputContainer.appendChild(searchIcon);

            // Ajoute le conteneur au menu déroulant
            dropdownContainer.appendChild(inputContainer);

        // Ajouter chaque élément à la liste
        this.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.classList.add('dropdown__item');
                listItem.textContent = item;
                listItem.addEventListener('click', () => {
                    console.log(`${item} sélectionné dans ${this.type}`);
                });

            dropdownList.appendChild(listItem);
        });

        // Ajouter la barre de recherche et la liste au conteneur principal
        dropdownContainer.appendChild(dropdownList);
        //dropdownContainer.appendChild(searchInput);

      

          // Gestion de l'affichage au clic (ouvrir/fermer) liste + barre de recherche
        dropdownButton.addEventListener('click', () => {
        const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
        dropdownButton.setAttribute('aria-expanded', !isExpanded);
        dropdownList.setAttribute('aria-hidden', isExpanded);
        dropdownList.classList.toggle('dropdown__list--visible', !isExpanded);
        inputContainer.classList.toggle('input__container--visible', !isExpanded);
        searchInput.classList.toggle('dropdown__search--visible', !isExpanded);
        dropdownButton.classList.toggle('dropdown__button--selected', !isExpanded);
        });
       

      // Ajouter les interactions au menu déroulant
      this.addDropdownInteractions(dropdownContainer, dropdownButton, dropdownList, searchInput,inputContainer,clearIcon);

    return dropdownContainer;

    }
    

    // Méthode pour ajouter les interactions
    addDropdownInteractions(container, dropdownButton, dropdownList, searchInput,inputContainer,clearIcon) {
    
     // Gestion du filtrage
     searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = dropdownList.querySelectorAll('.dropdown__item');
        items.forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
       
    });
    clearIcon.addEventListener('click', () => {
        searchInput.value = '';  // Efface la valeur de l'input
        //searchInput.focus();     // Remet le focus sur l'input
    });

    // Gestion de la sélection d'une option
    dropdownList.addEventListener('click', (e) => {
        if (e.target.classList.contains('dropdown__item')) {
            this.addToResultOptions(e.target.textContent);
             // Masquer le menu déroulant après la sélection
             this.hideDropdown(dropdownList,inputContainer,searchInput,dropdownButton);
            }
    });
        // ferme les menu sur le click exterieur
         document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdownButton.setAttribute('aria-expanded', 'false');
            dropdownList.setAttribute('aria-hidden', 'true');
            this.hideDropdown(dropdownList,inputContainer,searchInput,dropdownButton);
        
        }
    });
    // Efface la valeur de l'input
    clearIcon.addEventListener('click', () => {
        searchInput.value = '';  
        searchInput.focus();     
        
    });
   
    }

    addToResultOptions(option,selectedOptions) {
        const resultOptions = document.querySelector('.result__options');
        const resultTotalElement = document.querySelector('.result__total');
        const menuCardsWrapper = document.querySelector('.cards');
    
        if ([...resultOptions.children].some(child => child.textContent.includes(option))) return;
    
        const resultItem = document.createElement('div');
        resultItem.className = 'result__item';
        resultItem.innerHTML = `
            ${option} <span class="remove-option">✖</span>
        `;
        console.log(`Option sélectionnée : ${option}`);

        // Suppression au clic sur la croix
        resultItem.querySelector('.remove-option').addEventListener('click', () => {
            resultItem.remove();
            this.updateFilteredCards(menuCardsWrapper, resultTotalElement);
           

            // Ajuster la position de .cards (soustraire 50px lors de la suppression)
            this.adjustCardsPosition('remove');
            
         
        });
       

    resultOptions.appendChild(resultItem);

    // Descendre la section .cards de 50px lorsqu'une option est ajoutée
    this.adjustCardsPosition('add');

    this.updateFilteredCards(menuCardsWrapper, resultTotalElement);

    
    }
      /**
         * Récupère les options sélectionnées des menus déroulants.
         * @returns {Set} Ensemble des options sélectionnées.
         */
    // Méthode pour afficher le menu déroulant
    getSelectedOptions(menuCardsWrapper, resultTotalElement) {
        const selectedOptions = new Set();
        document.querySelectorAll('.result__item').forEach(option => {
            const cleanOption = option.textContent.replace('✖', '').trim();
            selectedOptions.add(cleanOption);
        });
        console.log("Options récupérées (nettoyées) :", [...selectedOptions]);
        
        return selectedOptions;
    }


    // Méthode pour masquer le menu déroulant
    hideDropdown(dropdownList,inputContainer,searchInput,dropdownButton) {
        if (dropdownList) {
            dropdownList.classList.remove('dropdown__list--visible');
        }
        if (inputContainer) {
            inputContainer.classList.remove('input__container--visible'); 
        }
        if (searchInput) {   
            searchInput.classList.remove('dropdown__search--visible');
        }
        if (dropdownButton && dropdownButton.classList.contains('dropdown__button--selected')) {
            dropdownButton.classList.remove('dropdown__button--selected');
        }
    }

 
   // Méthode pour ajuster la position de .cards
    adjustCardsPosition(action) {
        const cards = document.querySelector('.cards');
        // Si la section .cards existe, on ajuste sa margin-top en fonction de l'action
        if (cards) {
            const currentMargin = parseInt(cards.style.marginTop || 0);
            
            if (action === 'add') {
                // Ajouter 60px si une option est ajoutée
                cards.style.marginTop = `${currentMargin + 60}px`;
            } else if (action === 'remove') {
                // Soustraire 60px si une option est supprimée
                cards.style.marginTop = `${Math.max(currentMargin - 60, 0)}px `; 
            }
        }
    }

    // Mettre à jour les cartes selon les options
    updateFilteredCards(menuCardsWrapper, resultTotalElement) {
        const selectedOptions = this.getSelectedOptions(); 
        console.log("Options sélectionnées :", [...selectedOptions]);
    
        if (selectedOptions.size === 0) {
            // Aucune option sélectionnée, réinitialiser l'affichage
            this.resetDisplay(menuCardsWrapper, resultTotalElement);
        } else {
            // Filtrer les recettes par les options sélectionnées
            const varfilteredRecipes = this.filterByOptions(this.menuCards, selectedOptions);
    
            // Mise à jour de l'affichage des cartes avec les résultats filtrés
            renderCards(menuCardsWrapper, varfilteredRecipes, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
    
            // Mise à jour du nombre total de résultats
            updateResultCount(resultTotalElement, varfilteredRecipes.length);
        }
        // Mise à jour de l'affichage des cartes
       // renderCards(menuCardsWrapper, varfilteredRecipes, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());
    
        // Mise à jour du nombre de résultats avec `updateResultCount`
        //updateResultCount(resultTotalElement, varfilteredRecipes.length);
    }
    //reset du dom
    resetDisplay(menuCardsWrapper, resultTotalElement) {
        // Réinitialise l'affichage avec toutes les recettes
        renderCards(menuCardsWrapper, this.menuCards, (recipe) => new ModelCardsTemplate(recipe).createMenuCard());

        // Mise à jour du nombre total de résultats
        updateResultCount(resultTotalElement, this.menuCards.length);
    }
 
   /**
     * Filtre les recettes par les options sélectionnées.
     * @param {Array} recipes - Recettes à filtrer.
     * @param {Set|Array} selectedOptions - Ensemble ou tableau des options sélectionnées.
     * @returns {Array} Recettes filtrées par les options.
     */
   filterByOptions(recipes, selectedOptions) {
    if (recipes.length === 0) {
        console.warn("Aucune recette à filtrer.");
        return [];
    }

    console.log("Recettes à filtrer :", recipes);
    console.log("Options sélectionnées :", [...selectedOptions]);
    const cleanString = str => str.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
  
    return recipes.filter(recipe => {
        return [...selectedOptions].every(option => {
            const normalizedOption = option.toLowerCase().trim();
           // console.log("Option normalisée :", normalizedOption);

            // Vérifie dans les ingrédients
            const matchesIngredients = recipe.ingredients.some(ing => {
                const normalizedIngredient = cleanString(ing.ingredient);
                const normalizedOption = cleanString(option);
                const match = normalizedIngredient.includes(normalizedOption);
               // console.log(`Comparaison ingrédient : "${normalizedIngredient}" vs "${normalizedOption}" -> ${match}`);
                return match;
            });

            // Vérifie dans l'appareil
            const matchesAppliance = recipe.appliance.toLowerCase().trim().includes(normalizedOption);
            //console.log(`Comparaison appareil : ${recipe.appliance.toLowerCase().trim()} vs ${normalizedOption}`);

            // Vérifie dans les ustensiles
            const matchesUstensils = recipe.ustensils.some(ust => {
                const normalizedUstensil = ust.toLowerCase().trim();
                const match = normalizedUstensil.includes(normalizedOption);
                //console.log(`Comparaison ustensile : ${normalizedUstensil} vs ${normalizedOption} -> ${match}`);
                return match;
            });
           
            // Retourne `true` si une des conditions est vraie
            const result = matchesIngredients || matchesAppliance || matchesUstensils;
            //console.log("Résultat pour cette option :", result);
            return result;
        });
    });
}
}



