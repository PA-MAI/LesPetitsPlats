
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

export function searchRecipes(recipes, query, menuCardsWrapper, cardTemplateCallback,selectedOptions = []) {
    const lowerCaseQuery = query.toLowerCase().trim();
    let filteredRecipes = [];

    // Récupération des options sélectionnées dynamiquement
    //const selectedOptions = new Set();
    document.querySelectorAll('.result__item').forEach(option => {
        const cleanOption = option.textContent.replace('✖', '').trim();
        selectedOptions.add(cleanOption);
        console.log("Options récupérées (nettoyées) :", [...selectedOptions]);
    });

    for (let i = 0; i < recipes.length; i++) {
        let recipe = recipes[i];
        let matchesQuery = false;

        // Vérification de la correspondance avec la requête
        if (lowerCaseQuery === '' ||
            recipe.name.toLowerCase().includes(lowerCaseQuery) ||
            recipe.description.toLowerCase().includes(lowerCaseQuery)) {
            matchesQuery = true;
        } else {
            // Vérification dans les ingrédients
            for (let j = 0; j < recipe.ingredients.length; j++) {
                if (recipe.ingredients[j].ingredient.toLowerCase().includes(lowerCaseQuery)) {
                    matchesQuery = true;
                    break;
                }
            }
        }

        // Vérification de la correspondance avec les options sélectionnées
        let matchesOptions = true;
        if (selectedOptions.size > 0) {
            selectedOptions.forEach(option => {
                const normalizedOption = option.toLowerCase().trim();
                const ingredientMatch = recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(normalizedOption));
                const applianceMatch = recipe.appliance.toLowerCase().includes(normalizedOption);
                const utensilMatch = recipe.ustensils.some(ust => ust.toLowerCase().includes(normalizedOption));

                if (!ingredientMatch && !applianceMatch && !utensilMatch) {
                    matchesOptions = false;
                }
            });
        }

        // Ajout de la recette si elle correspond à la requête et aux options
        if (matchesQuery && matchesOptions) {
            filteredRecipes.push(recipe);
        }
    }

    // Mise à jour du DOM
    renderCards(menuCardsWrapper, filteredRecipes, cardTemplateCallback);
    updateResultCount(document.querySelector('.result__total'), filteredRecipes.length);

    return filteredRecipes;
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