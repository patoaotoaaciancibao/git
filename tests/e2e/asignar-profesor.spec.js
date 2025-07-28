const { test, expect } = require('@playwright/test');

test('Asignar profesor y verificar actualización en UI pública', async ({ page }) => {
    let cursoValue = '18';         // ID de curso predefinido sin asignar
    let profesorValue = '10';      // ID de profesor sin asignaciones
    let nombreProfesor = 'Gaby QA'; // nombre visible del profesor (como figura en la home)
    let cantidadInicial = 0;

    await test.step('Paso 1 - Ir a la vista pública y contar profesores', async () => {
        await page.goto('http://localhost:3000/public/home');
        cantidadInicial = await page.locator('.team-item').count();
        console.log("👀 Profesores visibles inicialmente:", cantidadInicial);
    });

    await test.step('Paso 2 - Login como administrador', async () => {
        await page.goto('http://localhost:3000/acceso');
        await page.click('a[href="/admin-login"]');
        await page.fill('input[name="email"]', 'gaby.gonza@gmail.com');
        await page.fill('input[name="password"]', '123456');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/.*admin\/home/);
    });

    await test.step('Paso 3 - Ir a vista de asignar profesor', async () => {
        await page.click('a[href="/admin/listado-profesores"]');
        await page.click('a[href="/admin/asignar-profesor"]');
        await page.waitForSelector('select[name="id_curso"]');
        await page.waitForSelector('select[name="id_usuario"]');
    });

    await test.step('Paso 4 - Seleccionar curso y profesor', async () => {
        const cursoOptions = page.locator('select[name="id_curso"] option');
        const profesorOptions = page.locator('select[name="id_usuario"] option');

        const cursoCount = await cursoOptions.count();
        const profesorCount = await profesorOptions.count();

        if (cursoCount < 2 || profesorCount < 2) {
            test.skip(true, 'No hay suficientes cursos o profesores disponibles para asignar.');
            return;
        }

        cursoValue = await cursoOptions.nth(1).getAttribute('value');
        profesorValue = await profesorOptions.nth(1).getAttribute('value');
        nombreProfesor = await profesorOptions.nth(1).textContent(); // ahora guarda nombre completo

        console.log("🧪 Curso:", cursoValue, "Profesor:", profesorValue);
        console.log("🔎 Nombre completo del profesor:", nombreProfesor?.trim());

        if (!cursoValue || !profesorValue) throw new Error("Faltan datos");

        await page.selectOption('select[name="id_curso"]', cursoValue);
        await page.selectOption('select[name="id_usuario"]', profesorValue);
        await page.click('button[type="submit"]');
        await expect(page.locator('.alert-success')).toBeVisible();
    });


    await test.step('Paso 5 - Verificar que aparece en la vista pública', async () => {
        await page.goto('http://localhost:3000/public/home');
        await page.waitForTimeout(2000);

        const cantidadFinal = await page.locator('.team-item').count();
        console.log("👀 Profesores visibles final:", cantidadFinal);

        expect(cantidadFinal).toBe(cantidadInicial + 1);

        const profesorVisible = page.locator('.team-item').filter({
            hasText: nombreProfesor.trim()
        });

        await expect(profesorVisible).toHaveCount(1);
    });


    await test.step('Paso 6 - Verificar que aparece en la vista pública', async () => {
        await page.goto('http://localhost:3000/public/home');
        await page.waitForTimeout(1000); // animación si aplica
        const cantidadFinal = await page.locator('.team-item').count();
        console.log("👀 Profesores visibles final:", cantidadFinal);

        expect(cantidadFinal).toBe(cantidadInicial + 1);

        const profesorVisible = page.locator('.team-item').filter({ hasText: nombreProfesor.trim() });
        await expect(profesorVisible).toHaveCount(1);
    });
});
