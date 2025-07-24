// --- SCRIPT START ---

// The rest of the script is wrapped in DOMContentLoaded to ensure the page is ready.
document.addEventListener('DOMContentLoaded', function() {
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

    // --- Global State ---
    const products = [];
    let cartTotal = 0;
    let currentLanguage = 'ar'; // Default language
    let englishButtonClickCount = 0; // Counter for English button clicks

    // --- DEBUG: Check if buttons are found ---
    if (!langEnButton) {
        console.error("English language button with id='langEn' was NOT found!");
    }
    if (!langArButton) {
        console.error("Arabic language button with id='langAr' was NOT found!");
    }

    // --- Language Switch Listeners ---
    langArButton.addEventListener('click', () => {
        console.log("Arabic button clicked."); // DEBUG
        switchLanguage('ar');
    });

    langEnButton.addEventListener('click', () => {
        console.log("English button clicked."); // DEBUG
        englishButtonClickCount++;
        if (englishButtonClickCount === 5) {
            const password = prompt("Please enter the password to show original prices:");
            if (password === "20202030") {
                priceSelector.style.display = 'block';
                alert("Original prices unlocked!");
            } else {
                alert("Incorrect password.");
            }
            englishButtonClickCount = 0; // Reset counter
        }
        switchLanguage('en');
    });


    function switchLanguage(lang) {
        console.log(`Attempting to switch language to: ${lang}`); // DEBUG
        currentLanguage = lang;
        updateProductLanguage();
        updateCartLanguage();
        console.log(`Language switch to '${lang}' complete.`); // DEBUG
    }

    function getItemName(product) {
        if (currentLanguage === 'en') {
            const enName = product['en_item_name'];
            if (enName) {
                return enName;
            }
        }
        return product['item name'];
    }

    function updateProductLanguage() {
        console.log("Updating product grid language..."); // DEBUG
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
        console.log("Updating cart language..."); // DEBUG
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
        square.dataset.productNameAr = product['item name'] || '';
        square.dataset.productNameEn = product['en_item_name'] || '';

        const image = document.createElement('img');
        image.src = product['image_ulr'] || 'https://via.placeholder.com/300x200.png?text=No+Image';
        square.appendChild(image);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';

        const name = document.createElement('p');
        name.textContent = getItemName(product);
        contentDiv.appendChild(name);

        const basePrice = parseFloat(product['retail price Q']);
        const initialPrice = basePrice * 1.10; // Add 10% to the initial price
        const initialPriceWithTax = initialPrice * 1.15;
        const eaInCa = parseInt(product['ea in ca']);
        const initialEaPrice = initialPrice / eaInCa;
        const initialEaPriceWithTax = initialPriceWithTax / eaInCa;


        const price1 = document.createElement('p');
        price1.textContent = `Ca = $${initialPrice.toFixed(2)}`;
        contentDiv.appendChild(price1);

        const price2 = document.createElement('p');
        price2.textContent = `Ca + tax = $${initialPriceWithTax.toFixed(2)}`;
        contentDiv.appendChild(price2);

        const price3 = document.createElement('p');
        price3.textContent = `Bund = $${initialEaPrice.toFixed(2)}`;
        contentDiv.appendChild(price3);

        const price4 = document.createElement('p');
        price4.textContent = `Bund + Tax = $${initialEaPriceWithTax.toFixed(2)}`;
        contentDiv.appendChild(price4);

        square.appendChild(contentDiv);

        square.addEventListener('click', function() {
            const quantity = prompt('Enter the quantity:');
            if (quantity && !isNaN(quantity) && quantity > 0) {
                // Determine the price to use: initial 10% markup or selected from droplist
                let priceToUse;
                if (priceSelector.style.display === 'none') {
                    priceToUse = parseFloat(product['retail price Q']) * 1.10;
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
        console.log("Loading products from Excel data..."); // DEBUG
        productGrid.innerHTML = '';
        products.length = 0;
        if (!jsonData || jsonData.length === 0) {
            console.error("Excel data is empty or invalid.");
            return;
        }

        const headers = Object.keys(jsonData[0]);
        console.log("Excel Headers Found:", headers);
        if (!headers.includes('en_item_name')) {
            console.warn("WARNING: The column 'en_item_name' was not found in the Excel file. English translation will not work.");
        }

        jsonData.forEach(product => {
            if (product['stock quantity'] !== undefined && Number(product['stock quantity']) === 0) {
                return;
            }
            products.push(product);
            const square = createProductSquare(product);
            productGrid.appendChild(square);
        });

        priceSelector.innerHTML = '';
        for (let i = 1; i < headers.length; i++) {
            const header = headers[i];
             // Simple check if the header name suggests it's a price column
            if (header.toLowerCase().includes('price')) {
                const option = document.createElement('option');
                option.value = header;
                option.textContent = header;
                priceSelector.appendChild(option);
            }
        }

        priceSelector.addEventListener('change', updatePrices);


        if (!document.getElementById('priceSelector')) {
            document.getElementById('cartContainer').insertBefore(priceSelector, document.getElementById('cartItems'));
        }
        // No initial call to updatePrices(), so the 10% markup remains
    }

    fetch('PRICES.xlsx')
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            console.log("PRICES.xlsx fetched successfully."); // DEBUG
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            loadProductsFromExcel(jsonData);
        })
        .catch(err => {
            console.error("Error fetching or processing Excel file:", err); // DEBUG
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

        // Copy to clipboard
        navigator.clipboard.writeText(cartText).then(() => {
            alert("تم نسخ محتوى السلة. سيتم الآن فتح واتساب.");

            // Open WhatsApp
            const phoneNumber = "966550245871";
            const encodedCartText = encodeURIComponent(cartText);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedCartText}`;
            window.open(whatsappUrl, '_blank');
        }).catch(err => {
            console.error('Failed to copy cart: ', err);
            alert("حدث خطأ أثناء نسخ السلة.");
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
