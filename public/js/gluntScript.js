// import * as validation from './validation.mjs';
// <script type="module" src="./validation.mjs"></script>

import { validateName, validateLocation, getSafeDescription, getValidImgUrl } from './validation.js';
import { getGif, getUnSplash } from './giphy.js';

const defaultImgUrl = "https://cavchronicle.org/wp-content/uploads/2018/03/top-travel-destination-for-visas-900x504.jpg";

document.addEventListener("DOMContentLoaded", function () {
  const destinations = document.querySelector('#destinations_container');
  const inputButton = document.querySelector('#inputButton');
  const cardData = { name: "", image_src: "", location: "", description: "" };


  getCardsFromServer()
  .then(cards => {
    for (let i = 0; i < cards.length; i++) {
      destinations.appendChild(cards[i].card);
      cards[i].editButton.addEventListener('click', () => {
        editCard(cards[i], cardData);
      });
      cards[i].removeButton.addEventListener('click', () => {
        if (cards[i].removeButton.textContent === "Remove") {
          removeCardFromServer(cards[i].id.textContent);
          cards[i].card.remove();
        } else {
          cancelEdit(cards[i], cardData);
        }
      })
    }
  })
  .catch(error => console.error(error))



  inputButton.addEventListener('click', () => {

    if (!validateName() || !validateLocation()) {
      return;
    }

    const newCard = createNewCard();

    destinations.appendChild(newCard.card);

    newCard.editButton.addEventListener('click', () => {
      editCard(newCard, cardData);
    });

    newCard.removeButton.addEventListener('click', () => {
      console.log("Stop executing so I can figure this out!");
      if (newCard.removeButton.textContent === "Remove") {
        removeCardFromServer(newCard.id.textContent);
        newCard.card.remove();
      } else {
        cancelEdit(newCard, cardData);
      }
    });
  });
});


function createNewCard() {
  //Get input data
  const nameInput = document.querySelector('#name');
  const locationInput = document.querySelector('#location');
  const photoURLInput = document.querySelector('#photo');
  const descriptionInput = document.querySelector('#description');

  const newCardObj = {
    card: document.createElement('div'),
    image: document.createElement('img'),
    name: document.createElement('h2'),
    location: document.createElement('p'),
    description: document.createElement('p'),
    editButton: document.createElement('button'),
    removeButton: document.createElement('button'),
    id: document.createElement('p')
  };

  //set classes
  let classNames = ['card', 'image', 'destination', 'location', 'description', 'button', 'button'];
  let i = 0;
  for (let element in newCardObj) {
    newCardObj[element].className = classNames[i] + " input";
    i++;
  }

  //set content
  newCardObj.name.textContent = nameInput.value;
  newCardObj.location.textContent = locationInput.value;
  newCardObj.description.textContent = getSafeDescription(descriptionInput.value);
  newCardObj.editButton.textContent = 'Edit';
  newCardObj.removeButton.textContent = 'Remove';


  //Set image
  let validUrl = false;
  const searchString = nameInput.value + "+" + locationInput.value;
  getValidImgUrl(photoURLInput.value)
    .then(url => {
      validUrl = true;
      newCardObj.image.src = url;
    })
    .catch(async () => {
      try {
        const url = await getUnSplash(searchString);
        newCardObj.image.src = url; //if (!validUrl)
      } catch {
        newCardObj.image.src = defaultImgUrl;
      }
    })
    .finally(() => {
      const body = {
        name: newCardObj.name.textContent,
        location: newCardObj.location.textContent,
        photo: newCardObj.image.src,
        description: newCardObj.description.textContent
      }
      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      };
      console.log(request.body);
      fetch('/place', request)
        .then(response => {
          // console.log(response.json);
          return response.json();
        })
        .then(data => {
          newCardObj.id.textContent = data.insertedId;
          console.log(data);
          console.log(newCardObj.id.textContent);
        })
        .catch(error => {
          console.error(error);
        });
    });



  //append children
  newCardObj.card.appendChild(newCardObj.image);
  newCardObj.card.appendChild(newCardObj.name);
  newCardObj.card.appendChild(newCardObj.location);
  newCardObj.card.appendChild(newCardObj.description);
  newCardObj.card.appendChild(newCardObj.editButton);
  newCardObj.card.appendChild(newCardObj.removeButton);

  //Clear Fields
  nameInput.value = "";
  locationInput.value = "";
  descriptionInput.value = "";
  photoURLInput.value = "";

  return newCardObj;
}



