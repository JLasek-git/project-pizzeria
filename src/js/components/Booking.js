import { templates, select, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';
import utils from '../utils.js';


class Booking {
  constructor(wrapper){
    const thisBooking = this;

    thisBooking.render(wrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    thisBooking.tableId = null;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };


    // console.log('getData params', params.booking);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event +   '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event +   '?' + params.eventsRepeat.join('&'),
    };

    // console.log('getData urls', urls.booking);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    // console.log(eventsRepeat);
    thisBooking.booked = {};

    for(const item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(const item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(const item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log(thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined' ){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+=0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined' ){
        thisBooking.booked[date][hourBlock]= [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    const pickedTable = thisBooking.dom.floorPlan.querySelector('.' + classNames.booking.tablePicked);

    if(pickedTable){
      pickedTable.classList.remove(classNames.booking.tablePicked);
      thisBooking.tableId = null;
    }

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    // console.log('thisBooking.date: ', thisBooking.date);
    // console.log('thisBooking.hour: ', thisBooking.hour);

    let allAvailable = false;
    // console.log('allAvailable: ', allAvailable);

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      allAvailable = true;
      // console.log('allAvailable: ', allAvailable);
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute('data-table');
      // console.log(tableId);
      // console.log('table: ', table);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
        // console.log('tableId: ', tableId);
      }

      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
        table.classList.add(classNames.booking.tableBooked);
        // console.log(thisBooking.booked[thisBooking.date][thisBooking.hour]);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(wrapper){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = wrapper;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

    thisBooking.dom.hourWidget = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.dateWidget = document.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.tables =  document.querySelectorAll(select.booking.tables);
    thisBooking.dom.button = document.querySelector(select.booking.btnBooking);
    thisBooking.dom.floorPlan = document.querySelector(select.booking.floorPlan);

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll('[name=starter]');
    thisBooking.starters = [];

    // console.log(thisBooking.dom.hourWidget);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourWidget);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.dateWidget);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      event.preventDefault();

      thisBooking.initTables(event);
    });

    thisBooking.dom.button.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

    /* Starters adding */
    for(const starter of thisBooking.dom.starters){
      starter.addEventListener('click', function(event){
        if(!thisBooking.starters.includes(event.target.value)){
          thisBooking.starters.push(event.target.value);
        } else {
          const indexOfStarter = thisBooking.starters.indexOf(event.target.value);
          thisBooking.starters.splice(indexOfStarter, 1);
        }
      });
    }


  }

  initTables(event){
    const thisBooking = this;
    const selectedTable = event.target;

    const alreadySelected = thisBooking.dom.floorPlan.querySelector('.' + classNames.booking.tablePicked);
    if(alreadySelected) {
      alreadySelected.classList.remove(classNames.booking.tablePicked);
    }

    thisBooking.tableId = parseInt(selectedTable.getAttribute('data-table'));
    // console.log(thisBooking.tableId);
    //This condition determinates if table is table, if it's not booked and if it's not already picked
    const mainCondition = selectedTable.classList.contains('table') && !selectedTable.classList.contains(classNames.booking.tableBooked);

    // console.log(thisBooking.selectedTable);
    if(mainCondition){
      selectedTable.classList.add(classNames.booking.tablePicked);
    }
  }

  sendBooking(){
    const thisBooking = this;

    //URL generation
    const url = settings.db.url + '/' + settings.db.booking;

    //Payload configuration
    const payload = {};

    payload.date = thisBooking.datePicker.correctValue;
    payload.hour = thisBooking.hourPicker.correctValue;
    payload.table = thisBooking.tableId;
    payload.duration = thisBooking.hoursAmount.value;
    payload.ppl = thisBooking.peopleAmount.value;
    payload.starters = thisBooking.starters;
    payload.phone = thisBooking.dom.phone.value;
    payload.adress = thisBooking.dom.address.value;

    //Convert hour from 12:30 format to 12.5
    const hour = utils.hourToNumber(payload.hour);

    // console.log(payload);

    // Check if table is selected
    if(payload.table == null){
      alert('First select table.');
    }
    // If it's selected, check if it's not booked
    else if(thisBooking.booked[payload.date][hour].includes(payload.table)) {
      alert('Unfortunately, that table is already occupied.');
    }
    // If table is selected, and it's not booked add reservation
    else {

      //Booking to server options
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(){
          thisBooking.booked[payload.date][hour].push(payload.table);
        });
    }

  }
}


export default Booking;