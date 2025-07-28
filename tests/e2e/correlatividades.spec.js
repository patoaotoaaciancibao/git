// tests/e2e/complete-flow.spec.js
const { test, expect } = require('@playwright/test');
const { faker }        = require('@faker-js/faker');
require('dotenv').config();

test.use({
  browserName: 'firefox',
  headless: false,
  viewport: { width: 1280, height: 800 },
});

test('Flujo completo: registro, login alumno, logout, login admin, crear curso y asignar profesor', async ({ page }) => {
  // 1) Generar datos únicos
  const uid      = faker.string.uuid().substring(0, 8);
  const alumno   = {
    nombre:   `Test${uid}`,
    apellido: `User${uid}`,
    email:    `test+${uid}@example.com`,
    password: 'Password123'
  };
  const curso    = {
    nombre:      `Curso E2E ${uid}`,
    descripcion: `Descripción de prueba ${uid}`
  };
  const ADMIN    = { email: 'gaby.gonza@gmail.com', password: '123456' };

  // 2) Registro alumno
  await page.goto('http://localhost:3000/public/home');
  await page.goto('http://localhost:3000/registro');
  await page.fill('input[name="nombre"]',    alumno.nombre);
  await page.fill('input[name="apellido"]',  alumno.apellido);
  await page.fill('input[name="email"]',     alumno.email);
  await page.fill('input[name="password"]',  alumno.password);
  await page.fill('input[name="confirmar"]', alumno.password);
  await page.click('button:has-text("Registrarse")');
  await expect(page.locator('text=Usuario creado exitosamente')).toBeVisible();

  // 3) Login alumno
  await page.click('text=Iniciar Sesión');
  await page.waitForURL('**/acceso');
  await page.click('button:has-text("Soy Usuario")');
  await page.waitForURL('**/login');
  await page.fill('input[name="email"]',    alumno.email);
  await page.fill('input[name="password"]', alumno.password);
  await page.click('button:has-text("Ingresar")');
  await page.waitForURL('**/public/home');
  await page.screenshot({ path: `screenshots/alumno-home-${uid}.png` });

  // 4) Logout alumno
  await page.goto('http://localhost:3000/auth/logout');
  await page.waitForURL('**/public/home**');

  // 5) Login admin
  await page.click('text=Iniciar Sesión');
  await page.waitForURL('**/acceso');
  await page.click('button:has-text("Soy Administrador")');
  await page.waitForURL('**/admin-login');
  await page.fill('input[name="email"]',    ADMIN.email);
  await page.fill('input[name="password"]', ADMIN.password);
  await page.click('button:has-text("Ingresar")');
  await page.waitForURL('**/admin/home');

  // 6) Crear curso
  await page.goto('http://localhost:3000/admin/cursos/crear');
  await page.fill('input[name="nombre"]',      curso.nombre);
  await page.fill('textarea[name="descripcion"]', curso.descripcion);
  // Si tienen un input[type=file], lo omitir o simular un archivo pequeño:
  // await page.setInputFiles('input[type="file"]', 'tests/fixtures/default.png');
  await page.click('button:has-text("Guardar Curso")');
  await page.waitForURL('**/admin/cursos/**/editar**');

  // 7) Asignar profesor (alumno) al curso creado
  await page.goto('http://localhost:3000/admin/asignar-profesor');
  await page.selectOption('select[name="id_curso"]',      { label: curso.nombre });
  await page.selectOption('select[name="id_usuario"]',    { label: `${alumno.nombre} ${alumno.apellido}` });
  await page.click('button:has-text("Asignar Usuario")');
  await expect(page.locator('.alert-success')).toContainText(/asignación/i);
  await page.screenshot({ path: `screenshots/asignacion-${uid}.png` });
});
