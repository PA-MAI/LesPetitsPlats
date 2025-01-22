
import {
  ModelCardsTemplate
} from '../templates/cards.js'
import {
  searchRecipes,
  updateResultCount,
  renderCards
} from '../utils/search2.js'


export class FilterOptions {
  constructor(type, items, menuCards) {
      this.type = type // Type du menu (e.g., ingrédients, appareils, ustensiles)
      this.items = items // Tableau des options à afficher
      // @todo ligne suivante pas utile à priori
      // this.$resultTotal = document.querySelector('.result__total');
      this.selectedOptions = new Set()
      this.menuCards = menuCards
      this.dropdownList = null;
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
    this.dropdownList = document.createElement('ul');
    this.dropdownList.classList.add('dropdown__list');
    this.dropdownList.setAttribute('aria-hidden', 'true');

    // Conteneur pour l'input et les icônes
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

    // Crée l'élément pour la loupe
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

        // Ajoute un écouteur d'événement de clic
        listItem.addEventListener('click', () => {
            console.log(`${item} sélectionné dans ${this.type}`);

            this.selectedOptions.add(item); // Ajoute l'élément sélectionné
            console.log("Option choisie :", this.selectedOptions);

            this.addToResultOptions(item);
            this.updateDropdownItems();
        });

        this.dropdownList.appendChild(listItem);
    });

    // Appeler updateDropdownItems une fois que tous les items ont été ajoutés
    this.updateDropdownItems();
    
    // Ajouter la barre de recherche et la liste au conteneur principal
    dropdownContainer.appendChild(this.dropdownList);

    // Gestion de l'affichage au clic (ouvrir/fermer) liste + barre de recherche
    dropdownButton.addEventListener('click', () => {
        const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
        dropdownButton.setAttribute('aria-expanded', !isExpanded);
        this.dropdownList.setAttribute('aria-hidden', isExpanded);
        this.dropdownList.classList.toggle('dropdown__list--visible', !isExpanded);
        inputContainer.classList.toggle('input__container--visible', !isExpanded);
        searchInput.classList.toggle('dropdown__search--visible', !isExpanded);
        dropdownButton.classList.toggle('dropdown__button--selected', !isExpanded);
    });

    // Ajouter les interactions au menu déroulant
    this.addDropdownInteractions(dropdownContainer, dropdownButton, this.dropdownList, searchInput, inputContainer, clearIcon);

    return dropdownContainer;
    
  }

  updateDropdownItems() {
    
    console.log('Mise à jour des items du menu déroulant...');
    
    // Récupérer les éléments actuels dans le menu déroulant
    const existingItems = Array.from(this.dropdownList.querySelectorAll('.dropdown__item'));
    
    // Créer un Set pour les items restants
    const remainingItemsSet = new Set(this.items);

    // Supprimer les items qui ne sont plus disponibles
    existingItems.forEach(item => {
        const itemText = item.textContent.trim();
        if (!remainingItemsSet.has(itemText)) {
            item.remove();
        } else {
            remainingItemsSet.delete(itemText); // Cet item existe déjà, pas besoin de le recréer
        }
    });

    // Ajouter les nouveaux items qui n'existent pas encore dans le menu
    remainingItemsSet.forEach(newItemText => {
        const listItem = document.createElement('li');
        listItem.classList.add('dropdown__item');
        listItem.textContent = newItemText;

        // Ajouter un événement de clic pour les nouveaux items
        listItem.addEventListener('click', () => {
            console.log(`${newItemText} sélectionné dans ${this.type}`);
            this.selectedOptions.add(newItemText);
            this.addToResultOptions(newItemText);
            this.updateDropdownItems(); // Mettre à jour après sélection
        });

        this.dropdownList.appendChild(listItem);
    });

    // Masquer les items sélectionnés
    const items = this.dropdownList.querySelectorAll('.dropdown__item');
    items.forEach(item => {
        const itemText = item.textContent.trim();
        item.style.display = this.selectedOptions.has(itemText) ? 'none' : '';
    });

    console.log('Mise à jour terminée.');
  }
  /**
   * Récupère les options sélectionnées des menus déroulants.
   * @returns {Set} Ensemble des options sélectionnées.
   */
  // Méthode pour afficher le menu déroulant
  getSelectedOptions() {
    // Utiliser this.selectedOptions comme source de vérité
    console.log('Options sélectionnées (actuelles) :', [...this.selectedOptions]);
    
    return this.selectedOptions;
}

  // Méthode pour ajouter les interactions
  addDropdownInteractions(container, dropdownButton, dropdownList, searchInput, inputContainer, clearIcon) {

      // Gestion du filtrage de l'input des menus deroulants
      searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase()
          const items = dropdownList.querySelectorAll('.dropdown__item')
          items.forEach(item => {
              item.style.display = item.textContent.toLowerCase().includes(query) ? '' : 'none'
          })

      })
      // Efface la valeur de l'input
      clearIcon.addEventListener('click', () => {
          searchInput.value = ''
          searchInput.focus()

      })

      // Gestion de la sélection d'une option
      dropdownList.addEventListener('click', (e) => {
          if (e.target.classList.contains('dropdown__item')) {
              this.addToResultOptions(e.target.textContent)
              this.hideDropdown(dropdownList, inputContainer, searchInput, dropdownButton)

              // Appel à la fonction de recherche après sélection d'une option
              const selectedOptions = this.getSelectedOptions()
              const query = document.getElementById('searchInput').value.trim()
              const filteredRecipes = searchRecipes(this.menuCards, query, document.querySelector('.cards'),
                  (recipe) => new ModelCardsTemplate(recipe).createMenuCard(), selectedOptions)
              filterMenuOptions(filteredRecipes)
          }
      })
      // ferme les menu sur le click exterieur
      document.addEventListener('click', (e) => {
          if (!container.contains(e.target)) {
              dropdownButton.setAttribute('aria-expanded', 'false')
              dropdownList.setAttribute('aria-hidden', 'true')
              this.hideDropdown(dropdownList, inputContainer, searchInput, dropdownButton)
          }
      })
      this.updateDropdownItems()

  }
  // met à jour les menus déroulants 
  addToResultOptions(option) {
      const resultOptions = document.querySelector('.result__options')
      const resultTotalElement = document.querySelector('.result__total')
      const menuCardsWrapper = document.querySelector('.cards')

      // Vérifie si l'option est déjà sélectionnée
      if ([...resultOptions.children].some(child => child.textContent.includes(option))) return;

      const resultItem = document.createElement('div')
      resultItem.className = 'result__item'
      resultItem.innerHTML = `
          ${ option } <span class="remove-option">✖</span>
      `
      console.log(`Option sélectionnée : ${ option }`)

      // Suppression au clic sur la croix
      resultItem.querySelector('.remove-option').addEventListener('click', () => {
          resultItem.remove()
          console.log(`Suppression déclenchée pour: ${option}`);
          console.log(`Avant suppression: ${[...this.selectedOptions]}`);
          console.log(`Removing option: ${option.trim()}`);
          this.selectedOptions.delete(option.trim());
          console.log(`Après suppression: ${[...this.selectedOptions]}`);
          this.updateDropdownItems();
          console.log(`Après suppression: ${[...this.selectedOptions]}`);
          const selectedOptions = this.getSelectedOptions()
         const query = document.getElementById('searchInput').value.trim()
          const filteredRecipes = searchRecipes(this.menuCards, query, document.querySelector('.cards'),
          (recipe) => new ModelCardsTemplate(recipe).createMenuCard(), selectedOptions)

          filterMenuOptions(filteredRecipes);
          // Ajuster la position de .cards (soustraire 50px lors de la suppression)
          this.adjustCardsPosition('remove')

      });

      resultOptions.appendChild(resultItem);
      this.selectedOptions.add(option.trim());
      this.updateDropdownItems();

      // Ajuste la position de .cards de 50px lorsqu'une option est ajoutée
      this.adjustCardsPosition('add')

      // Appel à searchRecipes pour filtrer les recettes après ajout de l'option
      const selectedOptions = this.getSelectedOptions()
      console.log('Options sélectionnées  avant:', selectedOptions)
      const query = document.getElementById('searchInput').value.trim()
      searchRecipes(this.menuCards, query, menuCardsWrapper, (recipe) => new ModelCardsTemplate(recipe).createMenuCard(), selectedOptions)
  }




  // Méthode pour masquer le menu déroulant
  hideDropdown(dropdownList, inputContainer, searchInput, dropdownButton) {
      if (dropdownList) {
          dropdownList.classList.remove('dropdown__list--visible')
      }
      if (inputContainer) {
          inputContainer.classList.remove('input__container--visible')
      }
      if (searchInput) {
          searchInput.classList.remove('dropdown__search--visible')
      }
      if (dropdownButton && dropdownButton.classList.contains('dropdown__button--selected')) {
          dropdownButton.classList.remove('dropdown__button--selected')
      }
  }


  // Méthode pour ajuster la position de .cards
  adjustCardsPosition(action) {
      const cards = document.querySelector('.cards')
      // Si la section .cards existe, on ajuste sa margin-top en fonction de l'action
      if (cards) {
          const currentMargin = parseInt(cards.style.marginTop || 0)

          if (action === 'add') {
              // Ajouter 60px si une option est ajoutée
              cards.style.marginTop = `${ currentMargin + 60 }px`
          } else if (action === 'remove') {
              // Soustraire 60px si une option est supprimée
              cards.style.marginTop = `${ Math.max(currentMargin - 60, 0) }px `

          }
      }
  }

}
export function filterMenuOptions(menuCards) {
    if (!menuCards || menuCards.length === 0) {
      console.warn('Aucune carte de menu n\'est disponible pour extraire les options.');
      return;
    }

    console.log('Création des menus déroulants...');
    const menuOptionsContainer = document.querySelector('.menu__options');
  
    // Initialisation de window.filterMenus si nécessaire
    if (!window.filterMenus) {
      window.filterMenus = {
          ingredientMenu: null,
          applianceMenu: null,
          utensilMenu: null,
      };
    }

     // Récupérer les options déjà sélectionnées
     const selectedIngredients = window.filterMenus.ingredientMenu ? [...window.filterMenus.ingredientMenu.selectedOptions] : [];
     const selectedAppliances = window.filterMenus.applianceMenu ? [...window.filterMenus.applianceMenu.selectedOptions] : [];
     const selectedUtensils = window.filterMenus.utensilMenu ? [...window.filterMenus.utensilMenu.selectedOptions] : [];
 
     // Calculer les items restants pour chaque menu
     const ingredients = [...new Set(
         menuCards.flatMap(card => card.ingredients.map(ing => ing.ingredient))
     )].filter(ingredient => !selectedIngredients.includes(ingredient));
 
     const appliances = [...new Set(menuCards.map(card => card.appliance))]
         .filter(appliance => !selectedAppliances.includes(appliance));
 
     const utensils = [...new Set(menuCards.flatMap(card => card.ustensils))]
         .filter(utensil => !selectedUtensils.includes(utensil));
 
     // Mise à jour partielle des menus
     if (!window.filterMenus.ingredientMenu) {
         // Création des menus pour la première fois
         console.log('Création des menus déroulants...');
         window.filterMenus.ingredientMenu = new FilterOptions('ingrédients', ingredients, menuCards);
         window.filterMenus.applianceMenu = new FilterOptions('appareils', appliances, menuCards);
         window.filterMenus.utensilMenu = new FilterOptions('ustensiles', utensils, menuCards);
 
         menuOptionsContainer.appendChild(window.filterMenus.ingredientMenu.createDropdown());
         menuOptionsContainer.appendChild(window.filterMenus.applianceMenu.createDropdown());
         menuOptionsContainer.appendChild(window.filterMenus.utensilMenu.createDropdown());
     } else {
         // Mettre à jour les items des menus existants
         console.log('Mise à jour partielle des menus...');
         window.filterMenus.ingredientMenu.items = ingredients;
         window.filterMenus.applianceMenu.items = appliances;
         window.filterMenus.utensilMenu.items = utensils;
 
         // Mise à jour dynamique des items restants
         window.filterMenus.ingredientMenu.updateDropdownItems();
         window.filterMenus.applianceMenu.updateDropdownItems();
         window.filterMenus.utensilMenu.updateDropdownItems();
     }
 }

