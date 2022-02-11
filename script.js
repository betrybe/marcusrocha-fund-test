async function load(){
  
  const input_search = "Computador";
  const urlApiML = `https://api.mercadolibre.com/sites/MLB/search?q=${input_search}`;

  const search = await fetch(urlApiML);
  const resultJson = await search.json();

  insertItems(resultJson);
} 
  
function insertItems(resultJson) {
  
  var items = document.querySelector('.items')
  
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
  e.addEventListener("click",cartItemClickListener.bind(null, itemID));
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

function cartItemClickListener(event) {
  //const a = getSkuFromProductItem(event);

  const urlApiItem = `https://api.mercadolibre.com/items/${event}`;
  console.log(urlApiItem);
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

window.onload = () => { load() };
