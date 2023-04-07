
export function getValidImgUrl(inputUrl) {

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = inputUrl;

      img.onload = () => {
        resolve(img.src);
      };

      img.onerror = () => {
        reject();
      };
    });
}


export function validateName() {
    const name = document.getElementById("name").value;
    const errorSpan = document.getElementById("name-error");
    if (name.length < 2) {
      errorSpan.textContent = "Name must be at least 2 characters.";
      return false;
    } else if (name.length > 1000) {
      errorSpan.textContent = "Name must be less than 1000 characters.";
      return false;
    } else {
      errorSpan.textContent = "";
    }
    return true;
  }

  export function validateLocation() {
    const location = document.getElementById("location").value;
    const errorSpan = document.getElementById("location-error");
    if (location.length < 2) {
      errorSpan.textContent = "Location must be at least 2 characters.";
      return false;
    } else if (name.length > 1000) {
      errorSpan.textContent = "Location must be less than 1000 characters.";
      return false;
    } else {
      errorSpan.textContent = "";
    }
    return true;
  }

  export function getSafeDescription(description) {
    return description.trim().substring(0, 1000);
  }
