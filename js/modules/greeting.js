// Manejo de modal de saludo
export class Greeting {
    constructor() {
        this.modalId = 'modalSaludo';
        this.storageKey = 'greetingShown';
    }

    /**
     * Muestra el saludo si no se ha mostrado antes en esta sesión
     */
    show() {
        const alreadyShown = sessionStorage.getItem(this.storageKey);
        
        if (alreadyShown) {
            console.log('ℹ️ Greeting already shown in this session');
            return;
        }

        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.add('active');
            sessionStorage.setItem(this.storageKey, 'true');
            console.log('✅ Greeting modal shown');
        } else {
            console.warn('⚠️ Greeting modal not found in DOM');
        }
    }

    /**
     * Cierra el modal de saludo
     */
    close() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('active');
            console.log('✅ Greeting modal closed');
        }
    }

    /**
     * Configura event listeners
     */
    setupListeners() {
        // Buscar botón dentro del modal
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const closeBtn = modal.querySelector('button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
            console.log('✅ Greeting close button listener added');
        } else {
            console.warn('⚠️ Greeting close button not found');
        }

        // Cerrar al hacer clic fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });
    }
}