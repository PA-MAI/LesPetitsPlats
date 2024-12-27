export class FilterOptions {
    constructor(type, items) {
        this.type = type; // Type du menu (e.g., ingrédients, appareils, ustensiles)
        this.items = items; // Tableau des options à afficher
    }

    // Méthode pour créer le menu déroulant
    createDropdown() {
        // Conteneur principal du menu
        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('dropdown', `dropdown--${this.type}`);

        // Bouton pour ouvrir/fermer le menu
        const dropdownButton = document.createElement('button');
        dropdownButton.classList.add('dropdown__button');
        dropdownButton.textContent = `Choisir ${this.type}`;
        dropdownContainer.appendChild(dropdownButton);

        // Conteneur des options
        const dropdownList = document.createElement('ul');
        dropdownList.classList.add('dropdown__list');

        // Ajouter chaque élément à la liste
        this.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('dropdown__item');
            listItem.textContent = item;
            dropdownList.appendChild(listItem);
        });

        // Ajouter la liste au conteneur principal
        dropdownContainer.appendChild(dropdownList);

        // Gestion de l'affichage au clic (ouvrir/fermer)
        dropdownButton.addEventListener('click', () => {
            dropdownList.classList.toggle('dropdown__list--visible');
        });

        return dropdownContainer;
    }
}