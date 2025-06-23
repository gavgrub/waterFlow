// This code handles the interactable elements of the popups

function openPopup(id) {
  document.getElementById(id).style.display = 'flex';
}

function closePopup(id) {
  document.getElementById(id).style.display = 'none';
}

window.onclick = function(event) {
  if (event.target.classList.contains('popup')) {
    event.target.style.display = 'none';
  }
};