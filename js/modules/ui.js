// Manejo de interfaz de usuario
import { Utils } from './utils.js';

export class UI {
    /**
     * Muestra estado de carga
     */
    static showLoading(elementId, message = 'Cargando...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="loading-state">${message}</div>`;
        }
    }

    /**
     * Actualiza elemento con tasa de cambio
     */
    static updateRateDisplay(elementId, data, label = '1 USD =') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const dateTime = Utils.formatDateTime();
        element.innerHTML = `
            <strong class="titulo-valor">${label}</strong>
            <span class="valor-moneda">${data.promedio.toFixed(2)} Bs</span><br>
            <strong class="titulo-actualizacion">Última actualización:</strong><br>
            <span class="fecha-hora">${dateTime.completo}</span>
        `;
    }

    /**
     * Actualiza display de TRM
     */
    static updateTRMDisplay(elementId, trm) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const dateTime = Utils.formatDateTime();
        element.innerHTML = `
            <p class="titulo-valor">
                1 USD = <span class="valor-moneda">${Utils.formatCurrency(trm, 'COP')}</span>
            </p>
            <p class="titulo-actualizacion">
                Última actualización:<br>
                <span class="fecha-hora">${dateTime.completo}</span>
            </p>
        `;
    }

    /**
     * Actualiza factor de conversión
     */
    static updateFactorDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.innerText = value.toFixed(4);
        element.classList.remove('text-danger');
        element.classList.add('text-primary');
    }

    /**
     * Muestra error en elemento
     */
    static showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<span class="text-danger">Error: ${message}</span>`;
            element.classList.remove('text-primary');
            element.classList.add('text-danger');
        }
    }

    /**
     * Muestra toast notification
     */
    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Actualiza resultado de conversión
     */
    static updateConversionResult(elementId, amount, fromCurrency, result, toCurrency) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const formattedAmount = Utils.formatNumber(amount, 'es-CO');
        const formattedResult = Utils.formatNumber(result, 'es-CO');
        
        element.textContent = `${formattedAmount} ${fromCurrency} = ${formattedResult} ${toCurrency}`;
    }

    /**
     * Agrega item al historial en DOM
     */
    static addHistoryItem(listId, text) {
        const list = document.getElementById(listId);
        if (!list) return;

        const item = document.createElement('li');
        item.textContent = text;
        list.appendChild(item);
    }

    /**
     * Toggle visibility de elemento
     */
    static toggleVisibility(elementId, show = true) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Muestra valores cargados con animación
     */
    static showLoadedValue(containerId, value) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loading = container.querySelector('.loading-placeholder');
        const valueSpan = container.querySelector('.value-placeholder');
        
        if (loading) loading.classList.add('d-none');
        if (valueSpan) {
            valueSpan.textContent = value;
            valueSpan.classList.remove('d-none');
            valueSpan.classList.add('show');
        }
    }
}