function editCard(card, cardData) {

  if (card.editButton.textContent === "Edit") {
    //Save original data
    cardData.name = card.name.textContent;
    cardData.image_src = card.image.src;
    cardData.location = card.location.textContent;
    cardData.description = card.description.textContent;

    //Change button labels
    card.editButton.textContent = "Save";
    card.removeButton.textContent = "Cancel";

    //Make Content Editable
    card.name.contentEditable = true;
    card.location.contentEditable = true;
    card.description.contentEditable = true;

    //Change img object to input object with same dimensions.
    const img = card.image;
    const inputSrc = document.createElement('input');
    inputSrc.type = 'textarea';
    inputSrc.value = img.src;
    inputSrc.style.backgroundImage = 'url("' + img.src + '")';
    inputSrc.style.backgroundSize = 'contain';
    inputSrc.style.width = '100%';
    inputSrc.classList.add('image');
    card.card.replaceChild(inputSrc, img);
    inputSrc.wrap = 'hard';
    card.name.focus();
  } else {
    updateCardOnServer(card, cardData);
    stopEditingCard(card, cardData);
  }
}

function cancelEdit(card, cardData) {
  //Restore any changes
  card.name.textContent = cardData.name;
  // card.inputSrc.textContent = cardData.image_src;
  card.card.querySelector('.image').value = cardData.image_src;
  card.location.textContent = cardData.location;
  card.description.textContent = getSafeDescription(cardData.description);


  stopEditingCard(card, cardData);
}

function stopEditingCard(card, cardData) {
  //change the button labels back to Edit and Remove
  card.editButton.textContent = "Edit";
  card.removeButton.textContent = "Remove";

  //Make the elements uneditable
  card.name.contentEditable = false;
  card.location.contentEditable = false;
  card.description.contentEditable = false;

  //Replace the image
  const input = card.card.querySelector('.image');
  const img = document.createElement('img');

  getValidImgUrl(input.value)
    .then(url => {
      img.src = url;
    })
    .catch(url => {
      img.src = cardData.image_src;
    })

  img.classList.add('image');
  card.card.replaceChild(img, input);
  card.image = img;

  if (card.name.textContent.length < 2) {
    card.name.textContent = cardData.name;
  }
  if (card.location.textContent.length < 2) {
    card.location.textContent = cardData.location;
  }
}

function getCardsFromServer() {
  return new Promise((resolve, reject) => {
    let cards = [];
    fetch('/cards', null)
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log(data);
        for (let i = 0; i < data.length; i++) {
          cards.push(newCardFromServer(data[i]));
        }
        resolve(cards);
      })
      .catch(error => reject(error))
  });


}

function newCardFromServer(cardData) {
  const newCardObj = {
    card: document.createElement('div'),
    image: document.createElement('img'),
    name: document.createElement('h2'),
    location: document.createElement('p'),
    description: document.createElement('p'),
    editButton: document.createElement('button'),
    removeButton: document.createElement('button'),
    id: document.createElement('p')
  };

  //set classes
  let classNames = ['card', 'image', 'destination', 'location', 'description', 'button', 'button'];
  let i = 0;
  for (let element in newCardObj) {
    newCardObj[element].className = classNames[i] + " input";
    i++;
  }

  //set content
  newCardObj.name.textContent = cardData.name;
  newCardObj.location.textContent = cardData.location;
  newCardObj.description.textContent = cardData.description;
  newCardObj.editButton.textContent = 'Edit';
  newCardObj.removeButton.textContent = 'Remove';
  newCardObj.image.src = cardData.photo;
  newCardObj.id.textContent = cardData._id;

  //append children
  newCardObj.card.appendChild(newCardObj.image);
  newCardObj.card.appendChild(newCardObj.name);
  newCardObj.card.appendChild(newCardObj.location);
  newCardObj.card.appendChild(newCardObj.description);
  newCardObj.card.appendChild(newCardObj.editButton);
  newCardObj.card.appendChild(newCardObj.removeButton);

  return newCardObj;
}

function updateCardOnServer(card, cardData) {
  if (card.name.textContent.length < 2 || card.name.textContent.length > 1000) {
    card.name.textContent = cardData.name;
  }
  if (card.location.textContent.length < 2 || card.location.textContent.length > 1000) {
    card.location.textContent = cardData.location;
  }

  const input = card.card.querySelector('.image');
  let image_src;

  getValidImgUrl(input.value)
    .then(url => {
      image_src = url;
    })
    .catch(url => {
      image_src = cardData.image_src;
    })
    .finally(() => {
      const body = {
        name: card.name.textContent,
        id: card.id.textContent,
        location: card.location.textContent,
        description: getSafeDescription(card.description.textContent),
        photo: image_src
      }
      const request = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
      fetch('/cards', request)
      .then(response => {
        if(response.ok) return response.json()
      })
      .then(response => {
        console.log(response);
      })
    })
}

function removeCardFromServer(cardId) {
  console.log(cardId);
  fetch('/cards', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: cardId
    })
  })
  .then(res => {
    if (res.ok) return res.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => console.error(err));
}
