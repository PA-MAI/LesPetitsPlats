/**
 * Recherche les recettes correspondant à la requête.
 * @param {Array} recipes - La liste complète des recettes.
 * @param {string} query - La chaîne de recherche saisie par l'utilisateur.
 * @returns {Array} - Un tableau des recettes filtrées.
 */
export function searchRecipes(recipes, query) {
    if (!query || query.length < 3) {
      console.warn('Veuillez saisir au moins 3 caractères.');
      return recipes; // Retourne toutes les recettes si la requête est trop courte
    }
  
    // Convertit la requête en minuscules pour une recherche insensible à la casse
    const lowerCaseQuery = query.toLowerCase();
  
    // Filtre les recettes dont le nom ou l'ingredient contient la requête
    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(lowerCaseQuery) || 
    recipe.ingredients.some(ingredient =>
        ingredient.ingredient.toLowerCase().includes(lowerCaseQuery)  // On recherche dans la propriété `ingredient`
      )
    );

  }