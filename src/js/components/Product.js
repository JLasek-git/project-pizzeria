import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.prepareCartProductParams();

    // console.log('newProduct:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContanier = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContanier.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    // console.log('This Product: ', thisProduct);
  }


  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: add event listener to clickable trigger on event click */
    clickableTrigger.addEventListener('click', function(event){
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('article.active');

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct && activeProduct != thisProduct.element){
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      // console.log(status);
    });
  }

  initOrderForm(){
    const thisProduct = this;


    // console.log('initOrderForm');
    thisProduct.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function() {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });

  }

  processOrder(){
    const thisProduct = this;
    // console.log('processOrder');

    //cover form to opbject structure { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);

    //set price to default price
    let price = thisProduct.data.price;

    //for every category (param)...
    for(let paramId in thisProduct.data.params) {
      //determinate param vaule, paramId = 'toppings', param = {label: 'Toppings', type: 'checkboxes'...}
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);

      //for every option in this category
      for(let optionId in param.options) {
        //determinate option value, optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        const optionNotSelected = formData.hasOwnProperty(paramId) && formData[paramId].includes(optionId) == false;
        //checking if option is checked, and if it's not default calculate total price (total + option price)
        if(optionSelected && option.default != true){
          price += option.price;
          //checking if option is unchecked, and if it's default calculate total price (total - option price)
        } else if(optionNotSelected && option.default == true){
          price -= option.price;
        }

        const productId = '.' + paramId + '-' + optionId;
        const optionImage = thisProduct.imageWrapper.querySelector(productId);

        if(optionImage) {
          if(optionSelected) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    //udate calculated price in HTML
    thisProduct.priceSingle *= thisProduct.amountWidget.value;
    thisProduct.priceSingle = price;
    thisProduct.priceElem.innerHTML = price;
  }

  addToCart(){
    const thisProduct = this;


    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {id: thisProduct.id, name: thisProduct.data.name, amount: thisProduct.amountWidget.value, priceSingle: thisProduct.priceSingle, price: thisProduct.priceSingle * thisProduct.amountWidget.value, params: thisProduct.prepareCartProductParams() };

    // console.log('Summar: ', productSummary.params);
    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};


    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {}
      };


      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }
}

export default Product;