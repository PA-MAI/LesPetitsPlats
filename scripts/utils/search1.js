/**
 * Recherche les recettes correspondant à la requête et gère l'affichage.
 * @param {Array} recipes - La liste complète des recettes.
 * @param {string} query - La chaîne de recherche saisie par l'utilisateur.
 * @param {HTMLElement} menuCardsWrapper - Conteneur des cartes.
 * @param {Function} cardTemplateCallback - Fonction pour créer une carte.
 */
export function searchRecipes(recipes, query, menuCardsWrapper, cardTemplateCallback) {
  if (!query || query.length < 3) {
      console.warn('Veuillez saisir au moins 3 caractères.');
      renderCards(menuCardsWrapper, recipes, cardTemplateCallback); // Affiche toutes les recettes
      return recipes; // Retourne toutes les recettes si la recherche est vide
  }

  const lowerCaseQuery = query.toLowerCase();

  // Filtrage fonctionnel
  const filteredRecipes = recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(lowerCaseQuery) ||
      recipe.ingredients.some((ingredient) =>
          ingredient.ingredient.toLowerCase().includes(lowerCaseQuery)
      )
  );

  // Affichage des résultats filtrés
  renderCards(menuCardsWrapper, filteredRecipes, cardTemplateCallback);
  return filteredRecipes; // Retourne les recettes filtrées
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

  // Utilisation de map pour créer les cartes et les insérer
  menuCardsWrapper.innerHTML = recipes
      .map((recipe) => cardTemplateCallback(recipe).outerHTML)
      .join('');
      console.log ("nombre d'elements affichés",recipes)
}