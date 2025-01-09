
/**
 * Met à jour le texte affiché pour le nombre total de résultats.
 * @param {HTMLElement} resultTotalElement - Élément DOM pour afficher le total.
 * @param {number} count - Nombre de recettes à afficher.
 */
export function updateResultCount(resultTotalElement, count) {
    if (resultTotalElement) {
        const countStr = count < 10 ? `0${count}` : `${count}`;
        if (countStr.length < 2) {
            count = "0" + countStr;
            }
        resultTotalElement.textContent = `${countStr} recette${count > 1 ? 's' : ''}`;
    } else {
        console.warn("Impossible de mettre à jour les résultats : l'élément result__total n'existe pas.");
    }
}
/**
 * Recherche les recettes correspondant à la requête et gère l'affichage.
 * @param {Array} recipes - La liste complète des recettes.
 * @param {string} query - La chaîne de recherche saisie par l'utilisateur.
 * @param {HTMLElement} menuCardsWrapper - Conteneur des cartes.
 * @param {Function} cardTemplateCallback - Fonction pour créer une carte.
 */

export function searchRecipes(recipes, query, menuCardsWrapper, cardTemplateCallback, selectedOptions) {
    if (!query || query.length < 3) {
        console.warn('Veuillez saisir au moins 3 caractères.');
        renderCards(menuCardsWrapper, recipes, cardTemplateCallback); // Affiche toutes les recettes
        return recipes; // Retourne toutes les recettes si la recherche est vide
    }

    const lowerCaseQuery = query.toLowerCase();
    let varfilteredRecipes = [];

    // Parcours des recettes pour la recherche générale
    for (let i = 0; i < recipes.length; i++) {
        let recipe = recipes[i];

        if (
            recipe.name.toLowerCase().includes(lowerCaseQuery) ||
            recipe.description.toLowerCase().includes(lowerCaseQuery)
        ) {
            varfilteredRecipes.push(recipe);
        } else {
            recipe.ingredients.forEach((ingredient) => {
                if (ingredient.ingredient.toLowerCase().includes(lowerCaseQuery)) {
                    varfilteredRecipes.push(recipe);
                }
            });
        }
    }

    // Si des options sont sélectionnées, appliquer un filtrage supplémentaire
    if (selectedOptions && selectedOptions.size > 0) {
        const filterOptions = new FilterOptions();
        varfilteredRecipes = filterOptions.filterByOptions(varfilteredRecipes, selectedOptions);
    }
    
   
    console.log("Recettes correspondant à la recherche et aux filtres :", varfilteredRecipes);

    // Affichage des résultats filtrés
    renderCards(menuCardsWrapper, varfilteredRecipes, cardTemplateCallback);
    return varfilteredRecipes; // Retourne les recettes filtrées
}
  /**
   * Gère l'affichage des cartes dynamiquement de manière fonctionnelle.
   * @param {HTMLElement} menuCardsWrapper - Conteneur des cartes.
   * @param {Array} recipes - Les recettes à afficher.
   * @param {Function} cardTemplateCallback - Fonction pour créer une carte.
   */
  export function renderCards(menuCardsWrapper, recipes, cardTemplateCallback) {
    menuCardsWrapper.innerHTML = ''; // Réinitialise le conteneur
  
    if (recipes.length === 0) {
        menuCardsWrapper.innerHTML = '<p>Aucune recette trouvée!</p>';
        return;
    }
  
    // Création et insertion des cartes en utilisant map et join
    menuCardsWrapper.innerHTML = recipes
        .map((recipe) => cardTemplateCallback(recipe).outerHTML)
        .join(''); // Génère une seule chaîne de HTML
  }