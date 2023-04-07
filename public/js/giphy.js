export function getGif(searchTerm) {
    return new Promise((resolve, reject) => {
      searchTerm = searchTerm.split(' ').join('+');
      let apiKey = 'PNux4jmzhaVkIycLY40HzFps3jxMwurF';
      let rand = Math.floor(Math.random() * 20);
      let request = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&limit=20&q=${searchTerm}`;

      fetch(request)
        .then(response => response.json())
        .then(content => {
          // data, pagination, meta
          let url = content.data[rand].images.downsized.url;
          resolve(url);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }

  export function getUnSplash(searchTerm) {
    return new Promise((resolve, reject) => {
        searchTerm = searchTerm.split(' ').join('+');
        let apiKey = 'sEQHkp4XPTHdcX_r4p87VptwcSIMJOx7QjxRNkXV81M';
        // https://api.unsplash.com/search/photos?client_id=sEQHkp4XPTHdcX_r4p87VptwcSIMJOx7QjxRNkXV81M&orientation=landscape&query=forest
        let request = `https://api.unsplash.com/search/photos?client_id=${apiKey}&orientation=landscape&query=${searchTerm}&`;

        fetch(request)
        .then(response => response.json())
        .then(content => {
            console.log(content.results);
            let rand = Math.floor(Math.random() * content.results.length);
            let url = content.results[rand].urls.small;
            console.log(url);
            resolve(url);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        })
    })
  }
