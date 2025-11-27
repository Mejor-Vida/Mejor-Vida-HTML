
// This makes the form go to gracias.html after the user clicks "Mostrar Mi Cotización"
document.getElementById('cotizacion-form')?.addEventListener('submit', function(e) {
  e.preventDefault(); // stop the normal form submission for a second

  // send the data in the background
  const formData = new FormData(this);

  fetch(this.action, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  }).then(() => {
    // Success → go to the thank-you page
    window.location.href = 'gracias.html';
  }).catch(() => {
    // Even if something goes wrong with email, still show thank-you
    window.location.href = 'gracias.html';
  });
});
