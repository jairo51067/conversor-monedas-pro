// Calculadora de Oro Educativa y en Tiempo Real
import { Utils } from './utils.js';

export class GoldCalculator {
    constructor() {
        this.currentGoldPrice = 2350; // Valor fallback por si la API falla
        this.isApiLoaded = false;

        this.inputs = {
            amount: document.getElementById('gold-amount'),
            unit: document.getElementById('gold-unit'),
            purityRadios: document.querySelectorAll('input[name="gold-purity"]'), // ← CORREGIDO: Ahora son radios
            operations: document.querySelectorAll('input[name="gold-operation"]')
        };

        this.ui = {
            marketPrice: document.getElementById('market-gold-price'),
            marketTime: document.getElementById('market-gold-time'),
            purityHint: document.getElementById('purity-hint'),
            resultBox: document.getElementById('gold-result-box'),
            narrative: document.getElementById('narrative-text'),
            breakBase: document.getElementById('break-base'),
            breakPurityPct: document.getElementById('break-purity-pct'),
            breakAdjusted: document.getElementById('break-adjusted'),
            breakMarginLabel: document.getElementById('break-margin-label'),
            breakFinal: document.getElementById('break-final')
        };

        this.init();
    }

    async init() {
        await this.fetchRealGoldPrice();
        this.attachListeners();
        this.calculate(); // Cálculo inicial
    }

    async fetchRealGoldPrice() {
        try {
            // API pública y gratuita para el precio del oro (XAU/USD)
            const response = await fetch('https://api.gold-api.com/price/XAU');
            if (!response.ok) throw new Error('API Error');
            
            const data = await response.json();
            this.currentGoldPrice = data.price;
            this.isApiLoaded = true;

            this.ui.marketPrice.textContent = Utils.formatCurrency(this.currentGoldPrice, 'USD');
            this.ui.marketTime.textContent = 'Actualizado: Ahora';
        } catch (error) {
            console.warn('⚠️ No se pudo obtener el precio en tiempo real. Usando valor de referencia.');
            this.ui.marketPrice.textContent = Utils.formatCurrency(this.currentGoldPrice, 'USD') + ' (Ref.)';
            this.ui.marketTime.textContent = 'Sin conexión a la bolsa';
        }
    }

    attachListeners() {
        // Recalcular en tiempo real ante cualquier cambio
        Object.values(this.inputs).forEach(input => {
            if (input instanceof NodeList) {
                // Si es una lista de nodos (radio buttons), agregar listener a cada uno
                input.forEach(radio => radio.addEventListener('change', () => this.calculate()));
            } else {
                // Si es un input normal (texto o select)
                input.addEventListener('input', () => this.calculate());
                input.addEventListener('change', () => this.calculate());
            }
        });
    }

    calculate() {
        const amount = parseFloat(this.inputs.amount.value) || 0;
        const unit = this.inputs.unit.value;
        
        // ← CORRECCIÓN CLAVE: Leer el valor del radio button de pureza seleccionado
        const selectedPurityRadio = document.querySelector('input[name="gold-purity"]:checked');
        const purityK = selectedPurityRadio ? parseInt(selectedPurityRadio.value) : 18; // Fallback a 18k
        
        const operation = document.querySelector('input[name="gold-operation"]:checked').value;

        if (amount <= 0) {
            this.ui.resultBox.style.display = 'none';
            return;
        }

        this.ui.resultBox.style.display = 'block';

        // 1. Constantes
        const TROY_OUNCE_IN_GRAMS = 31.1035;
        const purityFactor = purityK / 24;
        const purityPct = Math.round(purityFactor * 100);

        // 2. Valor base por gramo de oro PURO (24k)
        const basePricePerGram = this.currentGoldPrice / TROY_OUNCE_IN_GRAMS;

        // 3. Valor ajustado por pureza (por gramo)
        const adjustedPricePerGram = basePricePerGram * purityFactor;

        // 4. Factor de operación (Spread)
        // Venta: La casa paga ~15% menos (retiene margen)
        // Compra: La casa cobra ~15% más (agrega margen de fabricación/ganancia)
        const marginPct = 15;
        const operationMultiplier = operation === 'venta' ? (1 - marginPct / 100) : (1 + marginPct / 100);
        const finalPricePerGram = adjustedPricePerGram * operationMultiplier;

        // 5. Convertir la cantidad del usuario a gramos para el cálculo final
        const amountInGrams = unit === 'oz' ? (amount * TROY_OUNCE_IN_GRAMS) : amount;
        const totalValue = finalPricePerGram * amountInGrams;

        // 6. Actualizar UI Educativa
        // ← CORRECCIÓN CLAVE: Obtener el texto descriptivo directamente de la tarjeta seleccionada
        const purityDesc = selectedPurityRadio 
            ? selectedPurityRadio.parentElement.querySelector('.purity-desc').textContent.trim() 
            : 'Joyería';
        
        this.ui.purityHint.textContent = `${purityPct}% del peso es oro puro. El ${100 - purityPct}% restante son otros metales. Uso típico: ${purityDesc.toLowerCase()}.`;
        
        this.ui.breakBase.textContent = Utils.formatCurrency(basePricePerGram, 'USD');
        this.ui.breakPurityPct.textContent = `${purityPct}%`;
        this.ui.breakAdjusted.textContent = Utils.formatCurrency(adjustedPricePerGram, 'USD');
        
        this.ui.breakMarginLabel.textContent = operation === 'venta' 
            ? `Margen de la casa de compra (-${marginPct}%):` 
            : `Margen de la joyería por fabricación/venta (+${marginPct}%):`;
            
        this.ui.breakFinal.textContent = Utils.formatCurrency(finalPricePerGram, 'USD');

        // 7. Texto Narrativo Final
        const unitText = unit === 'oz' ? 'onzas troy' : 'gramos';
        const purityText = `${purityK}k`; // ← CORRECCIÓN: Ya no usamos el select, usamos el valor directo
        const opText = operation === 'venta' ? 'VENTA' : 'COMPRA';
        
        this.ui.narrative.innerHTML = `
            El valor estimado para la <strong>${opText}</strong> de <strong>${amount} ${unitText}</strong> 
            de oro <strong>${purityText}</strong> es de:<br>
            <span style="font-size: 1.5rem; color: var(--warning); display: block; margin-top: 8px;">
                ${Utils.formatCurrency(totalValue, 'USD')}
            </span>
        `;
    }
}