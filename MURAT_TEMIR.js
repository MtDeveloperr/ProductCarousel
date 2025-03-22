(() => {
  const loadJQueryAndRun = () => {
    // this function loads jQuery from CDN and then runs the main function
    const script = document.createElement("script");
    script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
    script.onload = main;
    document.head.appendChild(script);
  };

  const main = () => {
    // this function is the main function that contains the carousel logic
    if ($(".product-detail").length === 0) {
      console.warn("Bro, there is no product detail.");
      return;
    }

    const cachedProductITems = "productCarouselData";
    const likedProductItems = "productFavorites";

    // this function gets the product list from localStorage or from the URL. First checks localStorage then URL
    const getProductList = () => {
      return new Promise((resolve, reject) => {
        let storedProducts = localStorage.getItem(cachedProductITems);
        if (storedProducts) {
          try {
            let products = JSON.parse(storedProducts);
            resolve(products);
            return;
          } catch (e) {
            console.error("Couldn't parse the products in localStorage:", e);
          }
        }

        $.getJSON(
          "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json"
        )
          .done((products) => {
            localStorage.setItem(cachedProductITems, JSON.stringify(products));
            resolve(products);
          })
          .fail((err) => {
            console.error("Couldn't get products:", err);
            reject(err);
          });
      });
    };

    // this function gets the favorite products from localStorage or an empty array
    const getFavorites = () => {
      let favStr = localStorage.getItem(likedProductItems);
      if (favStr) {
        try {
          return JSON.parse(favStr);
        } catch (e) {
          console.error("Couldn't get favourites:", e);
        }
      }
      return [];
    };

    // this function saves the favorite products to localStorage
    const saveFavorites = (favorites) => {
      localStorage.setItem(likedProductItems, JSON.stringify(favorites));
    };

    // this function toggles the favorite status of a product
    const toggleFavorite = (productId, $heart) => {
      let favorites = getFavorites();
      if (favorites.indexOf(productId) !== -1) {
        favorites = favorites.filter((id) => id !== productId);
        $heart.removeClass("liked");
      } else {
        favorites.push(productId);
        $heart.addClass("liked");
      }
      saveFavorites(favorites);
    };

    // here is the main html of the product carousel
    const buildHTML = (products) => {
      let favorites = getFavorites();
      let html = `<div class="product-carousel-container">
                          <div class="product-carousel-title">You Might Also Like</div>
                          <div class="carousel-wrapper">
                            <button class="carousel-arrow left-arrow">&lt;</button>
                            <div class="product-carousel-items">`;
      products.forEach((product) => {
        html += `
                              <div class="product-carousel-item" data-url="${
                                product.url
                              }" data-id="${product.id}">
                                  <img src="${product.img}" alt="${
          product.name || "Product Image"
        }">
                                  <div class="product-name">${
                                    product.name || "Unnamed Product"
                                  }</div>
                                  <div class="product-price">${
                                    product.price + " TRY" || "00.0 TRY"
                                  }</div>
                                  <span class="heart-icon ${
                                    favorites.indexOf(product.id) !== -1
                                      ? "liked"
                                      : ""
                                  }">♥</span>
                              </div>`;
      });
      html += ` </div>
                      <button class="carousel-arrow right-arrow">&gt;</button>
                  </div>
              </div>`;
      $(".product-detail").append(html);
    };

    // here is the css of the product carousel
    const buildCSS = () => {
      const css = `
                      .product-carousel-container {
                          margin: 20px 0;
                          overflow: hidden;
                      }
                      .product-carousel-title {
                          font-family: 'Arial';
                          font-size: clamp(1rem, 2.5vw, 3.5rem);
                          margin-bottom: 10px;
                          font-weight: bold;
                          margin-left: 10px;
                          text-align: left;
                          color:black;
                      }
                      .carousel-wrapper {
                          position: relative;
                      }
                      .product-carousel-items {
                          display: flex;
                          overflow: hidden; 
                          gap: 10px;
                      }
                      .product-carousel-item {
                          max-width: calc(20%);
                          min-width: 120px;
                          border: 1px solid #ccc;
                          border-radius: 8px;
                          background: #fff;
                          flex-shrink: 0;
                          position: relative;
                          cursor: pointer;
                      }
                      .product-carousel-item img {
                          width: 100%;
                          height: auto;
                          object-fit: cover;
                          border-radius: 8px 8px 0 0;
                      }
                      .product-carousel-item .product-name {
                          margin: 10px;
                          min-height: calc(5rem);
                          white-space: normal;
                          font-family: 'Calibri';
                          font-size: clamp(0.8rem, 1vw, 2rem);
                          color: black;
                      }
                      .product-carousel-item .product-price {
                          margin: 5px;
                          color: blue;
                          font-family: 'Arial';
                          font-size: clamp(0.8rem, 1.3vw, 2rem);
                      }
                      .heart-icon {
                          position: absolute;
                          top: 8px;
                          right: 8px;
                          font-size: clamp(1rem, 2vw, 2.5rem);
                          cursor: pointer;
                          color: #ccc;
                          transition: color 0.3s;
                          font-family: 'Arial';
                      }
                      .heart-icon.liked {
                          color: blue;
                      }
                      .carousel-arrow {
                          position: absolute;
                          top: 50%;
                          transform: translateY(-50%);
                          background: rgba(0, 0, 0, 0.5);
                          color: #fff;
                          border: none;
                          padding: 10px;
                          cursor: pointer;
                          z-index: 2;
                      }
                      .left-arrow {
                          left: 0;
                      }
                      .right-arrow {
                          right: 0;
                      }        
                  `;
      $("<style>").addClass("carousel-style").html(css).appendTo("head");
    };

    // this function sets the events of the carousel
    const setEvents = () => {
      // this function routes the user to the product page when clicked on a product
      $(".product-detail").on("click", ".product-carousel-item", function (e) {
        if ($(e.target).hasClass("heart-icon")) return;
        const url = $(this).data("url");
        window.open(url, "_blank");
      });

      // this function toggles like of a product when clicked on the heart icon
      $(".product-detail").on("click", ".heart-icon", function (e) {
        e.stopPropagation();
        const $heart = $(this);
        const productId = $(this).closest(".product-carousel-item").data("id");
        toggleFavorite(productId, $heart);
      });

      // left button of the carousel that scrolls the carousel to left
      $(".carousel-arrow.left-arrow").on("click", function () {
        $(".product-carousel-items").animate(
          {
            scrollLeft: "-=200",
          },
          300
        );
      });

      // right button of the carousel that scrolls the carousel to right
      $(".carousel-arrow.right-arrow").on("click", function () {
        $(".product-carousel-items").animate(
          {
            scrollLeft: "+=200",
          },
          300
        );
      });
    };

    // this is the main function that runs the carousel
    const init = () => {
      buildCSS();
      getProductList()
        .then((products) => {
          buildHTML(products);
          setEvents();
        })
        .catch((err) => console.error(err));
    };

    init();
  };

  // checking if jQuery is already loaded
  if (typeof window.jQuery === "undefined") {
    loadJQueryAndRun();
  } else {
    main();
  }
})();
