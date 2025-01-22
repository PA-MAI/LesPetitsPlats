export class ModelCardsTemplate {
    constructor(recipe) {
        if (!recipe) {
            throw new Error('Recipe is undefined or nul.');
        }
        const { id, image, name, servings, ingredients, time, description, appliance, ustensils } = recipe;
        this.id = id;
        this.image = image;
        this.name = name;
        this.servings = servings;
        this.ingredients = ingredients;
        this.time = time;
        this.description = description;
        this.appliance = appliance;
        this.ustensils = ustensils;
    }
  
    createMenuCard() {
        const $wrapper = document.createElement('div');
        $wrapper.classList.add('card__section--wrapper');
  
        const ingredientsHtml = this.ingredients.map((ing) => {
            const qty = ing.quantity ? ` ${ing.quantity}` : '';
            const unit = ing.unit ? ` ${ing.unit}` : '';
            return `<div class="ingredient"><span>${ing.ingredient}</span><br>
            <span class="qtyunit">${qty}${unit}</span></div>`;
        }).join('');
  
        $wrapper.innerHTML = `
            <article class="card">
            
                <div class="card__menu">
                    <img class="card__img" alt="${this.name}" src="./assets/img/${this.image}">
                    <div class="temps">${this.time} min</div>
                    <h2 class="card__title">${this.name}</h2>
                </div>
                <div class="card__text">
                    <h3>RECETTE</h3>
                    <span class="card__description">${this.description}</span>
                    <h3>INGR&Eacute;DIENTS</h3>
                    <ul>${ingredientsHtml}</ul>
                    
                </div>
                
            </article>
        `;
        return $wrapper;
    }
  }