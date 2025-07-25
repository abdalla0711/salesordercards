// --- SCRIPT START ---

document.addEventListener('DOMContentLoaded', function() {
    document.body.style.visibility = 'visible';

    // --- Element Selectors ---
    const productGrid = document.getElementById('productGrid');
    const cartItemsContainer = document.getElementById('cartItems');
    const filterInput = document.getElementById('filterInput');
    const copyButton = document.getElementById('copyButton');
    const fallbackFileInput = document.getElementById('fallbackFileInput');
    const cartCommentInput = document.getElementById('cartComment');
    const langEnButton = document.getElementById('langEn');
    const langArButton = document.getElementById('langAr');
    const mainTitle = document.getElementById('mainTitle'); // Title element
    const priceSelector = document.createElement('select');
    priceSelector.id = 'priceSelector';
    priceSelector.style.display = 'none';

    // --- Create and Add Price Adjustment Controls ---
    const controlsContainer = filterInput.parentElement;
    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.id = 'increasePrice';
    increaseButton.style.marginLeft = '10px';

    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '-';
    decreaseButton.id = 'decreasePrice';

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
    let currentLanguage = 'ar'; // Default language is Arabic
    let englishButtonClickCount = 0;
    let priceMultiplier = 1.10;
    let displayPercentage = 0;

    // --- EDIT: Central Translation Object ---
    const translations = {
        en: {
            mainTitle: "Sales Order from Eagle Consumer Products",
            filterPlaceholder: "Search by name or code...",
            priceCa: "Ca",
            priceCaTax: "Ca + tax",
            priceBund: "Bund",
            priceBundTax: "Bund + Tax",
            increaseTitle: "Increase prices by 5%",
            decreaseTitle: "Decrease prices by 5%",
            unlockPasswordPrompt: "Please enter the password to show original prices:",
            unlockedAlert: "Original prices unlocked!",
            incorrectPasswordAlert: "Incorrect password.",
            maxLimitAlert: "Maximum price increase limit reached.",
            minLimitAlert: "Minimum price limit reached.",
            quantityPrompt: "Enter the quantity:",
            cartTotalText: "Total with tax",
            copyButtonText: "Copy Order & Open WhatsApp",
            copySuccessAlert: "Cart content copied. WhatsApp will now open.",
            copyErrorAlert: "An error occurred while copying.",
            fileNotFoundAlert: "Price file not found, please select it manually.",
            commentsLabel: "Comments:"
        },
        ar: {
            mainTitle: "سجل طلبيتك من متجر ايجل للمنتجات الاستهلاكية",
            filterPlaceholder: "البحث بالاسم أو الكود...",
            priceCa: "الكرتون",
            priceCaTax: "الكرتون+الضريبة",
            priceBund: "الشد",
            priceBundTax: "الشد+الضريبة",
            increaseTitle: "زيادة الأسعار بنسبة 5%",
            decreaseTitle: "تخفيض الأسعار بنسبة 5%",
            unlockPasswordPrompt: "الرجاء إدخال كلمة المرور لعرض الأسعار الأصلية:",
            unlockedAlert: "تم عرض الأسعار الأصلية!",
            incorrectPasswordAlert: "كلمة مرور غير صحيحة.",
            maxLimitAlert: "تم الوصول إلى الحد الأقصى لزيادة السعر.",
            minLimitAlert: "تم الوصول إلى الحد الأدنى لتخفيض السعر.",
            quantityPrompt: "أدخل الكمية:",
            cartTotalText: "الإجمالي مع الضريبة",
            copyButtonText: "نسخ الطلب وفتح واتساب",
            copySuccessAlert: "تم نسخ محتوى السلة. سيتم الآن فتح واتساب.",
            copyErrorAlert: "حدث خطأ أثناء النسخ.",
            fileNotFoundAlert: "لم يتم العثور على ملف الأسعار، اختره يدويًا.",
            commentsLabel: "ملاحظات:"
        }
    };

    // --- EDIT: Function to update all UI text elements ---
    function updateUIText() {
        const lang = translations[currentLanguage];
        mainTitle.textContent = lang.mainTitle;
        filterInput.placeholder = lang.filterPlaceholder;
        increaseButton.title = lang.increaseTitle;
        decreaseButton.title = lang.decreaseTitle;
        copyButton.textContent = lang.copyButtonText;
    }

    // --- Update the Percentage Display ---
    function updatePercentageDisplay() {
        let prefix = displayPercentage > 0 ? '+' : '';
        if (displayPercentage === 0) prefix = '+';
        percentageDisplay.textContent = `${prefix}${displayPercentage.toFixed(0)}%`;
    }

    // --- Language Switch Listeners ---
    langArButton.addEventListener('click', () => switchLanguage('ar'));
    langEnButton.addEventListener('click', () => {
        englishButtonClickCount++;
        if (englishButtonClickCount >= 5) {
            const password = prompt(translations[currentLanguage].unlockPasswordPrompt);
            if (password === "20202030") {
                priceSelector.style.display = 'block';
                increaseButton.disabled = false;
                decreaseButton.disabled = false;
                percentageDisplay.style.display = 'inline-block';
                priceMultiplier = 1.0;
                displayPercentage = 0;
                updatePercentageDisplay();
                updateOriginalPrices();
                alert(translations[currentLanguage].unlockedAlert);
            } else {
                alert(translations[currentLanguage].incorrectPasswordAlert);
            }
            englishButtonClickCount = 0;
        }
        switchLanguage('en');
    });

    // --- Price Multiplier Button Listeners ---
    increaseButton.addEventListener('click', () => {
        if (priceMultiplier >= 2.0) {
            alert(translations[currentLanguage].maxLimitAlert);
            return;
        }
        priceMultiplier += 0.05;
        displayPercentage += 5;
        updateMultiplierPrices();
        updatePercentageDisplay();
    });

    decreaseButton.addEventListener('click', () => {
        if (priceMultiplier <= 0.55) {
            alert(translations[currentLanguage].minLimitAlert);
            return;
        }
        priceMultiplier -= 0.05;
        displayPercentage -= 5;
        updateMultiplierPrices();
        updatePercentageDisplay();
    });

    // --- EDIT: Main function to handle all language changes ---
    function switchLanguage(lang) {
        currentLanguage = lang;
        updateUIText(); // Update all static text
        updateProductLanguage(); // Update product names on cards
        updateCartLanguage(); // Update product names in cart
        updateMultiplierPrices(); // Redraw all cards to update price labels (Ca -> الكرتون)
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

    function updateMultiplierPrices() {
        document.querySelectorAll('.productSquare').forEach(square => {
            const productCode = square.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);
            if (product) {
                let basePrice;
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
            const quantity = prompt(translations[currentLanguage].quantityPrompt);
            if (quantity && !isNaN(quantity) && quantity > 0) {
                let basePrice;
                if (priceSelector.style.display !== 'none' && priceSelector.value) {
                    basePrice = parseFloat(product[priceSelector.value]);
                } else {
                    basePrice = parseFloat(product['retail price Q']);
                }
                const priceToUse = basePrice * priceMultiplier;

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
    
    // --- EDIT: This function now uses the translation object for price labels ---
    function updateProductCardPrices(squareElement, newCaPrice, eaInCa) {
        const productCode = squareElement.dataset.productCode;
        const product = products.find(p => p['item code'] == productCode);
        if (!product) return;

        let basePriceForComparison;
        if (priceSelector.style.display !== 'none' && priceSelector.value) {
            basePriceForComparison = parseFloat(product[priceSelector.value]);
        } else {
            basePriceForComparison = parseFloat(product['retail price Q']) * 1.10;
        }

        const eaInCaNum = parseInt(eaInCa);
        const baseEaPriceForComparison = basePriceForComparison / eaInCaNum;
        const newEaPrice = newCaPrice / eaInCaNum;

        const generatePriceHTML = (basePrice, currentPrice) => {
            if (displayPercentage !== 0) {
                return `<span class="original-price">${basePrice.toFixed(2)}</span> <span class="new-price">${currentPrice.toFixed(2)} SR</span>`;
            } else {
                return `<span class="new-price">${currentPrice.toFixed(2)} SR</span>`;
            }
        };

        const contentDiv = squareElement.querySelector('.card-content');
        const lang = translations[currentLanguage]; // Get current language strings
        
        contentDiv.querySelector('p:nth-of-type(2)').innerHTML = `<span>${lang.priceCa}</span> ${generatePriceHTML(basePriceForComparison, newCaPrice)}`;
        contentDiv.querySelector('p:nth-of-type(3)').innerHTML = `<span>${lang.priceCaTax}</span> ${generatePriceHTML(basePriceForComparison * 1.15, newCaPrice * 1.15)}`;
        contentDiv.querySelector('p:nth-of-type(4)').innerHTML = `<span>${lang.priceBund}</span> ${generatePriceHTML(baseEaPriceForComparison, newEaPrice)}`;
        contentDiv.querySelector('p:nth-of-type(5)').innerHTML = `<span>${lang.priceBundTax}</span> ${generatePriceHTML(baseEaPriceForComparison * 1.15, newEaPrice * 1.15)}`;
    }


    function updateOriginalPrices() {
        const selectedCategory = priceSelector.value;
        if (!selectedCategory) return;
        document.querySelectorAll('.productSquare').forEach(square => {
            const productCode = square.dataset.productCode;
            const product = products.find(p => p['item code'] == productCode);
            if (product) {
                const basePrice = parseFloat(product[selectedCategory]);
                if (!isNaN(basePrice)) {
                    const newPrice = basePrice * priceMultiplier;
                    updateProductCardPrices(square, newPrice, product['ea in ca']);
                }
            }
        });
    }

    function updateCartTotal() {
        const cartTotalElement = document.getElementById('cartTotal');
        const cartTotalWithTax = cartTotal * 1.15;
        cartTotalElement.textContent = `${translations[currentLanguage].cartTotalText}: ${cartTotalWithTax.toFixed(2)} SR`;
    }

    function loadProductsFromExcel(jsonData) {
        productGrid.innerHTML = '';
        products.length = 0;
        if (!jsonData || jsonData.length === 0) return;
        
        const headers = Object.keys(jsonData[0]);
        jsonData.forEach(product => {
            if (product['stock quantity'] !== undefined && Number(product['stock quantity']) === 0) return;
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
        if (priceSelector.querySelector('[value="retail price Q"]')) {
            priceSelector.value = 'retail price Q';
        }

        priceSelector.addEventListener('change', () => {
            priceMultiplier = 1.0;
            displayPercentage = 0;
            updatePercentageDisplay();
            updateOriginalPrices();
        });

        if (!document.getElementById('priceSelector')) {
            document.getElementById('cartContainer').insertBefore(priceSelector, document.getElementById('cartItems'));
        }

        // --- EDIT: Set the initial language for the whole UI on load ---
        switchLanguage(currentLanguage);
        updatePercentageDisplay();
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
            console.error("Error fetching or processing Excel file:", err);
            alert(translations[currentLanguage].fileNotFoundAlert);
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
            cartText += `\n\n${translations[currentLanguage].commentsLabel}\n` + comment;
        }
        navigator.clipboard.writeText(cartText).then(() => {
            alert(translations[currentLanguage].copySuccessAlert);
            const phoneNumber = "966550245871";
            const encodedCartText = encodeURIComponent(cartText);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedCartText}`;
            window.open(whatsappUrl, '_blank');
        }).catch(err => {
            console.error('Failed to copy or open WhatsApp: ', err);
            alert(translations[currentLanguage].copyErrorAlert);
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
