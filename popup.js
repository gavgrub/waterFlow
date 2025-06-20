// About popup
function openAbout() {
  document.getElementById('about').style.display = 'flex';
}

function closeAbout() {
  document.getElementById('about').style.display = 'none';
}

window.onclick = function(event) {
  const popup = document.getElementById('about');
  if (event.target === popup) {
    popup.style.display = 'none';
  }
};

// Acknowledgements Popup
function openAcknowledgements() {
  document.getElementById('acknowledgements').style.display = 'flex';
}

function closeAcknowledgements() {
  document.getElementById('acknowledgements').style.display = 'none';
}

window.onclick = function(event) {
  const popup = document.getElementById('acknowledgements');
  if (event.target === popup) {
    popup.style.display = 'none';
  }
};

// Legal Popup
function openLegal() {
  document.getElementById('legal').style.display = 'flex';
}

function closeLegal() {
  document.getElementById('legal').style.display = 'none';
}

window.onclick = function(event) {
  const popup = document.getElementById('legal');
  if (event.target === popup) {
    popup.style.display = 'none';
  }
};
