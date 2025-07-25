// --- SCRIPT START ---

// The script is wrapped in DOMContentLoaded to ensure the page is ready.
document.addEventListener('DOMContentLoaded', function() {
    // --- FIX: Make the page visible on load ---
    document.body.style.visibility = 'visible';

    console.log("DOM fully loaded. Initializing script.");

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
    priceSelector.style.display = 'none';

    // --- Create and Add Price Adjustment Controls ---
    const controlsContainer = filterInput.parentElement;
    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.id = 'increasePrice';
    increaseButton.style.marginLeft = '10px';
    increaseButton.title = "Increase prices by 5%";

    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '-';
    decreaseButton.id = 'decreasePrice';
    decreaseButton.title = "Decrease prices by 5%";

    const percentageDisplay = document.createElement('span');
    percentageDisplay.id = 'percentageDisplay';
    percentageDisplay.style.margin = '0 10px';
    percentageDisplay.style.fontWeight = 'bold';

    controlsContainer.appendChild(decreaseButton);
    controlsContainer.appendChild(percentageDisplay);
    controlsContainer.appendChild(increaseButton);

    // --- Global State ---
    const products = [];
    let cartTotal = 0;
    let currentLanguage = 'ar';
    let englishButtonClickCount = 0;
    let priceMultiplier = 1.10; // For calculation, starts at +10%
    let displayPercentage = 10; // For display, starts at +10%

    // --- Update the Percentage Display ---
    function updatePercentageDisplay() {
        let prefix = displayPercentage > 0 ? '+' : '';
        percentageDisplay.textContent = `${prefix}${displayPercentage.toFixed(0)}%`;
    }

    // --- Language Switch Listeners ---
    langArButton.addEventListener('click', () => switchLanguage('ar'));
    langEnButton.addEventListener('click', () => {
        englishButtonClickCount++;
        if (englishButtonClickCount >= 5) {
            const password = prompt("Please enter the password to show original prices:");
            if (password === "20202030") {
                priceSelector.style.display = 'block';
                // --- EDIT: Enable the +/- buttons and percentage display ---
                increaseButton.disabled = false;
                decreaseButton.disabled = false;
                percentageDisplay.style.display = 'inline-block'; // Show percentage
                updateOriginalPrices(); // Update prices immediately based on the current multiplier
                alert("Original prices unlocked!");
            } else {
                alert("Incorrect password.");
            }
            englishButtonClickCount = 0;
        }
        switchLanguage('en');
    });

    // --- Price Multiplier Button Listeners ---
    increaseButton.addEventListener('click', () => {
        if (priceMultiplier >= 2.0) { // Safety limit: max 100% increase
            alert("Maximum price increase limit reached.");
            return;
        }
        priceMultiplier += 0.05;
        displayPercentage += 5;
        updateMultiplierPrices();
        updatePercentageDisplay();
    });

    decreaseButton.addEventListener('click', () => {
        if (priceMultiplier <= 0.5) { // Safety limit: max 50% decrease
            alert("Minimum price limit reached.");
            return;
        }
        priceMultiplier -= 0.05;
        displayPercentage -= 5;
        updateMultiplierPrices();
        updatePercentageDisplay();
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

    /**
     * --- MODIFIED FUNCTION ---
     * This function now updates prices based on the selected price category
     * if the original prices are unlocked.
     */
    function updateMultiplierPrices() {
        document.querySelectorAll('.productSquare').forEach(square => {
            const productCode = square.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);
            if (product) {
                let basePrice;
                // Check if the price selector is visible and has a value
                if (priceSelector.style.display !== 'none' && priceSelector.value) {
                    basePrice = parseFloat(product[priceSelector.value]);
                } else {
                    basePrice = parseFloat(product['retail price Q']);
                }

                if (!isNaN(basePrice)) {
                    const newPrice = basePrice * priceMultiplier;
                    updateProductCardPrices(square, newPrice, product['ea in ca']);
                }
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
        square.appendChild(contentDiv);

        const name = document.createElement('p');
        name.textContent = getItemName(product);
        contentDiv.appendChild(name);

        for (let i = 0; i < 4; i++) {
            contentDiv.appendChild(document.createElement('p'));
        }

        const basePrice = parseFloat(product['retail price Q']);
        const initialPrice = basePrice * priceMultiplier;
        updateProductCardPrices(square, initialPrice, product['ea in ca']);

        square.addEventListener('click', function() {
            const quantity = prompt('Enter the quantity:');
            if (quantity && !isNaN(quantity) && quantity > 0) {
                let priceToUse;
                // Determine the base price from the correct source
                let basePrice;
                if (priceSelector.style.display !== 'none' && priceSelector.value) {
                    basePrice = parseFloat(product[priceSelector.value]);
                } else {
                    basePrice = parseFloat(product['retail price Q']);
                }
                // Apply the multiplier to the selected base price
                priceToUse = basePrice * priceMultiplier;

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

    /**
     * --- MODIFIED FUNCTION ---
     * This function now displays both the original and the new price when they are different.
     */
    function updateProductCardPrices(squareElement, newCaPrice, eaInCa) {
        const productCode = squareElement.dataset.productCode;
        const product = products.find(p => p['item code'] == productCode);
        if (!product) return;

        // Determine the original base price depending on whether the selector is active
        let originalCaPrice;
        if (priceSelector.style.display !== 'none' && priceSelector.value) {
            originalCaPrice = parseFloat(product[priceSelector.value]);
        } else {
            originalCaPrice = parseFloat(product['retail price Q']);
        }

        const eaInCaNum = parseInt(eaInCa);
        const originalEaPrice = originalCaPrice / eaInCaNum;

        // Helper to generate HTML for prices. Shows original only if it differs from the new price.
        const generatePriceHTML = (originalPrice, newPrice) => {
            if (Math.abs(originalPrice - newPrice) > 0.001) { // Compare floats carefully
                return `<span class="original-price">${originalPrice.toFixed(2)}</span> <span class="new-price">${newPrice.toFixed(2)} SR</span>`;
            } else {
                return `<span class="new-price">${newPrice.toFixed(2)} SR</span>`;
            }
        };

        const contentDiv = squareElement.querySelector('.card-content');
        
        contentDiv.querySelector('p:nth-of-type(2)').innerHTML = `Ca = ${generatePriceHTML(originalCaPrice, newCaPrice)}`;
        contentDiv.querySelector('p:nth-of-type(3)').innerHTML = `Ca + tax = ${generatePriceHTML(originalCaPrice * 1.15, newCaPrice * 1.15)}`;
        contentDiv.querySelector('p:nth-of-type(4)').innerHTML = `Bund = ${generatePriceHTML(originalEaPrice, newCaPrice / eaInCaNum)}`;
        contentDiv.querySelector('p:nth-of-type(5)').innerHTML = `Bund + Tax = ${generatePriceHTML(originalEaPrice * 1.15, (newCaPrice / eaInCaNum) * 1.15)}`;
    }


    /**
     * --- MODIFIED FUNCTION ---
     * Now applies the current priceMultiplier to the selected price category.
     */
    function updateOriginalPrices() {
        const selectedCategory = priceSelector.value;
        if (!selectedCategory) return;
        document.querySelectorAll('.productSquare').forEach(square => {
            const productCode = square.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);
            if (product) {
                const basePrice = parseFloat(product[selectedCategory]);
                if (!isNaN(basePrice)) {
                    // Apply the current multiplier to the newly selected base price
                    const newPrice = basePrice * priceMultiplier;
                    updateProductCardPrices(square, newPrice, product['ea in ca']);
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
            if (typeof jsonData[0][header] === 'number' && header.toLowerCase().includes('price')) {
                const option = document.createElement('option');
                option.value = header;
                option.textContent = header;
                priceSelector.appendChild(option);
            }
        });
        // Set 'retail price Q' as the default selection if it exists
        if (priceSelector.querySelector('[value="retail price Q"]')) {
            priceSelector.value = 'retail price Q';
        }

        priceSelector.addEventListener('change', updateOriginalPrices);

        if (!document.getElementById('priceSelector')) {
            document.getElementById('cartContainer').insertBefore(priceSelector, document.getElementById('cartItems'));
        }
        updatePercentageDisplay(); // Set the initial percentage display
    }

    fetch('PRICES.xlsx')
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, {
                type: 'array'
            });
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
                    const workbook = XLSX.read(ev.target.result, {
                        type: 'array'
                    });
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
