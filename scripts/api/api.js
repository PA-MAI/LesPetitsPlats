class Api {
    /**
     * Constructor pour la class Api 
     * @param {string} url 
     */
    constructor(url) {
        this._url = url; // stocke l' URL dans une variable privée
    }

    // methode fetch data pour l'URL specifiée
    async get() {
        try {
            const response = await fetch(this._url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched data:', data); //  vérifie la structure
            return data;
        } catch (err) {
            console.error('An error occurred while fetching data:', err);
            throw err;
        }
    }
}
export class ApiMenuCards extends Api {
    async getMenuCards() {
        try {
            const { recipes } = await this.get();
            if (!Array.isArray(recipes)) {
                throw new Error('The "recipes" key is not an array');
            }
             // Vérifier si chaque recette contient les propriétés attendues
            recipes.forEach(recipe => {
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
                console.warn(`Missing or invalid ingredients for recipe: ${recipe.name}`);
            }
            if (typeof recipe.appliance !== 'string') {
                console.warn(`Missing or invalid appliance for recipe: ${recipe.name}`);
            }
            if (!Array.isArray(recipe.ustensils)) {
                console.warn(`Missing or invalid ustensils for recipe: ${recipe.name}`);
            }
        });
            this.menuCards = recipes;
            return recipes; // Retourne le tableau des recettes
        } catch (error) {
            console.error('Failed to fetch menu cards:', error);
            return []; // Retourne un tableau vide en cas d'erreur
        }
    }
}