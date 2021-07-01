import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.hourWidget = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.dateWidget = document.querySelector(select.widgets.datePicker.wrapper);
    // console.log(thisBooking.dom.hourWidget);
  
  }

  initWidgets(){
    const thisBooking = this;

    new AmountWidget(thisBooking.dom.peopleAmount);
    new AmountWidget(thisBooking.dom.hoursAmount);
    new HourPicker(thisBooking.dom.hourWidget);
    new DatePicker(thisBooking.dom.dateWidget);
  }
}


export default Booking;