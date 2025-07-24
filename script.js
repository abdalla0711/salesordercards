// --- SCRIPT START ---

// The script is wrapped in DOMContentLoaded to ensure the page is ready.
document.addEventListener('DOMContentLoaded', function() {
    // --- FIX: Make the page visible on load ---
    document.body.style.visibility = 'visible';

    console.log("DOM fully loaded. Initializing script."); // DEBUG

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
    priceSelector.style.display = 'none'; // Droplist is hidden by default

    // --- Create and Add Price Adjustment Buttons ---
    const controlsContainer = filterInput.parentElement; // Assuming filter is in a controls div
    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+ 1%';
    increaseButton.id = 'increasePrice';
    increaseButton.style.marginLeft = '10px';

    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '- 1%';
    decreaseButton.id = 'decreasePrice';

    controlsContainer.appendChild(decreaseButton);
    controlsContainer.appendChild(increaseButton);


    // --- Global State ---
    const products = [];
    let cartTotal = 0;
    let currentLanguage = 'ar'; // Default language
    let englishButtonClickCount = 0; // Counter for English button clicks
    let priceMultiplier = 1.10; // Start with the 10% increase

    // --- Language Switch Listeners ---
    langArButton.addEventListener('click', () => switchLanguage('ar'));
    langEnButton.addEventListener('click', () => {
        englishButtonClickCount++;
        if (englishButtonClickCount >= 5) {
            const password = prompt("Please enter the password to show original prices:");
            if (password === "20202030") {
                priceSelector.style.display = 'block';
                // Disable +/- buttons when original prices are shown
                increaseButton.disabled = true;
                decreaseButton.disabled = true;
                alert("Original prices unlocked!");
            } else {
                alert("Incorrect password.");
            }
            englishButtonClickCount = 0; // Reset counter
        }
        switchLanguage('en');
    });

    // --- Price Multiplier Button Listeners ---
    increaseButton.addEventListener('click', () => {
        priceMultiplier += 0.01;
        updateMultiplierPrices();
    });

    decreaseButton.addEventListener('click', () => {
        // As requested, divide the current price by 1.01
        priceMultiplier = priceMultiplier / 1.01;
        updateMultiplierPrices();
    });


    function switchLanguage(lang) {
        currentLanguage = lang;
        updateProductLanguage();
        updateCartLanguage();
    }

    function getItemName(product) {
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

    // --- This function updates prices based on the +/- multiplier ---
    function updateMultiplierPrices() {
        // This function should NOT run if the original prices are visible
        if (priceSelector.style.display !== 'none') return;

        document.querySelectorAll('.productSquare').forEach(square => {
            const productCode = square.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);
            if (product) {
                const basePrice = parseFloat(product['retail price Q']);
                const newPrice = basePrice * priceMultiplier; // Use the global multiplier

                if (!isNaN(newPrice)) {
                    const eaInCa = parseInt(product['ea in ca']);
                    const priceWithTax = (newPrice * 1.15).toFixed(2);
                    const eaPrice = (newPrice / eaInCa).toFixed(2);
                    const eaWithTax = (newPrice * 1.15 / eaInCa).toFixed(2);

                    const contentDiv = square.querySelector('.card-content');
                    contentDiv.querySelector('p:nth-of-type(2)').textContent = `Ca = ${newPrice.toFixed(2)} SR`;
                    contentDiv.querySelector('p:nth-of-type(3)').textContent = `Ca + tax = ${priceWithTax} SR`;
                    contentDiv.querySelector('p:nth-of-type(4)').textContent = `Bund = ${eaPrice} SR`;
                    contentDiv.querySelector('p:nth-of-type(5)').textContent = `Bund + Tax = ${eaWithTax} SR`;
                }
            }
        });
    }

    function createProductSquare(product) {
        const square = document.createElement('div');
        // ... (setting up square properties)
        square.className = 'productSquare';
        square.dataset.productCode = product['item code'];
        square.dataset.productNameAr = product['item name'] || '';
        square.dataset.productNameEn = product['en_item_name'] || '';

        const image = document.createElement('img');
        image.src = product['image_ulr'] || 'https://via.placeholder.com/300x200.png?text=No+Image';
        square.appendChild(image);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';
        square.appendChild(contentDiv);

        const name = document.createElement('p');
        name.textContent = getItemName(product);
        contentDiv.appendChild(name);

        // Initial price calculation uses the multiplier
        const basePrice = parseFloat(product['retail price Q']);
        const initialPrice = basePrice * priceMultiplier;
        const initialPriceWithTax = initialPrice * 1.15;
        const eaInCa = parseInt(product['ea in ca']);
        const initialEaPrice = initialPrice / eaInCa;
        const initialEaPriceWithTax = initialPriceWithTax / eaInCa;

        const price1 = document.createElement('p');
        price1.textContent = `Ca = ${initialPrice.toFixed(2)} SR`;
        contentDiv.appendChild(price1);
        const price2 = document.createElement('p');
        price2.textContent = `Ca + tax = ${initialPriceWithTax.toFixed(2)} SR`;
        contentDiv.appendChild(price2);
        const price3 = document.createElement('p');
        price3.textContent = `Bund = ${initialEaPrice.toFixed(2)} SR`;
        contentDiv.appendChild(price3);
        const price4 = document.createElement('p');
        price4.textContent = `Bund + Tax = ${initialEaPriceWithTax.toFixed(2)} SR`;
        contentDiv.appendChild(price4);

        square.addEventListener('click', function() {
            const quantity = prompt('Enter the quantity:');
            if (quantity && !isNaN(quantity) && quantity > 0) {
                let priceToUse;
                // Use multiplier price ONLY if original price droplist is hidden
                if (priceSelector.style.display === 'none' || !priceSelector.value) {
                    priceToUse = parseFloat(product['retail price Q']) * priceMultiplier;
                } else {
                    priceToUse = parseFloat(product[priceSelector.value]);
                }

                const itemTotal = priceToUse * quantity;
                const cartItem = document.createElement('div');
                cartItem.className = 'cartItem';
                cartItem.dataset.productCode = product['item code'];
                cartItem.dataset.itemTotal = itemTotal;
                cartItem.innerHTML = `
                    <span class="cartLineNumber"></span>
                    <span>${product['item code']} | </span>
                    <span>${quantity}Ca | </span>
                    <span>${priceToUse.toFixed(2)}SR | </span>
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

    // --- This function updates prices based on the ORIGINAL Excel values ---
    function updateOriginalPrices() {
        const selectedCategory = priceSelector.value;
        if (!selectedCategory) return;

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
        if (!jsonData || jsonData.length === 0) {
            console.error("Excel data is empty or invalid.");
            return;
        }

        const headers = Object.keys(jsonData[0]);
        jsonData.forEach(product => {
            if (product['stock quantity'] !== undefined && Number(product['stock quantity']) === 0) {
                return;
            }
            products.push(product);
            const square = createProductSquare(product);
            productGrid.appendChild(square);
        });

        priceSelector.innerHTML = '';
        headers.forEach(header => {
            if (typeof jsonData[0][header] === 'number' && header !== 'item code' && header !== 'stock quantity' && header !== 'ea in ca') {
                const option = document.createElement('option');
                option.value = header;
                option.textContent = header;
                priceSelector.appendChild(option);
            }
        });

        priceSelector.addEventListener('change', updateOriginalPrices);

        if (!document.getElementById('priceSelector')) {
            document.getElementById('cartContainer').insertBefore(priceSelector, document.getElementById('cartItems'));
        }
    }

    fetch('PRICES.xlsx')
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, {type: 'array'});
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            loadProductsFromExcel(jsonData);
        })
        .catch(err => {
            console.error("Error fetching or processing Excel file:", err);
            alert("لم يتم العثور على ملف الأسعار، اختره يدويًا.");
            fallbackFileInput.style.display = 'block';
            fallbackFileInput.addEventListener('change', function(e) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const workbook = XLSX.read(ev.target.result, {type: 'array'});
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
            alert("تم نسخ محتوى السلة. سيتم الآن فتح واتساب.");
            const phoneNumber = "966550245871";
            const encodedCartText = encodeURIComponent(cartText);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedCartText}`;
            window.open(whatsappUrl, '_blank');
        }).catch(err => {
            console.error('Failed to copy or open WhatsApp: ', err);
            alert("حدث خطأ أثناء النسخ.");
        });
    });

    filterInput.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        document.querySelectorAll('.productSquare').forEach(el => {
            const nameAr = el.dataset.productNameAr.toLowerCase();
            const nameEn = el.dataset.productNameEn.toLowerCase();
            const code = el.dataset.productCode.toLowerCase();
            const isVisible = nameAr.includes(val) || nameEn.includes(val) || code.includes(val);
            el.style.display = isVisible ? 'block' : 'none';
        });
    });
});
// --- SCRIPT END ---
