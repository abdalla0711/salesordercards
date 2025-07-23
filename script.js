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
        document.body.style.visibility = 'visible';
    } else {
        alert("Incorrect password.");
    }
})();

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

    // --- Language Switch Listeners ---
    langArButton.addEventListener('click', () => switchLanguage('ar'));
    langEnButton.addEventListener('click', () => switchLanguage('en'));

    function switchLanguage(lang) {
        currentLanguage = lang;
        updateProductLanguage();
        updateCartLanguage();
    }

    function getItemName(product) {
        // This function decides which name to show based on the currentLanguage.
        // It requires a column named 'en_item_name' in your Excel file.
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
                // Update the visible name on the product card
                square.querySelector('.card-content p:first-of-type').textContent = getItemName(product);
            }
        });
        // Trigger the input event to re-filter the list with the new language names
        filterInput.dispatchEvent(new Event('input'));
    }

    function updateCartLanguage() {
        document.querySelectorAll('.cartItem').forEach(cartItem => {
            const productCode = cartItem.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);
            if (product) {
                // Update the visible name in the cart
                cartItem.querySelector('.itemName').textContent = getItemName(product);
            }
        });
    }

    function createProductSquare(product) {
        const square = document.createElement('div');
        square.className = 'productSquare';
        // Store all necessary data on the element for easy access
        square.dataset.productCode = product['item code'];
        square.dataset.productNameAr = product['item name'] || ''; // Arabic name
        square.dataset.productNameEn = product['en_item_name'] || ''; // English name

        const image = document.createElement('img');
        image.src = product['image_ulr'] || 'https://via.placeholder.com/300x200.png?text=No+Image';
        square.appendChild(image);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';

        const name = document.createElement('p');
        name.textContent = getItemName(product);
        contentDiv.appendChild(name);

        // ... (rest of the price paragraphs are unchanged)
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
                    <button class="delete-btn">X</button>
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

        // Ensure we have data and headers
        if (!jsonData || jsonData.length === 0) {
            console.error("Excel data is empty or could not be read.");
            return;
        }
        const headers = Object.keys(jsonData[0]);

        jsonData.forEach(product => {
            // Filter out rows where 'stock quantity' is 0
            if (product['stock quantity'] !== undefined && Number(product['stock quantity']) === 0) {
                return; // Skip this product
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
        const val = this.value.toLowerCase();
        document.querySelectorAll('.productSquare').forEach(el => {
            // Get both language names from the data attributes
            const nameAr = el.dataset.productNameAr.toLowerCase();
            const nameEn = el.dataset.productNameEn.toLowerCase();
            const code = el.dataset.productCode.toLowerCase();
            
            // Show if filter value matches Arabic name, English name, or item code
            const isVisible = nameAr.includes(val) || nameEn.includes(val) || code.includes(val);
            el.style.display = isVisible ? 'block' : 'none';
        });
    });
});
// --- SCRIPT END ---
