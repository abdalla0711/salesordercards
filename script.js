// --- SCRIPT START ---

// This function runs immediately to check the password.
(function() {
    // --- Create the dynamic password ---
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const dateString = day + month + hour;
    const correctPassword = dateString.split('').reverse().join('');

    // --- Prompt the user and check the password ---
    const userInput = prompt("Please enter the password:");

    if (userInput === correctPassword) {
        // If correct, make the page visible.
        document.body.style.visibility = 'visible';
    } else {
        // If incorrect, show an alert and do nothing else. The page remains hidden.
        alert("Incorrect password.");
    }
})(); // The () at the end makes this function run automatically.


// The rest of the script is wrapped in DOMContentLoaded to ensure the page is ready.
document.addEventListener('DOMContentLoaded', function() {
    // --- Element Selectors ---
    const productGrid = document.getElementById('productGrid');
    const cartItemsContainer = document.getElementById('cartItems');
    const filterInput = document.getElementById('filterInput');
    const copyButton = document.getElementById('copyButton');
    const fallbackFileInput = document.getElementById('fallbackFileInput');
    const cartCommentInput = document.getElementById('cartComment');
    const langEnButton = document.getElementById('langEn');
    const langArButton = document.getElementById('langAr');
    const priceSelector = document.createElement('select');
    priceSelector.id = 'priceSelector';

    // --- Global State ---
    const products = [];
    let cartTotal = 0;
    let currentLanguage = 'ar'; // Default language

    // --- NEW: Robust Event Listeners for Language Buttons ---
    if (langEnButton && langArButton) {
        langEnButton.addEventListener('click', () => switchLanguage('en'));
        langArButton.addEventListener('click', () => switchLanguage('ar'));
    } else {
        console.error("Language switch buttons not found in HTML. Ensure buttons with id='langEn' and id='langAr' exist.");
    }

    function switchLanguage(lang) {
        currentLanguage = lang;
        updateProductLanguage();
        updateCartLanguage();
    }

    function getItemName(product) {
        // NOTE: Your Excel column must be exactly 'en_item_name' for this to work.
        if (currentLanguage === 'en' && product['en_item_name']) {
            return product['en_item_name'];
        }
        return product['item name'];
    }

    function updateProductLanguage() {
        document.querySelectorAll('.productSquare').forEach(square => {
            const productCode = square.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);
            if (product) {
                square.querySelector('.card-content p:first-of-type').textContent = getItemName(product);
            }
        });
        // Re-apply the current filter to match the new language's names
        filterInput.dispatchEvent(new Event('input'));
    }

    function updateCartLanguage() {
        document.querySelectorAll('.cartItem').forEach(cartItem => {
            const productCode = cartItem.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);
            if (product) {
                cartItem.querySelector('.itemName').textContent = getItemName(product);
            }
        });
    }

    function createProductSquare(product) {
        const square = document.createElement('div');
        square.className = 'productSquare';
        square.dataset.productCode = product['item code'];
        square.dataset.productName = product['item name'] || ''; // Arabic name
        square.dataset.productNameEn = product['en_item_name'] || ''; // English name

        const image = document.createElement('img');
        image.src = product['image_ulr'] || 'https://via.placeholder.com/300x200.png?text=No+Image';
        square.appendChild(image);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';

        const name = document.createElement('p');
        name.textContent = getItemName(product);
        contentDiv.appendChild(name);

        const price1 = document.createElement('p');
        price1.textContent = `Ca = $${product['retail price Q']}`;
        contentDiv.appendChild(price1);

        const price2 = document.createElement('p');
        const cartoonPriceWithTax = parseFloat(product['retail price Q']) * 1.15;
        price2.textContent = `Ca + tax = $${cartoonPriceWithTax.toFixed(2)}`;
        contentDiv.appendChild(price2);

        const price3 = document.createElement('p');
        const eaPrice = parseFloat(product['retail price Q']) / parseInt(product['ea in ca']);
        price3.textContent = `Bund = $${eaPrice.toFixed(2)}`;
        contentDiv.appendChild(price3);

        const price4 = document.createElement('p');
        const eaPriceWithTax = cartoonPriceWithTax / parseInt(product['ea in ca']);
        price4.textContent = `Bund + Tax = $${eaPriceWithTax.toFixed(2)}`;
        contentDiv.appendChild(price4);

        square.appendChild(contentDiv);

        square.addEventListener('click', function() {
            const quantity = prompt('Enter the quantity:');
            if (quantity && !isNaN(quantity) && quantity > 0) {
                const itemTotal = parseFloat(product[priceSelector.value]) * quantity;

                const cartItem = document.createElement('div');
                cartItem.className = 'cartItem';
                cartItem.dataset.productCode = product['item code'];
                cartItem.dataset.itemTotal = itemTotal;

                cartItem.innerHTML = `
                    <span class="cartLineNumber"></span>
                    <span>${product['item code']} | </span>
                    <span>${quantity}Ca | </span>
                    <span>${parseFloat(product[priceSelector.value]).toFixed(2)}SR | </span>
                    <span class="itemName">${getItemName(product)}</span>
                    <button class="delete-btn">Delete</button>
                `;
                cartItemsContainer.appendChild(cartItem);

                cartItem.querySelector('.delete-btn').addEventListener('click', function() {
                    cartTotal -= parseFloat(cartItem.dataset.itemTotal);
                    cartItem.remove();
                    updateCartTotal();
                    renumberCartItems();
                });

                cartTotal += itemTotal;
                updateCartTotal();
                renumberCartItems();
            }
        });

        return square;
    }

    function renumberCartItems() {
        const items = cartItemsContainer.getElementsByClassName('cartItem');
        for (let i = 0; i < items.length; i++) {
            items[i].querySelector('.cartLineNumber').textContent = `${i + 1}. `;
        }
    }

    function updatePrices() {
        const selectedCategory = priceSelector.value;
        document.querySelectorAll('.productSquare').forEach(square => {
            const productCode = square.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);

            if (product) {
                const price = parseFloat(product[selectedCategory]);
                if (!isNaN(price)) {
                    const eaInCa = parseInt(product['ea in ca']);
                    const priceWithTax = (price * 1.15).toFixed(2);
                    const eaPrice = (price / eaInCa).toFixed(2);
                    const eaWithTax = (price * 1.15 / eaInCa).toFixed(2);

                    const contentDiv = square.querySelector('.card-content');
                    contentDiv.querySelector('p:nth-of-type(2)').textContent = `Ca = ${price.toFixed(2)} SR`;
                    contentDiv.querySelector('p:nth-of-type(3)').textContent = `Ca + tax = ${priceWithTax} SR`;
                    contentDiv.querySelector('p:nth-of-type(4)').textContent = `Bund = ${eaPrice} SR`;
                    contentDiv.querySelector('p:nth-of-type(5)').textContent = `Bund + Tax = ${eaWithTax} SR`;
                }
            }
        });
    }

    function updateCartTotal() {
        const cartTotalElement = document.getElementById('cartTotal');
        const cartTotalWithTax = cartTotal * 1.15;
        cartTotalElement.textContent = `Total with tax: ${cartTotalWithTax.toFixed(2)} SR`;
        copyButton.style.display = cartTotal > 0 ? 'block' : 'none';
    }

    function loadProductsFromExcel(jsonData) {
        productGrid.innerHTML = '';
        products.length = 0;

        const headers = Object.keys(jsonData[0]);
        jsonData.forEach(product => {
            if (product['stock quantity'] !== undefined && Number(product['stock quantity']) === 0) {
                return; // Hide row if stock quantity is 0
            }
            products.push(product);
            const square = createProductSquare(product);
            productGrid.appendChild(square);
        });

        priceSelector.innerHTML = '';
        for (let i = 1; i <= 8 && i < headers.length; i++) {
            const header = headers[i];
            if (typeof jsonData[0][header] === 'number') {
                const option = document.createElement('option');
                option.value = header;
                option.textContent = header;
                priceSelector.appendChild(option);
            }
        }

        priceSelector.addEventListener('change', function() {
            updatePrices();
            this.style.display = 'none';
        });

        if (!document.getElementById('priceSelector')) {
            document.getElementById('cartContainer').insertBefore(priceSelector, document.getElementById('cartItems'));
        }
        updatePrices();
    }

    fetch('PRICES.xlsx')
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            loadProductsFromExcel(jsonData);
        })
        .catch(err => {
            alert("لم يتم العثور على ملف الأسعار، اختره يدويًا.");
            fallbackFileInput.style.display = 'block';
            fallbackFileInput.addEventListener('change', function(e) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const workbook = XLSX.read(ev.target.result, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    loadProductsFromExcel(jsonData);
                    fallbackFileInput.style.display = 'none';
                };
                reader.readAsArrayBuffer(e.target.files[0]);
            });
        });

    copyButton.addEventListener('click', function() {
        let cartText = '';
        document.querySelectorAll('.cartItem').forEach(item => {
            const tempItem = item.cloneNode(true);
            tempItem.querySelector('.delete-btn').remove();
            cartText += tempItem.innerText.replace(/\s+/g, ' ').trim() + '\n';
        });

        cartText += '\n' + document.getElementById('cartTotal').textContent;

        const comment = cartCommentInput.value.trim();
        if (comment) {
            cartText += '\n\nComments:\n' + comment;
        }

        navigator.clipboard.writeText(cartText).then(() => {
            alert("تم نسخ محتوى السلة.");
        });
    });

    filterInput.addEventListener('input', function() {
        const val = filterInput.value.toLowerCase();
        document.querySelectorAll('.productSquare').forEach(el => {
            const name = el.dataset.productName.toLowerCase();
            const nameEn = el.dataset.productNameEn.toLowerCase();
            const code = el.dataset.productCode.toLowerCase();
            
            // Search will work across Arabic name, English name, and item code
            const isVisible = name.includes(val) || nameEn.includes(val) || code.includes(val);
            el.style.display = isVisible ? 'block' : 'none';
        });
    });
});
// --- SCRIPT END ---
