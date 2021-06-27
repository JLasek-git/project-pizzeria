import {settings, select} from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    // console.log('AmountWidget: ', thisWidget);
    // console.log('constructor arguments: ', element);


    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value);
    // console.log(newValue);
    if(thisWidget.value !== value && !isNaN(newValue) && value <= settings.amountWidget.defaultMax && value >= settings.amountWidget.defaultMin){
      thisWidget.value = newValue;
      // console.log('thisWidget.value: ', thisWidget.value);
      // console.log('thisWidget: ', thisWidget);
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;
    // console.log('thisWidget.input.value: ', thisWidget.input.value);
    // console.log('thisWidget.value: ', thisWidget.value);
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(){
      thisWidget.setValue(thisWidget.value-1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(){
      thisWidget.setValue(thisWidget.value+1);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;