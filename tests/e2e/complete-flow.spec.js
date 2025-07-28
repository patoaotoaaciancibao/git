// tests/e2e/complete-flow.spec.ts
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
dotenv.config();

// Función auxiliar para escapar caracteres especiales de RegExp en un string
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the matched substring
}

test.describe('Flujo completo: registro alumno, logout, login admin, crear curso y asignar profesor', () => {
  const BASE = 'http://localhost:3000';
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'gaby.gonza@gmail.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

  test('Registro, login alumno, logout, login admin, crear curso y asignar profesor', async ({ page }) => {
    // 1) Generar usuario único
    const id = faker.string.uuid().substring(0, 8);
    const user = {
      nombre: `Test${id}`,
      apellido: `User${id}`,
      email: `test+${id}@example.com`,
      password: `P@ssword${faker.string.alphanumeric(4)}!${faker.number.int({ min: 10, max: 99 })}`
    };
    console.log('🆕 Usuario generado:', user);
    console.log('Contraseña generada (solo para depuración):', user.password);

    // 2) Registro de alumno
    await page.goto(`${BASE}/public/home`);
    await page.getByRole('link', { name: 'Registrarse', exact: true }).click();
    await expect(page).toHaveURL(/\/registro$/);
    await page.fill('input[name="nombre"]', user.nombre);
    await page.fill('input[name="apellido"]', user.apellido);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="confirmar"]', user.password);
    const btnRegistrar = page.getByRole('button', { name: /^Registrarme$/i });
    await expect(btnRegistrar).toBeEnabled();
    await btnRegistrar.click();
    await expect(page.getByText('Usuario creado exitosamente')).toBeVisible({ timeout: 10000 });
    console.log('✅ Registro OK');

    // 3) Login alumno
    await page.getByRole('link', { name: ' Inicia Sesión', exact: true }).click();
    await expect(page).toHaveURL(/\/acceso$/);
    await page.getByRole('link', { name: 'Soy Usuario' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.getByRole('button', { name: /^Ingresar$/ }).click();
    await expect(page).toHaveURL(/\/auth\/home$/);
    await page.screenshot({ path: `screenshots/alumno-home-${id}.png` });
    console.log('✅ Login alumno OK');

    // 4) Logout alumno
    await page.click('a[data-bs-toggle="dropdown"]');
    const logoutLink = page.getByRole('link', { name: ' Cerrar Sesión', exact: true });
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();
    await expect(page).toHaveURL(/\/public\/home/);
    console.log('✅ Logout alumno OK');

    // 5) Login admin
    await page.goto(`${BASE}/acceso`);
    await expect(page).toHaveURL(/\/acceso$/);
    await page.getByRole('link', { name: 'Soy Administrador' }).click();
    await expect(page).toHaveURL(/\/admin-login$/);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.getByRole('button', { name: /^Ingresar$/ }).click();
    await expect(page).toHaveURL(/\/admin\/home$/);
    console.log('✅ Login admin OK');

    // 6) Crear curso nuevo
    const cursoId = faker.string.uuid().substring(0, 6);
    const curso = { nombre: `CursoTest${cursoId}`, descripcion: 'Descripción prueba' };
    await page.getByRole('link', { name: 'Ir a Crear Curso' }).click();
    await expect(page).toHaveURL(/\/admin\/cursos\/crear$/);
    await page.fill('input[name="nombre"]', curso.nombre);
    await page.fill('textarea[name="descripcion"]', curso.descripcion);
    const btnGuardar = page.locator('button:has-text("Guardar Curso")');
    await expect(btnGuardar).toBeVisible();
    await expect(btnGuardar).toBeEnabled();
    await btnGuardar.click();
    await expect(page).toHaveURL(/\/admin\/home\?msg=curso-creado$/);
    await page.getByRole('link', { name: 'Ver lista de cursos' }).click();
    await expect(page).toHaveURL(/\/admin\/cursos$/);
    await expect(page.getByText(curso.nombre)).toBeVisible();
    console.log('✅ Curso creado OK');

    // 7) Asignar profesor al curso recién creado
    await page.goto(`${BASE}/admin/asignar-profesor`);
    await expect(page).toHaveURL(/\/admin\/asignar-profesor$/, { timeout: 10000 }); 
    console.log('✅ En la página correcta para asignar profesor.');

    await page.selectOption('select[name="id_curso"]', { label: curso.nombre });
    console.log(`✅ Curso seleccionado: ${curso.nombre}`);

    // --- PUNTO DE PAUSA PARA SELECCIÓN MANUAL DEL USUARIO ---
    console.log('--- ⏸️ TEST PAUSADO: Por favor, selecciona el USUARIO en el menú desplegable AHORA. ---');
    console.log('Luego, REANUDA el test desde el Inspector de Playwright. El test hará clic en "Asignar Usuario" automáticamente.');
    await page.pause(); 

    // Después de la pausa, el test asume que el usuario ya fue seleccionado manualmente.
    // Ahora, el test buscará y hará clic en el botón "Asignar Usuario".
    
    const btnAsignar = page.locator('button:has-text("Asignar Usuario")'); 
    await expect(btnAsignar).toBeVisible();
    await expect(btnAsignar).toBeEnabled();
    console.log('✅ Botón "Asignar Usuario" visible y habilitado.');
    
    // Hacemos clic en el botón "Asignar Usuario" y esperamos la URL final y el mensaje de éxito.
    await btnAsignar.click();
    console.log('✅ Botón "Asignar Usuario" clickeado automáticamente.');

    // Esperar explícitamente la URL final con el parámetro de query
    await expect(page).toHaveURL(/\/admin\/asignar-profesor\?msg=profesor-asignado$/, { timeout: 20000 });
    console.log(`✅ Verificado: La URL es la esperada después de la asignación exitosa.`);

    // FIX: Usar getByRole('alert') y luego getByText() para el contenido exacto del mensaje.
    // Esto es muy preciso y robusto, ya que se basa directamente en el HTML proporcionado.
    const successAlertContainer = page.getByRole('alert'); // Encuentra el div con role="alert"
    const successMessageElement = successAlertContainer.getByText('¡Usuario asignado correctamente!', { exact: true });

    try {
        await expect(successMessageElement).toBeVisible({ timeout: 15000 }); // Esperar a que el texto sea visible
        console.log('✅ Mensaje de asignación exitosa visible.');
    } catch (e) {
        console.error(`❌ ERROR: Mensaje de éxito no visible. Detalles: ${e.message}`);
        throw e; 
    }
    
    console.log('✅ Asignación OK — Test completo');

    // Captura final y fin del test
    await page.screenshot({ path: `screenshots/flow-completo-${id}.png` });
  });
});