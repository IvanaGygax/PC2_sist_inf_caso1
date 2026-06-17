// 1. Configuración - URL SIN '/rest/v1/'
const supabaseUrl = 'https://ewirvwtndgfjibntxegc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aXJ2d3RuZGdmamlibnR4ZWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjEwMTUsImV4cCI6MjA5NzI5NzAxNX0.i3eIIp4h-oMZdh2_HfWUDhLBOVQMrvyhkUtf0pafDlQ';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. Función maestra para cargar todos los catálogos
async function cargarCatalogos() {
    console.log("Iniciando carga de datos...");
    
    // Lista de tablas y sus respectivos IDs en el HTML
    const configuracion = [
        { tabla: 'sexos', id: 'sexo_select' },
        { tabla: 'grados_academicos', id: 'grado_select' },
        { tabla: 'carreras_interes', id: 'carrera_select' },
        { tabla: 'modalidades_estudio', id: 'modalidad_select' }
    ];

    for (let conf of configuracion) {
        const { data, error } = await supabase.from(conf.tabla).select('*');
        
        if (error) {
            console.error(`Error al cargar ${conf.tabla}:`, error.message);
            continue; // Pasa a la siguiente tabla si una falla
        }

        const el = document.getElementById(conf.id);
        if (el) {
            el.innerHTML = '<option value="">Seleccione...</option>';
            data.forEach(item => {
                el.innerHTML += `<option value="${item.id}">${item.nombre}</option>`;
            });
        }
    }

    // Cargar también el filtro
    const { data: sexos } = await supabase.from('sexos').select('*');
    const filtro = document.getElementById('filtro_sexo');
    if (filtro) {
        filtro.innerHTML = '<option value="">Todos</option>';
        sexos.forEach(s => filtro.innerHTML += `<option value="${s.id}">${s.nombre}</option>');
    }
    console.log("Carga de catálogos finalizada.");
}

// 3. Listar postulantes
async function listarPostulantes(sexoId = "") {
    let query = supabase.from('postulantes').select('*, sexos(nombre), grados_academicos(nombre), carreras_interes(nombre), modalidades_estudio(nombre)');
    
    if (sexoId) query = query.eq('sexo_id', sexoId);
    
    const { data, error } = await query;
    if (error) {
        console.error("Error al listar:", error.message);
        return;
    }

    const tbody = document.querySelector('#tablaPostulantes tbody');
    tbody.innerHTML = '';
    
    data.forEach(p => {
        tbody.innerHTML += `<tr>
            <td>${p.nombres} ${p.apellidos}</td>
            <td>${p.dni}</td>
            <td>${p.correo}</td>
            <td>${p.sexos?.nombre || 'N/A'}</td>
            <td>${p.grados_academicos?.nombre || 'N/A'}</td>
            <td>${p.carreras_interes?.nombre || 'N/A'}</td>
            <td>${p.modalidades_estudio?.nombre || 'N/A'}</td>
        </tr>`;
    });
}

// 4. Registro de datos
document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('postulantes').insert([{
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        dni: document.getElementById('dni').value,
        correo: document.getElementById('correo').value,
        celular: document.getElementById('celular').value,
        edad: parseInt(document.getElementById('edad').value),
        sexo_id: document.getElementById('sexo_select').value,
        grado_id: document.getElementById('grado_select').value,
        carrera_id: document.getElementById('carrera_select').value,
        modalidad_id: document.getElementById('modalidad_select').value,
        observaciones: document.getElementById('observaciones').value
    }]);

    if (error) alert('Error: ' + error.message);
    else {
        alert('Registrado correctamente');
        listarPostulantes();
    }
});

// 5. Inicialización
document.getElementById('filtro_sexo').addEventListener('change', (e) => listarPostulantes(e.target.value));

cargarCatalogos();
listarPostulantes();