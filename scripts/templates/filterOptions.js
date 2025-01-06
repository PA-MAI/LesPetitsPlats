import { ModelCardsTemplate } from '../templates/cards.js';




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

         // Barre de recherche
         const searchInput = document.createElement('input');
         searchInput.type = 'text';
         searchInput.classList.add('dropdown__search');
         searchInput.placeholder = `${this.type.toLowerCase()}...`;
         searchInput.name = 'dropdown-search';

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
        dropdownContainer.appendChild(searchInput);

      

          // Gestion de l'affichage au clic (ouvrir/fermer) liste + barre de recherche
        dropdownButton.addEventListener('click', () => {
        const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
        dropdownButton.setAttribute('aria-expanded', !isExpanded);
        dropdownList.setAttribute('aria-hidden', isExpanded);
        dropdownList.classList.toggle('dropdown__list--visible', !isExpanded);
        dropdownList.classList.toggle('dropdown__search--spanvisible', !isExpanded);
        searchInput.classList.toggle('dropdown__search--visible', !isExpanded);
        dropdownButton.classList.toggle('dropdown__button--selected', !isExpanded);
        });
        const searchSpan = document.createElement('span');
        searchSpan.classList.add('dropdown__search--span');

      // Ajouter les interactions au menu déroulant
      this.addDropdownInteractions(dropdownContainer, dropdownButton, dropdownList, searchInput);

    return dropdownContainer;

    }
    

    // Méthode pour ajouter les interactions
    addDropdownInteractions(container, dropdownButton, dropdownList, searchInput) {
    
     // Gestion du filtrage
     searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = dropdownList.querySelectorAll('.dropdown__item');
        items.forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
    });

    // Gestion de la sélection d'une option
    dropdownList.addEventListener('click', (e) => {
        if (e.target.classList.contains('dropdown__item')) {
            this.addToResultOptions(e.target.textContent);
           // container.classList.remove('dropdown__list--visible');
             // Masquer le menu déroulant après la sélection
             this.hideDropdown(dropdownList);
             this.hideDropdown(searchInput)
        }
    });

    // Gestion du clic en dehors pour fermer le menu
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdownButton.setAttribute('aria-expanded', 'false');
            dropdownList.setAttribute('aria-hidden', 'true');
           // container.classList.remove('dropdown__list--visible');
           this.hideDropdown(dropdownList);
           this.hideDropdown(searchInput)
        }
    });
}

      


    addToResultOptions(option) {
        const resultOptions = document.querySelector('.result__options');
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
            // Recharger les cartes selon les options restantes
            this.updateFilteredCards();
            // Ajuster la position de .cards (soustraire 50px lors de la suppression)
            this.adjustCardsPosition('remove');
    });

    resultOptions.appendChild(resultItem);

    // Descendre la section .cards de 50px lorsqu'une option est ajoutée
    this.adjustCardsPosition('add');

    this.updateFilteredCards();

    
    }
      /**
         * Récupère les options sélectionnées des menus déroulants.
         * @returns {Set} Ensemble des options sélectionnées.
         */
    // Méthode pour afficher le menu déroulant
    getSelectedOptions() {
        const selectedOptions = new Set();
        document.querySelectorAll('.result__item').forEach(option => {
            const cleanOption = option.textContent.replace('✖', '').trim();
            selectedOptions.add(cleanOption);
        });
        console.log("Options récupérées (nettoyées) :", [...selectedOptions]);
        return selectedOptions;
    }
    // Méthode pour masquer le menu déroulant
    hideDropdown(dropdownList) {
        if (dropdownList) {
            dropdownList.classList.remove('dropdown__list--visible'); 
            
            
        }
        if (searchInput) {
            searchInput.classList.remove('dropdown__search--visible');
            

        }
    }

   // Méthode pour ajuster la position de .cards
    adjustCardsPosition(action) {
        const cards = document.querySelector('.cards');
        // Si la section .cards existe, on ajuste sa margin-top en fonction de l'action
        if (cards) {
            const currentMargin = parseInt(cards.style.marginTop || 0);
            
            if (action === 'add') {
                // Ajouter 50px si une option est ajoutée
                cards.style.marginTop = `${currentMargin + 60}px`;
            } else if (action === 'remove') {
                // Soustraire 50px si une option est supprimée
                cards.style.marginTop = `${Math.max(currentMargin - 60, 0)}px`; // Assurez-vous que margin-top ne devienne pas négatif
            }
        }
    }

    // Mettre à jour les cartes selon les options
    updateFilteredCards() {
        const selectedOptions = this.getSelectedOptions();
        console.log("Options sélectionnées :", [...selectedOptions]);
    
        const currentDisplayedRecipes = Array.from(document.querySelectorAll('.card__title'))
            .map(cardTitle => cardTitle.textContent.toLowerCase());
    
        const varfilteredRecipes = this.filterByOptions(
            this.menuCards.filter(recipe => currentDisplayedRecipes.includes(recipe.name.toLowerCase())),
            selectedOptions
        );
    
        console.log("Recettes après le filtrage des options :", varfilteredRecipes);
    
        const cardsContainer = document.querySelector('.cards');
        cardsContainer.innerHTML = ''; // Efface les cartes précédentes
        varfilteredRecipes.forEach(recipe => {
            const card = new ModelCardsTemplate(recipe).createMenuCard();
            cardsContainer.appendChild(card);
        });

        
           // updateResultCount(count) {
            //    if (this.$resultTotal) {
            //        // Convertir count en chaîne de caractères
            //        const countStr = count < 10 ? `0${count}` : `${count}`;
             //       if (countStr.length < 2) {
             //           count = "0" + countStr;
             //       }
             //       this.$resultTotal.textContent = `${countStr} recette${count > 1 ? 's' : ''}`;
             //   } else {
             //       console.warn("Impossible de mettre à jour les résultats : l'encart n'existe pas encore.");
              //  }
          //  }
      //  }
  //  }    



  //const resultCount = document.querySelector('.result__total');
//if (resultCount) {
    //  méthode updateResultCount de FilterOptions
    //filterOptions.updateResultCount(varfilteredRecipes.length);
//}

//if (varfilteredRecipes.length === 0) {
//    cardsContainer.innerHTML = '<p class="warn__message">Aucune recette trouvée !</p>';
//}
const resultCount = document.querySelector('.result__total');

// Ajouter un zéro devant si la longueur est inférieure à 10
let formattedCount = varfilteredRecipes.length < 10 ? `0${varfilteredRecipes.length}` : varfilteredRecipes.length;

if (resultCount) {
    resultCount.textContent = `${formattedCount} recette${varfilteredRecipes.length > 1 ? 's' : ''}`;
}

if (varfilteredRecipes.length === 0) {
    cardsContainer.innerHTML = '<p class="warn__message">Aucune recette trouvée !</p>';
}
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



