'use strict';

/*
 * Pujan Beauty Studio
 * Main website JavaScript
 */

/* ---------------------------------------------------------
   Mobile navigation
--------------------------------------------------------- */

const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');

if (menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = primaryNav.classList.toggle('is-open');

    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      primaryNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ---------------------------------------------------------
   Footer year
--------------------------------------------------------- */

const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}


/* ---------------------------------------------------------
   Booking form
--------------------------------------------------------- */

const BOOKING_WEB_APP_URL =
  'PASTE_YOUR_WEB_APP_URL_HERE';

const bookingForm = document.getElementById('booking-form');
const bookingStatus = document.getElementById('booking-status');
const bookingDate = document.getElementById('booking-date');


// Prevent customers from selecting a past date.
if (bookingDate) {
  bookingDate.min = getLocalDateString(new Date());
}


if (bookingForm) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

 const BOOKING_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbyWmZ2w6PDYtmdJQW6Eknjp4BozleIUTD0CnizrVz91vZHDozyondTV5WibMqkLvRsp6w/exec';

if (
  !BOOKING_WEB_APP_URL ||
  BOOKING_WEB_APP_URL === 'PASTE_YOUR_WEB_APP_URL_HERE'
) {
  showBookingStatus(
    'The booking system has not been connected yet. Please call or use WhatsApp.',
    'error'
  );
  return;
}

const submitButton = bookingForm.querySelector(
  'button[type="submit"]'
);

    const originalButtonText = submitButton
      ? submitButton.textContent
      : '';

    const formData = new FormData(bookingForm);

    const bookingData = {
      customerName: getFormValue(formData, 'customerName'),
      phone: getFormValue(formData, 'phone'),
      email: getFormValue(formData, 'email'),
      service: getFormValue(formData, 'service'),
      preferredDate: getFormValue(formData, 'preferredDate'),
      preferredTime: getFormValue(formData, 'preferredTime'),
      notes: getFormValue(formData, 'notes'),
      website: getFormValue(formData, 'website')
    };

    setBookingFormBusy(
      submitButton,
      true,
      'Sending request...'
    );

    showBookingStatus(
      'Sending your appointment request...',
      'pending'
    );

    try {
      /*
       * no-cors is used because the GitHub Pages website and
       * Google Apps Script are hosted on different domains.
       *
       * The Apps Script sends:
       * 1. A booking email to Pujan Beauty Studio.
       * 2. An automatic acknowledgement to the customer.
       */
      await fetch(BOOKING_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-store',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(bookingData)
      });

      bookingForm.reset();

      if (bookingDate) {
        bookingDate.min = getLocalDateString(new Date());
      }

      showBookingStatus(
        'Thank you. Your appointment request has been sent. Please check your email for the acknowledgement message.',
        'success'
      );
    } catch (error) {
      console.error('Booking submission failed:', error);

      showBookingStatus(
        'We could not send your request. Please call or contact us through WhatsApp.',
        'error'
      );
    } finally {
      setBookingFormBusy(
        submitButton,
        false,
        originalButtonText
      );
    }
  });
}


/* ---------------------------------------------------------
   Helper functions
--------------------------------------------------------- */

function getFormValue(formData, fieldName) {
  return String(formData.get(fieldName) || '').trim();
}


function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


function setBookingFormBusy(
  submitButton,
  isBusy,
  buttonText
) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isBusy;
  submitButton.textContent = buttonText;

  submitButton.setAttribute(
    'aria-busy',
    String(isBusy)
  );
}


function showBookingStatus(message, statusType) {
  if (!bookingStatus) {
    return;
  }

  bookingStatus.textContent = message;

  bookingStatus.classList.remove(
    'is-success',
    'is-error',
    'is-pending'
  );

  if (statusType === 'success') {
    bookingStatus.classList.add('is-success');
  } else if (statusType === 'error') {
    bookingStatus.classList.add('is-error');
  } else if (statusType === 'pending') {
    bookingStatus.classList.add('is-pending');
  }
}
