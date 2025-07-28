const request = require('supertest');
const cheerio = require('cheerio');
const app = require('../../app');

describe('🧪 [R5-5] Test E2E: Categorías populares y cursos por categoría', () => {
    let categorias = [];

    it('🔗 GET /public/home - Extrae categorías populares', async () => {
        const res = await request(app).get('/public/home');
        expect(res.statusCode).toBe(200);

        const $ = cheerio.load(res.text);

        $('a[href^="/categoria/"]').each((i, el) => {
            const href = $(el).attr('href');
            const idCategoria = href.split('/').pop();

            const cantidadTexto = $(el).find('small.text-primary').text(); // ej: "4 Courses"
            const cantidadCursos = parseInt(cantidadTexto.split(' ')[0]);

            if (!isNaN(cantidadCursos)) {
                categorias.push({ id: idCategoria, cantidad: cantidadCursos });
            }
        });
        expect(categorias.length).toBeGreaterThan(0);
        expect(categorias.length).toBeLessThanOrEqual(4);
    });

    it('📂 Verifica que la cantidad de cursos en cada categoría coincida', async () => {
        for (const categoria of categorias) {
            const res = await request(app).get(`/categoria/${categoria.id}`);
            expect(res.statusCode).toBe(200);

            const $ = cheerio.load(res.text);

            // ✅ Buscar las tarjetas a partir de la card-title
            // Solo tomamos títulos de cursos válidos
            const cursosEnVista = $('h5.card-title')
                .map((_, el) => $(el).text().trim())
                .get();
            expect(cursosEnVista.length).toBe(categoria.cantidad);

        }
    });
});
