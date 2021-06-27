import {select} from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;

    // console.log('thisCartProduct: ', thisCartProduct);
    // console.log('menuProduct: ', menuProduct);
    // console.log('element: ', element);

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};

    thisCartProduct.wrapper = element;

    thisCartProduct.dom.amountWidget = thisCartProduct.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.wrapper.querySelector(select.cartProduct.remove);

    // console.log('thisCartProduct.wrapper: ', thisCartProduct.wrapper);
    // console.log('thisCartProduct.dom.amountWidget: ', thisCartProduct.dom.amountWidget);
    // console.log('thisCartProduct.dom.price: ', thisCartProduct.dom.price);
    // console.log('thisCartProduct.dom.edit: ', thisCartProduct.dom.edit);
    // console.log('thisCartProduct.dom.remove: ', thisCartProduct.dom.remove);
  }

  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountNumber = new AmountWidget(thisCartProduct.dom.amountWidget);
    // console.log('thisCartProduct.amountNumber: ', thisCartProduct.amountNumber);
    // console.log('thisCarProduct.dom.amountWidget: ', thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
      thisCartProduct.processOrder();
    });

  }

  processOrder() {
    const thisCartProduct = this;

    let price = thisCartProduct.dom.price;
    thisCartProduct.amount = thisCartProduct.amountNumber.value;
    // console.log('thisCartProduct.amountNumber: ', thisCartProduct.amountNumber);
    price.innerHTML = thisCartProduct.priceSingle * thisCartProduct.amount;

  }

  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.wrapper.dispatchEvent(event);
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();

      thisCartProduct.remove();
    });
  }

  getData(){
    const thisCartProduct = this;
    const cartProductSummary = {id: thisCartProduct.id, name: thisCartProduct.name, amount: thisCartProduct.amount, priceSingle: thisCartProduct.priceSingle, price: thisCartProduct.priceSingle * thisCartProduct.amount, params: thisCartProduct.params };

    return cartProductSummary;
  }
}

export default CartProduct;