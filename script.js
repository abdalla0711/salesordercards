// --- SCRIPT START ---

// Greet the user on script load
//alert("Welcome to the Eagle Store portal!");

document.addEventListener('DOMContentLoaded', function() {
    document.body.style.visibility = 'visible';

    // --- Element Selectors ---
    const productGrid = document.getElementById('productGrid');
    const cartItemsContainer = document.getElementById('cartItems');
    const filterInput = document.getElementById('filterInput');
    const copyButton = document.getElementById('copyButton');
    const cartCommentInput = document.getElementById('cartComment');
    const langEnButton = document.getElementById('langEn');
    const langArButton = document.getElementById('langAr');
    const mainTitleText = document.getElementById('mainTitleText');
    const subtitle = document.getElementById('subtitle');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const controlsContainer = document.getElementById('controlsContainer');
    const priceSelector = document.createElement('select');
    priceSelector.id = 'priceSelector';
    priceSelector.style.display = 'none';

    // --- Floating Cart Selectors ---
    const floatingCartIcon = document.getElementById('floatingCartIcon');
    const cartModal = document.getElementById('cartModal');
    const cartModalClose = document.getElementById('cartModalClose');
    const modalCartItemsContainer = document.getElementById('modalCartItemsContainer');
    const modalCartTotal = document.getElementById('modalCartTotal');
    const modalControlsContainer = document.getElementById('modalControlsContainer');
    const modalCartComment = document.getElementById('modalCartComment');
    const modalCopyButton = document.getElementById('modalCopyButton');
    const modalCommentsLabel = document.getElementById('modalCommentsLabel');


    // --- MODIFIED: Create and Add Price & Zoom Adjustment Controls with new styling ---
    
    // Create containers for button groups
    const zoomControls = document.createElement('div');
    zoomControls.className = 'control-group';
    const priceControls = document.createElement('div');
    priceControls.className = 'control-group';

    // Create Zoom Buttons with SVG Icons
    const zoomInButton = document.createElement('button');
    zoomInButton.className = 'control-btn';
    zoomInButton.id = 'zoomIn';
    zoomInButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM10 9h-1V8h1v-1h1v1h1v1h-1v1h-1z"/></svg>';
    
    const zoomOutButton = document.createElement('button');
    zoomOutButton.className = 'control-btn';
    zoomOutButton.id = 'zoomOut';
    zoomOutButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg>';
    
    // Create Price Buttons
    const increaseButton = document.createElement('button');
    increaseButton.className = 'control-btn';
    increaseButton.textContent = '+';
    increaseButton.id = 'increasePrice';
    
    const decreaseButton = document.createElement('button');
    decreaseButton.className = 'control-btn';
    decreaseButton.textContent = '-';
    decreaseButton.id = 'decreasePrice';
    
    const percentageDisplay = document.createElement('span');
    percentageDisplay.id = 'percentageDisplay';
    percentageDisplay.style.padding = '0 10px'; // Give percentage display some space

    // Add buttons to their respective groups
    zoomControls.appendChild(zoomOutButton);
    zoomControls.appendChild(zoomInButton);
    
    priceControls.appendChild(decreaseButton);
    priceControls.appendChild(percentageDisplay);
    priceControls.appendChild(increaseButton);

    // Add groups to the main container
    controlsContainer.appendChild(zoomControls);
    controlsContainer.appendChild(priceControls);

    // --- Global State ---
    const products = [];
    let cart = []; 
    let currentLanguage = 'ar';
    let englishButtonClickCount = 0;
    let priceMultiplier = 1.10;
    let displayPercentage = 0;
    let isCustomerMode = false;
    let isDiscounting = false;
    let discountBaseMultiplier = 1.0;
    let scrollClickCount = 0;
    let currentZoom = 1.0;

    const translations = {
        en: { 
            mainTitle: "Eagle Store", salesRepSubtitle: "(Sales Rep Window)", 
            filterPlaceholder: "Register an item by clicking on it...", 
            priceCa: "Ca", priceCaTax: "Ca+tax", priceBund: "Bund", priceBundTax: "Bund+Tax", 
            increaseTitle: "Increase prices by 5%", decreaseTitle: "Decrease prices by 5%",
            zoomInTitle: "Zoom In", zoomOutTitle: "Zoom Out", 
            unlockPasswordPrompt: "Please enter the password:", unlockedAlert: "Sales Rep mode activated!", 
            incorrectPasswordAlert: "Incorrect password.", maxLimitAlert: "Max limit reached.", minLimitAlert: "Min limit reached.", 
            quantityPrompt: "Enter quantity:", cartTotalText: "Total with tax", 
            copyButtonText: "Copy & Open WhatsApp", copySuccessAlert: "Cart copied.", 
            copyErrorAlert: "Copy error.", fileNotFoundAlert: "Price file not found.", commentsLabel: "SalesMan name/City name/Shop name:", 
            scrollTopTitle: "Scroll to Top", scrollBottomTitle: "Scroll to Bottom",
            quantityModalTitle: "Select Quantity", addToCartBtn: "Add to Cart", cancelBtn: "Cancel",
            priceCategories: {
                "retail price Q": "Retail Price", "wholesale price": "Wholesale Price", "supermarket price": "Supermarket Price","hypermarket price":
                    "Hypermarket Price", "other price 1": "Price 1", "other price 2": "Price 2", "other price 3": "Price 3"
            }
        },
        ar: { 
            mainTitle: "متجر ايجل", salesRepSubtitle: "(نافذة خاصة بالمندوب)", 
            filterPlaceholder: "يمكنك تسجيل الصنف بالضغط عليه...", 
            priceCa: "الكرتون", priceCaTax: "كرتون+ضريبة", priceBund: "الشد", priceBundTax: "شد+ضريبة", 
            increaseTitle: "زيادة الأسعار ٥٪", decreaseTitle: "تخفيض الأسعار ٥٪", 
            zoomInTitle: "تكبير", zoomOutTitle: "تصغير",
            unlockPasswordPrompt: "الرجاء إدخال كلمة المرور:", unlockedAlert: "تم تفعيل وضع المندوب!", 
            incorrectPasswordAlert: "كلمة مرور غير صحيحة.", maxLimitAlert: "تم الوصول للحد الأعلى.", minLimitAlert: "تم الوصول للحد الأدنى.", 
            quantityPrompt: "أدخل الكمية:", cartTotalText: "الإجمالي مع الضريبة", 
            copyButtonText: "نسخ الطلب وفتح واتساب", copySuccessAlert: "تم نسخ السلة.", 
            copyErrorAlert: "حدث خطأ.", fileNotFoundAlert: "ملف الأسعار غير موجود.", commentsLabel: "اسم المندوب/اسم المدينة /اسم المحل", 
            scrollTopTitle: "الانتقال للأعلى", scrollBottomTitle: "الانتقال للأسفل",
            quantityModalTitle: "اختر الكمية", addToCartBtn: "إضافة للسلة", cancelBtn: "إلغاء",
              priceCategories: {
                "retail price Q": "سعر التجزئة القريات", "retail price": "سعر التجزئة", "discountshops price": "سعر التخفيضات",
                "wholesale price": "سعر الجملة", "discountshops price Q": "سعر تخفيضات القريات ", "wholesale price Q": "سعر جملة القريات", "contract 5% price": "سعر العقود5%ـ"
            }
        }
    };

    function updateUIText() {
        const lang = translations[currentLanguage];
        mainTitleText.textContent = lang.mainTitle;
        subtitle.textContent = isCustomerMode ? lang.salesRepSubtitle : '';
        filterInput.placeholder = lang.filterPlaceholder;
        
        increaseButton.title = lang.increaseTitle;
        decreaseButton.title = lang.decreaseTitle;
        zoomInButton.title = lang.zoomInTitle;
        zoomOutButton.title = lang.zoomOutTitle;

        copyButton.textContent = lang.copyButtonText;
        scrollToTopBtn.title = lang.scrollTopTitle;
        scrollToBottomBtn.title = lang.scrollBottomTitle;
        modalCopyButton.textContent = lang.copyButtonText;
        modalCommentsLabel.textContent = lang.commentsLabel;
        modalCartComment.placeholder = lang.commentsLabel;
    }

    function updatePercentageDisplay() { let prefix = displayPercentage >= 0 ? '+' : ''; percentageDisplay.textContent = `${prefix}${displayPercentage.toFixed(0)}%`; }

    // --- Event Listeners ---
    floatingCartIcon.addEventListener('click', () => cartModal.classList.remove('modal-hidden'));
    cartModalClose.addEventListener('click', () => cartModal.classList.add('modal-hidden'));
    window.addEventListener('click', (event) => { if (event.target == cartModal) cartModal.classList.add('modal-hidden'); });
    
    cartCommentInput.addEventListener('input', () => { modalCartComment.value = cartCommentInput.value; });
    modalCartComment.addEventListener('input', () => { cartCommentInput.value = modalCartComment.value; });

    langArButton.addEventListener('click', () => switchLanguage('ar'));
    langEnButton.addEventListener('click', () => {
        englishButtonClickCount++;
        if (englishButtonClickCount >= 5) {
            const password = prompt(translations[currentLanguage].unlockPasswordPrompt);
            if (password === "20202030") {
                isCustomerMode = true;
                
                increaseButton.disabled = true; 
                decreaseButton.disabled = true;
                percentageDisplay.style.display = 'none';

                updateUIText();
                priceSelector.style.display = 'block';
                isDiscounting = false;
                priceMultiplier = 1.0;
                displayPercentage = 0;
                updateOriginalPrices();
                scrollClickCount = 0;
                alert(translations[currentLanguage].unlockedAlert);
            } else {
                alert(translations[currentLanguage].incorrectPasswordAlert);
            }
            englishButtonClickCount = 0;
        }
        switchLanguage('en');
    });

    zoomInButton.addEventListener('click', () => {
        currentZoom = Math.min(2.0, currentZoom + 0.1);
        document.body.style.zoom = currentZoom;
    });

    zoomOutButton.addEventListener('click', () => {
        currentZoom = Math.max(0.5, currentZoom - 0.1);
        document.body.style.zoom = currentZoom;
    });

    increaseButton.addEventListener('click', () => {
        const baseMultiplier = isDiscounting ? discountBaseMultiplier : 1.0;
        const newMultiplier = priceMultiplier + 0.05;
        if (newMultiplier >= baseMultiplier * 2) { alert(translations[currentLanguage].maxLimitAlert); return; }
        priceMultiplier = newMultiplier;
        displayPercentage += 5; 
        updatePercentageDisplay();
        updateMultiplierPrices();
    });

    decreaseButton.addEventListener('click', () => {
        if (priceMultiplier <= 0.55) { alert(translations[currentLanguage].minLimitAlert); return; }
        priceMultiplier -= 0.05; 
        displayPercentage -= 5; 
        updateMultiplierPrices(); 
        updatePercentageDisplay();
    });

    scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    scrollToBottomBtn.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        if (isCustomerMode && priceSelector.style.display === 'none') {
            scrollClickCount++;
            if (scrollClickCount >= 5) {
                priceSelector.style.display = 'block';
                scrollClickCount = 0;
            }
        }
    });

    function switchLanguage(lang) {
        currentLanguage = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        if (lang === 'ar') { langArButton.classList.add('active'); langEnButton.classList.remove('active'); } 
        else { langEnButton.classList.add('active'); langArButton.classList.remove('active'); }
        updateUIText();
        updateProductLanguage();
        renderCart(); 
        updateMultiplierPrices();
        rebuildPriceSelectorOptions();
    }
    
    function getCurrentBasePrice(product) {
        const selectedCategory = priceSelector.value || 'retail price Q';
        return parseFloat(product[selectedCategory]);
    }

    function getItemName(product) { if (currentLanguage === 'en' && product['en_item_name']) return product['en_item_name']; return product['item name']; }
    function updateProductLanguage() { document.querySelectorAll('.productSquare').forEach(square => { const productCode = square.dataset.productCode; const product = products.find(p => p['item code'] == productCode); if (product) square.querySelector('.card-content p:first-of-type').textContent = getItemName(product); }); filterInput.dispatchEvent(new Event('input')); }
    function updateMultiplierPrices() { document.querySelectorAll('.productSquare').forEach(square => { const productCode = square.dataset.productCode; const product = products.find(p => p['item code'] == productCode); if (product) { const basePrice = getCurrentBasePrice(product); if (!isNaN(basePrice)) { const newPrice = basePrice * priceMultiplier; updateProductCardPrices(square, newPrice, product['ea in ca']); } } }); }
    
    function addItemToCart(product, quantity) {
        const basePrice = getCurrentBasePrice(product);
        let priceToUse;

        if (isCustomerMode) {
            priceToUse = basePrice;
        } else {
            priceToUse = basePrice * priceMultiplier;
        }
        
        cart.push({
            productCode: product['item code'],
            quantity: quantity,
            pricePerUnit: priceToUse
        });

        renderCart();
    }
    
    function showQuantityModal(product) {
        const backdrop = document.createElement('div');
        backdrop.className = 'quantity-modal-backdrop';

        const modal = document.createElement('div');
        modal.className = 'quantity-modal';
        
        const lang = translations[currentLanguage];
        modal.innerHTML = `
            <h3>${lang.quantityModalTitle}</h3>
            <p>${getItemName(product)}</p>
            <input type="number" id="quantityInput" value="1" min="1" step="1" autofocus>
            <div class="modal-actions">
                <button class="add-btn">${lang.addToCartBtn}</button>
                <button class="cancel-btn">${lang.cancelBtn}</button>
            </div>
        `;
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        const quantityInput = backdrop.querySelector('#quantityInput');
        const addBtn = backdrop.querySelector('.add-btn');
        const cancelBtn = backdrop.querySelector('.cancel-btn');

        const closeModal = () => document.body.removeChild(backdrop);

        addBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value, 10);
            if (quantity > 0) {
                addItemToCart(product, quantity);
            }
            closeModal();
        });
        
        cancelBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeModal();
            }
        });
    }

    function createProductSquare(product) { 
        const square = document.createElement('div'); square.className = 'productSquare'; square.dataset.productCode = product['item code']; square.dataset.productNameAr = product['item name'] || ''; square.dataset.productNameEn = product['en_item_name'] || ''; const image = document.createElement('img'); image.src = product['image_ulr'] || 'https://via.placeholder.com/300x200.png?text=No+Image'; square.appendChild(image); const contentDiv = document.createElement('div'); contentDiv.className = 'card-content'; square.appendChild(contentDiv); const name = document.createElement('p'); name.textContent = getItemName(product); contentDiv.appendChild(name); for (let i = 0; i < 4; i++) contentDiv.appendChild(document.createElement('p')); const basePrice = getCurrentBasePrice(product); const initialPrice = basePrice * priceMultiplier; updateProductCardPrices(square, initialPrice, product['ea in ca']); 
        
        square.addEventListener('click', () => {
            showQuantityModal(product);
        }); 
        return square; 
    }
    
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        modalCartItemsContainer.innerHTML = '';
        let currentCartTotal = 0;

        cart.forEach((cartItemData, index) => {
            const product = products.find(p => p['item code'] == cartItemData.productCode);
            if (!product) return;

            currentCartTotal += cartItemData.quantity * cartItemData.pricePerUnit;

            const cartItemHTML = `
                <span class="cartLineNumber">${index + 1}. </span>
                <span>${product['item code']} | </span>
                <span>${cartItemData.quantity}Ca | </span>
                <span>${cartItemData.pricePerUnit.toFixed(2)}</span>
                <span class="currency-symbol"></span>
                <span> | </span>
                <span class="itemName">${getItemName(product)}</span>
                <button class="delete-btn" data-cart-index="${index}">X</button>
            `;
            
            const mainCartItemEl = document.createElement('div');
            mainCartItemEl.className = 'cartItem';
            mainCartItemEl.innerHTML = cartItemHTML;
            cartItemsContainer.appendChild(mainCartItemEl);

            const modalCartItemEl = document.createElement('div');
            modalCartItemEl.className = 'cartItem';
            modalCartItemEl.innerHTML = cartItemHTML;
            modalCartItemsContainer.appendChild(modalCartItemEl);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const indexToDelete = parseInt(this.dataset.cartIndex);
                cart.splice(indexToDelete, 1);
                renderCart();
            });
        });

        updateCartTotal(currentCartTotal);
    }

    function updateProductCardPrices(squareElement, passedPrice, eaInCa) { 
        const productCode = squareElement.dataset.productCode; 
        const product = products.find(p => p['item code'] == productCode); if (!product) return; 
        
        const contentDiv = squareElement.querySelector('.card-content'); 
        const lang = translations[currentLanguage]; 
        const eaInCaNum = parseInt(eaInCa);
        const currencySymbolHTML = '<span class="currency-symbol"></span>';
        const trueBasePrice = getCurrentBasePrice(product);

        if (isCustomerMode) {
            const originalPriceCa = trueBasePrice;
            const newPriceCa = originalPriceCa + 10;
            const originalPriceEa = originalPriceCa / eaInCaNum;
            const newPriceEa = newPriceCa / eaInCaNum;

            const generateSalesRepHTML = (original, newPrice) => {
                return `<span style="font-weight: bold; color: green;">${original.toFixed(2)}</span> 
                        <span style="text-decoration: line-through; font-size: smaller; color: red; margin-left: 5px;">${newPrice.toFixed(2)}${currencySymbolHTML}</span>`;
            };

            contentDiv.querySelector('p:nth-of-type(2)').innerHTML = `<span>${lang.priceCa}</span> ${generateSalesRepHTML(originalPriceCa, newPriceCa)}`; 
            contentDiv.querySelector('p:nth-of-type(3)').innerHTML = `<span>${lang.priceCaTax}</span> ${generateSalesRepHTML(originalPriceCa * 1.15, newPriceCa * 1.15)}`; 
            contentDiv.querySelector('p:nth-of-type(4)').innerHTML = `<span>${lang.priceBund}</span> ${generateSalesRepHTML(originalPriceEa, newPriceEa)}`; 
            contentDiv.querySelector('p:nth-of-type(5)').innerHTML = `<span>${lang.priceBundTax}</span> ${generateSalesRepHTML(originalPriceEa * 1.15, newPriceEa * 1.15)}`; 

        } else {
            const newCaPrice = passedPrice;
            const newEaPrice = newCaPrice / eaInCaNum;
            let basePriceForComparison;
            let showOriginal = false;

            if (isDiscounting) { basePriceForComparison = trueBasePrice * discountBaseMultiplier; showOriginal = true; } 
            else if (displayPercentage !== 0) { basePriceForComparison = trueBasePrice * 1.10; showOriginal = true; }

            const baseEaPriceForComparison = basePriceForComparison / eaInCaNum;
            const generatePriceHTML = (basePrice, currentPrice) => {
                return showOriginal ? `<span class="original-price">${basePrice.toFixed(2)}</span> <span class="new-price">${currentPrice.toFixed(2)}${currencySymbolHTML}</span>`
                                    : `<span class="new-price">${currentPrice.toFixed(2)}${currencySymbolHTML}</span>`;
            };

            contentDiv.querySelector('p:nth-of-type(2)').innerHTML = `<span>${lang.priceCa}</span> ${generatePriceHTML(basePriceForComparison, newCaPrice)}`; 
            contentDiv.querySelector('p:nth-of-type(3)').innerHTML = `<span>${lang.priceCaTax}</span> ${generatePriceHTML(basePriceForComparison * 1.15, newCaPrice * 1.15)}`; 
            contentDiv.querySelector('p:nth-of-type(4)').innerHTML = `<span>${lang.priceBund}</span> ${generatePriceHTML(baseEaPriceForComparison, newEaPrice)}`; 
            contentDiv.querySelector('p:nth-of-type(5)').innerHTML = `<span>${lang.priceBundTax}</span> ${generatePriceHTML(baseEaPriceForComparison * 1.15, newEaPrice * 1.15)}`; 
        }
    }

    function updateOriginalPrices() { document.querySelectorAll('.productSquare').forEach(square => { const productCode = square.dataset.productCode; const product = products.find(p => p['item code'] == productCode); if (product) { const basePrice = getCurrentBasePrice(product); if (!isNaN(basePrice)) { const newPrice = basePrice * priceMultiplier; updateProductCardPrices(square, newPrice, product['ea in ca']); } } }); }
    
    function updateCartTotal(currentTotal) { 
        const cartTotalElement = document.getElementById('cartTotal'); 
        const cartTotalWithTax = currentTotal * 1.15;
        const totalText = `${translations[currentLanguage].cartTotalText}: ${cartTotalWithTax.toFixed(2)}`;
        
        cartTotalElement.textContent = totalText;
        modalCartTotal.textContent = totalText;

        const isCartEmpty = cart.length === 0;
        copyButton.classList.toggle('hidden', isCartEmpty);
        floatingCartIcon.classList.toggle('hidden', isCartEmpty);
        modalControlsContainer.classList.toggle('hidden', isCartEmpty);
        modalCopyButton.classList.toggle('hidden', isCartEmpty);
    }

    function rebuildPriceSelectorOptions() {
        if (!priceSelector.options.length) return;
        const currentSelection = priceSelector.value;
        const lang = translations[currentLanguage];
        Array.from(priceSelector.options).forEach(option => {
            option.textContent = lang.priceCategories[option.value] || option.value;
        });
        priceSelector.value = currentSelection;
    }

    function loadProductsFromExcel(jsonData) { 
        productGrid.innerHTML = ''; products.length = 0; if (!jsonData || jsonData.length === 0) return; 
        const headers = Object.keys(jsonData[0]); 
        jsonData.forEach(product => { if (product['stock quantity'] !== undefined && Number(product['stock quantity']) === 0) return; products.push(product); const square = createProductSquare(product); productGrid.appendChild(square); }); 
        priceSelector.innerHTML = ''; 
        const lang = translations[currentLanguage];
        headers.forEach(header => { 
            if (typeof jsonData[0][header] === 'number' && header.toLowerCase().includes('price')) { 
                const option = document.createElement('option'); 
                option.value = header; 
                option.textContent = lang.priceCategories[header] || header;
                priceSelector.appendChild(option); 
            } 
        }); 
        if (priceSelector.querySelector('[value="retail price Q"]')) priceSelector.value = 'retail price Q'; 
        
        priceSelector.addEventListener('change', () => { 
            isDiscounting = false; 
            priceMultiplier = 1.0; 
            displayPercentage = 0; 
            updatePercentageDisplay(); 
            updateOriginalPrices();
            
            if (isCustomerMode) {
                priceSelector.style.display = 'none';
                scrollClickCount = 0; 
            }
        }); 

        document.getElementById('cartContainer').insertBefore(priceSelector, document.getElementById('cartItems')); 
        switchLanguage(currentLanguage); 
        updatePercentageDisplay(); 
        langArButton.classList.add('active');
    }
    
    fetch('PRICES.xlsx').then(response => { if (!response.ok) throw new Error('File not found'); return response.arrayBuffer(); }).then(data => { const workbook = XLSX.read(data, { type: 'array' }); const sheet = workbook.Sheets[workbook.SheetNames[0]]; const jsonData = XLSX.utils.sheet_to_json(sheet); loadProductsFromExcel(jsonData); }).catch(err => { console.error("Error fetching or processing Excel file:", err); alert(translations[currentLanguage].fileNotFoundAlert); fallbackFileInput.style.display = 'block'; fallbackFileInput.addEventListener('change', function(e) { const reader = new FileReader(); reader.onload = function(ev) { const workbook = XLSX.read(ev.target.result, { type: 'array' }); const sheet = workbook.Sheets[workbook.SheetNames[0]]; const jsonData = XLSX.utils.sheet_to_json(sheet); loadProductsFromExcel(jsonData); fallbackFileInput.style.display = 'none'; }; reader.readAsArrayBuffer(e.target.files[0]); }); });
    
    function performCartCopy() {
        let cartText = ''; 
        let cartTotalForCopy = 0;

        cart.forEach((cartItemData, index) => {
            const product = products.find(p => p['item code'] == cartItemData.productCode);
            if (product) {
                cartTotalForCopy += cartItemData.quantity * cartItemData.pricePerUnit;
                const line = `${index + 1}. ${product['item code']} | ${cartItemData.quantity}Ca | ${cartItemData.pricePerUnit.toFixed(2)} SR | ${getItemName(product)}`;
                cartText += line + '\n';
            }
        });
        
        const totalWithTax = cartTotalForCopy * 1.15;
        cartText += `\n${translations[currentLanguage].cartTotalText}: ${totalWithTax.toFixed(2)} SR`;
        
        const comment = cartCommentInput.value.trim(); 
        if (comment) cartText += `\n\n${translations[currentLanguage].commentsLabel}\n` + comment; 
        
        navigator.clipboard.writeText(cartText).then(() => { 
            alert(translations[currentLanguage].copySuccessAlert); 
            const phoneNumber = "966550245871"; 
            const encodedCartText = encodeURIComponent(cartText); 
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedCartText}`; 
            window.open(whatsappUrl, '_blank'); 
        }).catch(err => { console.error('Failed to copy or open WhatsApp: ', err); alert(translations[currentLanguage].copyErrorAlert); }); 
    }

    copyButton.addEventListener('click', performCartCopy);
    modalCopyButton.addEventListener('click', performCartCopy);

    filterInput.addEventListener('input', function() { const val = this.value.toLowerCase(); document.querySelectorAll('.productSquare').forEach(el => { const nameAr = el.dataset.productNameAr.toLowerCase(); const nameEn = el.dataset.productNameEn.toLowerCase(); const code = el.dataset.productCode.toLowerCase(); const isVisible = nameAr.includes(val) || nameEn.includes(val) || code.includes(val); el.style.display = isVisible ? 'block' : 'none'; }); });
});

// --- Auto Night Mode (Consolidated and Fixed) ---
let manualDarkToggle = false;

function autoNightMode() {
    if (manualDarkToggle) return;
    const hour = new Date().getHours();
    const isNight = (hour >= 18 || hour < 5);
    document.body.classList.toggle('dark-mode', isNight);
}

document.addEventListener('DOMContentLoaded', () => {
    autoNightMode();
    setInterval(autoNightMode, 60 * 60 * 1000);

    darkModeToggle.addEventListener('click', () => {
        manualDarkToggle = true;
        document.body.classList.toggle('dark-mode');
    });
});
// --- SCRIPT END ---
