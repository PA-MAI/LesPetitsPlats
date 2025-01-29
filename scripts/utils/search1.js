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
 * @param {Set} selectedOptions - Ensemble des options de filtre sélectionnées.
 */
export function searchRecipes(recipes, query, menuCardsWrapper, cardTemplateCallback, selectedOptions = []) {
    const lowerCaseQuery = query.toLowerCase();


    // Filtrage par requête fonctionnelle
    let filteredRecipes = recipes.filter(recipe => {
        const matchesQuery = lowerCaseQuery === '' || (
            recipe.name.toLowerCase().includes(lowerCaseQuery) ||
            recipe.description.toLowerCase().includes(lowerCaseQuery) ||
            recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(lowerCaseQuery))
        );

        // Filtrage par options sélectionnées
        const matchesOptions = selectedOptions.size === 0 || [...selectedOptions].every(option => {
            const normalizedOption = option.toLowerCase().trim();
            return (
                recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(normalizedOption)) ||
                recipe.appliance.toLowerCase().includes(normalizedOption) ||
                recipe.ustensils.some(ust => ust.toLowerCase().includes(normalizedOption))
            );
        });

        return matchesQuery && matchesOptions;
    });

    // Mise à jour du DOM
    renderCards(menuCardsWrapper, filteredRecipes, cardTemplateCallback, query);
    updateResultCount(document.querySelector('.result__total'), filteredRecipes.length);

    return filteredRecipes;
}
/**
 * Gère l'affichage des cartes dynamiquement de manière fonctionnelle.
 * @param {HTMLElement} menuCardsWrapper - Conteneur des cartes.
 * @param {Array} recipes - Les recettes à afficher.
 * @param {Function} cardTemplateCallback - Fonction pour créer une carte.
 */
export function renderCards(menuCardsWrapper, recipes, cardTemplateCallback, query) {
    menuCardsWrapper.innerHTML = ''; // Réinitialise le conteneur
   
    if (recipes.length === 0) {
        menuCardsWrapper.innerHTML = '<p class="warn__message"> Aucune recette ne contient \'' + query + '\' vous pouvez chercher tarte aux pommes , poisson , etc... </p>';
        return;
    }

    // Création et insertion des cartes en utilisant map et join
    menuCardsWrapper.innerHTML = recipes
        .map((recipe) => cardTemplateCallback(recipe).outerHTML)
        .join(''); // Génère une seule chaîne de HTML
}