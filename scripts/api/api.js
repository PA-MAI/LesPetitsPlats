class Api {
    /**
     * Constructor for the Api class
     * @param {string} url - The URL to fetch data from
     */
    constructor(url) {
        this._url = url; // Store the URL as a private variable
    }

    // Method to fetch data from the specified URL
    async get() {
        try {
            const response = await fetch(this._url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched data:', data); // Ajoutez ceci pour vérifier la structure
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
            return recipes; // Retourne le tableau des recettes
        } catch (error) {
            console.error('Failed to fetch menu cards:', error);
            return []; // Retourne un tableau vide en cas d'erreur
        }
    }
}