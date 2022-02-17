function refreshPrice(price) {
  const tag = document.querySelector('.total-price');
  tag.innerHTML = price;
}

function sumPrice() {
  let totalPrice = 0;
  if (localStorage.getItem('products') != null) {
    const lsProducts = JSON.parse(localStorage.getItem('products'));

    lsProducts.forEach((item) => {
      const [salePrice] = [item.salePrice];
      totalPrice += salePrice;
    });
  }
  refreshPrice(totalPrice);
}

async function removeCartItem(skuDelete) {
  const listItem = document.querySelectorAll('.cart__item');
  listItem.forEach((item, index) => {
    if (item.innerText.includes(skuDelete)) {
      listItem[index].remove();
    }
  });
}

async function cartItemClickListener(event) {
  const product = event.srcElement.innerText;
  const sku = product.split(' ', 2)[1];
  
  if (localStorage.getItem('products') != null) {
    const lsProducts = JSON.parse(localStorage.getItem('products'));

    lsProducts.forEach((item, index) => {
      if (item.sku === sku) {
        lsProducts.splice(index, 1);
        removeCartItem(sku);
      }
    });
    localStorage.setItem('products', JSON.stringify(lsProducts));
    sumPrice();
  }
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function verifyLocalStorage() {
  if (localStorage.getItem('products') != null) {
    const lsProducts = JSON.parse(localStorage.getItem('products'));

    lsProducts.forEach((itemStorage) => {
      const [sku, name, salePrice] = [itemStorage.sku, itemStorage.name, itemStorage.salePrice];
      const item = document.querySelector('ol');
      const newItem = createCartItemElement({ sku, name, salePrice });
      item.appendChild(newItem);
    });
  }
  sumPrice();
}

function localStorageManage({ sku, name, salePrice }) {
  const lsProducts = JSON.parse(localStorage.getItem('products')) || [];
  const product = {
    sku,
    name,
    salePrice,
  };
  lsProducts.push(product);
  localStorage.setItem('products', JSON.stringify(lsProducts));
  sumPrice();
}

function createLoad() {
  const divLoad = document.createElement('div');
  divLoad.className = 'loading';
  divLoad.innerHTML = 'loading...';
  document.body.appendChild(divLoad);
}

function removeLoad() {
  const divLoad = document.getElementsByClassName('loading');
  divLoad[0].remove();
}

async function apiAccess(urlAPI, search) {
  await createLoad();
  const result = await fetch(`${urlAPI}${search}`);
  const resultJson = await result.json();
  await removeLoad();
  return resultJson;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function removeAllItensCart() {
  const elements = document.getElementsByClassName('cart__item');
  while (elements.length > 0) elements[0].remove();
}

async function addProductItem(search) {
  const urlAPI = 'https://api.mercadolibre.com/items/';
  const resultJson = await apiAccess(urlAPI, search);
  const [sku, name, salePrice] = [resultJson.id, resultJson.title, resultJson.price];
  const item = document.querySelector('ol');
  const newItem = createCartItemElement({ sku, name, salePrice });
  item.appendChild(newItem);
  localStorageManage({ sku, name, salePrice });
}

function createCustomBtnElement(element, className, innerText, itemID) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  e.addEventListener('click', addProductItem.bind(null, itemID));
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomBtnElement('button', 'item__add', 'Adicionar ao carrinho!', sku));

  return section;
}

async function insertItems(resultJson) {
  const items = document.querySelector('.items');

  resultJson.results.forEach((item) => {
    const [sku, name, image] = [item.id, item.title, item.thumbnail];
    const sectionNew = (createProductItemElement({ sku, name, image }));
    items.appendChild(sectionNew);
  });
}

async function removeAllItems() {
  if (localStorage.getItem('products') != null) {
    await removeAllItensCart();
    localStorage.removeItem('products');
    verifyLocalStorage();
  }
}

async function configRemoveAllItems() {
  const buttonRemove = document.querySelector('.empty-cart');
  buttonRemove.onclick = removeAllItems;
}

async function load() {
  const search = 'Computador';
  const urlAPI = 'https://api.mercadolibre.com/sites/MLB/search?q=';
  const resultJson = await apiAccess(urlAPI, search);
  configRemoveAllItems();
  insertItems(resultJson);
  verifyLocalStorage();
}

window.onload = () => { 
  load(); 
};
