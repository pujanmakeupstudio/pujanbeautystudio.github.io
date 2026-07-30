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
   Google Apps Script Web App
--------------------------------------------------------- */

const BOOKING_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbyWmZ2w6PDYtmdJQW6Eknjp4BozleIUTD0CnizrVz91vZHDozyondTV5WibMqkLvRsp6w/exec';

/* ---------------------------------------------------------
   Booking form
--------------------------------------------------------- */

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

    if (!isWebAppConnected()) {
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
      action: 'booking',
      customerName: getFormValue(formData, 'customerName'),
      phone: getFormValue(formData, 'phone'),
      email: getFormValue(formData, 'email'),
      referralCode: getFormValue(formData, 'referralCode').toUpperCase(),
      service: getFormValue(formData, 'service'),
      preferredDate: getFormValue(formData, 'preferredDate'),
      preferredTime: getFormValue(formData, 'preferredTime'),
      notes: getFormValue(formData, 'notes'),
      website: getFormValue(formData, 'website')
    };

    setFormBusy(
      submitButton,
      true,
      'Sending request...'
    );

    showBookingStatus(
      'Sending your appointment request...',
      'pending'
    );

    try {
       
if (bookingData.referralCode) {
  const validationUrl =
    `${BOOKING_WEB_APP_URL}?action=validateReferral&referralCode=` +
    encodeURIComponent(bookingData.referralCode);

 const validationResult = await validateReferralCode(validationUrl);

   if (!validationResult.valid) {
    showBookingStatus(
      'This referral code is invalid or has already been used.',
      'error'
    );
    return;
  }
}

       
      await sendToAppsScript(bookingData);

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
        'This referral code is invalid or has already been used. Please remove it or use a valid referral code.',
        'error'
      );
    } finally {
      setFormBusy(
        submitButton,
        false,
        originalButtonText
      );
    }
  });
}

/* ---------------------------------------------------------
   Referral form
--------------------------------------------------------- */

const referralForm = document.getElementById('referral-form');
const referralStatus = document.getElementById('referral-status');

if (referralForm) {
  referralForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!referralForm.checkValidity()) {
      referralForm.reportValidity();
      return;
    }

    if (!isWebAppConnected()) {
      showReferralStatus(
        'The referral system has not been connected yet. Please try again later.',
        'error'
      );
      return;
    }

    const submitButton = referralForm.querySelector(
      'button[type="submit"]'
    );

    const originalButtonText = submitButton
      ? submitButton.textContent
      : '';

    const formData = new FormData(referralForm);

    const senderEmail = getFormValue(
      formData,
      'senderEmail'
    ).toLowerCase();

    const receiverEmail = getFormValue(
      formData,
      'receiverEmail'
    ).toLowerCase();

    if (senderEmail === receiverEmail) {
      showReferralStatus(
        'You cannot refer yourself. Please enter your friend’s email address.',
        'error'
      );
      return;
    }

    const referralData = {
      action: 'referral',
      senderName: getFormValue(formData, 'senderName'),
      senderEmail: senderEmail,
      receiverName: getFormValue(formData, 'receiverName'),
      receiverEmail: receiverEmail,
      website: ''
    };

    setFormBusy(
      submitButton,
      true,
      'Sending referral...'
    );

    showReferralStatus(
      'Sending your referral...',
      'pending'
    );

    try {
      await sendToAppsScript(referralData);

      referralForm.reset();

      showReferralStatus(
        'Referral sent successfully. Your friend will receive the referral details shortly.',
        'success'
      );
    } catch (error) {
      console.error('Referral submission failed:', error);

      showReferralStatus(
        'We could not send the referral. Please try again.',
        'error'
      );
    } finally {
      setFormBusy(
        submitButton,
        false,
        originalButtonText
      );
    }
  });
}

/* ---------------------------------------------------------
   Shared helper functions
--------------------------------------------------------- */

async function sendToAppsScript(data) {
  await fetch(BOOKING_WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-store',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(data)
  });
}

function isWebAppConnected() {
  return Boolean(
    BOOKING_WEB_APP_URL &&
    BOOKING_WEB_APP_URL !== 'PASTE_YOUR_WEB_APP_URL_HERE'
  );
}

function getFormValue(formData, fieldName) {
  return String(formData.get(fieldName) || '').trim();
}

function getLocalDateString(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function setFormBusy(
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

/* ---------------------------------------------------------
   Booking status
--------------------------------------------------------- */

function showBookingStatus(message, statusType) {
  updateFormStatus(
    bookingStatus,
    message,
    statusType
  );
}

/* ---------------------------------------------------------
   Referral status
--------------------------------------------------------- */

function showReferralStatus(message, statusType) {
  updateFormStatus(
    referralStatus,
    message,
    statusType
  );
}

/* ---------------------------------------------------------
   Shared status display
--------------------------------------------------------- */

function updateFormStatus(
  statusElement,
  message,
  statusType
) {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;

  statusElement.classList.remove(
    'is-success',
    'is-error',
    'is-pending'
  );

  if (statusType === 'success') {
    statusElement.classList.add('is-success');
  } else if (statusType === 'error') {
    statusElement.classList.add('is-error');
  } else if (statusType === 'pending') {
    statusElement.classList.add('is-pending');
  }
}

function validateReferralCode(validationUrl) {
  return new Promise((resolve, reject) => {
    const callbackName =
      'referralValidation_' + Date.now();

    const script = document.createElement('script');

    const cleanup = () => {
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = (result) => {
      cleanup();
      resolve(result);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Referral validation failed.'));
    };

    script.src =
      validationUrl +
      '&callback=' +
      encodeURIComponent(callbackName);

    document.body.appendChild(script);
  });
}
