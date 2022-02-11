var OP = {
  ADD: 1,
  LESS: 2
}


async function load(){
  
  const search = "Computador";
  const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=`;

  const resultJson = await apiAccess(urlAPI, search);

  insertItems(resultJson);
} 

async function apiAccess(urlAPI, search){
  const result = await fetch(`${urlAPI}${search}`);
  return await result.json();
}
  
function insertItems(resultJson) {
  
  var items = document.querySelector('.items');
  
  for (let index = 0; index < resultJson.results.length; index++) {

    const sku = resultJson.results[index].id;
    const name = resultJson.results[index].title;
    const image = resultJson.results[index].thumbnail;
    
    var sectionNew = (createProductItemElement({ sku, name, image }));

    items.appendChild(sectionNew);
  }
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createCustomButtonElement(element, className, innerText, itemID) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  e.addEventListener("click",addProductItem.bind(null, itemID));
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomButtonElement('button', 'item__add', 'Adicionar ao carrinho!', sku));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

async function addProductItem(search){
  const op = OP.ADD;
  const urlAPI = "https://api.mercadolibre.com/items/";
  
  const resultJson = await apiAccess(urlAPI, search);

  const sku = resultJson.id;
  const name = resultJson.title;
  const salePrice = resultJson.price;

  var item = document.querySelector('ol');

  var newItem = createCartItemElement({ sku, name, salePrice });

  item.appendChild(newItem);

  totalPrice(salePrice, op);
  localStorageManage({ sku, name, salePrice }, op);
}
 
function totalPrice(salePrice, op) {

  var tag = document.querySelector('.total-price');
  const value = Number(tag.innerHTML);
  var newValue = 0;

  if(op==OP.ADD) {
    newValue = value + salePrice;
  } else if (op==OP.LESS) {
    newValue = value - salePrice;
  }

  tag.innerHTML=newValue;
}

function localStorageManage({ sku, name, salePrice }, op) {

  let lsProducts = JSON.parse(localStorage.getItem('products')) || [];

  const product = {
    'sku': sku,
    'name': name,
    'salePrice': salePrice
  }

  lsProducts.push(product);
  
  localStorage.setItem('products', JSON.stringify(lsProducts));

}

function cartItemClickListener(event) {

  const op = OP.LESS;
  const product = event.srcElement.innerText;
  var salePrice = Number(product.split("$",2)[1]);
  
  totalPrice(salePrice, op);
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

window.onload = () => { load() };
