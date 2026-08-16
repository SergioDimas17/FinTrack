package com.fintrack.web.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.SelectOption;

public class TransferPage {
    private final Page page;

    public TransferPage(Page page) {
        this.page = page;
    }

    public Locator transferNavigationButton() {
        return page.locator("button:has-text('Transferir'):visible, a:has-text('Transferir'):visible, button:has(svg.lucide-arrow-right-left):visible").first();
    }

    public Locator sourceAccountSelect() {
        return page.locator("[data-testid='source-account'], select#source-account, select").first();
    }

    public Locator destinationAccountInput() {
        return page.locator("[data-testid='destination-account'], input[placeholder*='cuenta' i], input[type='text']").first();
    }

    public Locator searchButton() {
        return page.locator("button:has-text('Buscar')").first();
    }

    public Locator amountInput() {
        return page.locator("[data-testid='amount-input'], input[type='number'], input[name='amount']").first();
    }

    // ACTUALIZADO: Selector más estricto buscando explícitamente "Ejecutar transferencia" visible
    public Locator submitButton() {
        return page.locator("button[type='submit']:has-text('Ejecutar transferencia'):visible, button:has-text('Ejecutar transferencia'):visible").first();
    }

    public Locator successMessage() {
        return page.locator("[data-testid='success-message'], .alert-success, [role='status'], [role='alert'], .bg-green-100, .bg-green-500, .text-green-600, .text-green-500, div:has-text('exitosa'), div:has-text('éxito'), div:has-text('completada'), div:has-text('exitoso'), p:has-text('éxito')").first();
    }

    public Locator errorMessage() {
        return page.locator("[data-testid='error-message'], .error, [role='alert'], .text-red-500").first();
    }

    public Locator newTransferResetButton() {
        return page.locator("button:has-text('Nueva transferencia')").first();
    }

    public void openTransferSection() {
        Locator navBtn = transferNavigationButton();
        navBtn.waitFor(new Locator.WaitForOptions().setTimeout(15000));
        navBtn.scrollIntoViewIfNeeded();
        navBtn.click();

        try {
            destinationAccountInput().waitFor(new Locator.WaitForOptions().setTimeout(10000));
        } catch (Exception ignored) {}

        if (successMessage().isVisible() && newTransferResetButton().isVisible()) {
            newTransferResetButton().click();
        }
    }

    public void fillTransfer(String source, String destination, String amount) {
        // 1. Esperar y seleccionar la cuenta de origen
        Locator select = sourceAccountSelect();
        select.waitFor(new Locator.WaitForOptions().setTimeout(10000));
        select.click(); 

        try {
            page.waitForSelector("select option:not([value=''])", new Page.WaitForSelectorOptions().setTimeout(5000));
        } catch (Exception ignored) {}

        try {
            Locator optionToSelect = select.locator(String.format("option:has-text('%s')", source)).first();
            String realValueUUID = optionToSelect.getAttribute("value");
            
            if (realValueUUID != null && !realValueUUID.isEmpty()) {
                select.selectOption(realValueUUID);
            } else {
                throw new RuntimeException("No se encontró el UUID");
            }
        } catch (Exception e) {
            try {
                select.selectOption(new SelectOption().setIndex(1));
            } catch (Exception ignored) {}
        }

        // 2. Ingresar la cuenta de destino
        Locator destInput = destinationAccountInput();
        destInput.waitFor(new Locator.WaitForOptions().setTimeout(5000));
        destInput.click();
        destInput.fill(destination);

        // 3. Buscar/validar la cuenta
        Locator searchBtn = searchButton();
        if (searchBtn.isVisible()) {
            searchBtn.click();
            page.waitForTimeout(1000); 
        }

        // 4. Ingresar el monto Y QUITAR EL FOCO (.blur) PARA ACTIVAR LA VALIDACIÓN DE REACT
        Locator amtInput = amountInput();
        amtInput.waitFor(new Locator.WaitForOptions().setTimeout(5000));
        amtInput.click();
        amtInput.fill(amount);
        amtInput.blur(); // <--- CRUCIAL: Fuerza a React a validar el formulario y habilitar el botón
        page.waitForTimeout(500); // Pequeña pausa para que el DOM se actualice y se habilite el botón
    }

    // ACTUALIZADO: Forzar el scroll y el clic para evadir opacidades
    public void submit() {
        Locator btn = submitButton();
        btn.scrollIntoViewIfNeeded();
        btn.waitFor(new Locator.WaitForOptions().setTimeout(5000));
        btn.click(new Locator.ClickOptions().setForce(true)); // <--- Forzamos el clic
    }

    public void transfer(String source, String destination, String amount) {
        fillTransfer(source, destination, amount);
        submit();
    }

    public boolean isSuccessVisible() {
        try {
            successMessage().waitFor(new Locator.WaitForOptions().setTimeout(15000));
            return successMessage().isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isErrorVisible() {
        try {
            errorMessage().waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return errorMessage().isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isSourceAccountSelectVisible() {
        try {
            sourceAccountSelect().waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return sourceAccountSelect().isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isDestinationInputVisible() {
        try {
            destinationAccountInput().waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return destinationAccountInput().isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAmountInputVisible() {
        try {
            amountInput().waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return amountInput().isVisible();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isSubmitButtonVisible() {
        try {
            submitButton().waitFor(new Locator.WaitForOptions().setTimeout(5000));
            return submitButton().isVisible();
        } catch (Exception e) {
            return false;
        }
    }
}