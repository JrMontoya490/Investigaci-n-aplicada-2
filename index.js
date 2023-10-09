const express = require('express');
const app = express();

app.listen(6000, () => {
    console.log('Server on port 5000');
});

/*app.get(‘/’, (req, res) => {
    res.send(‘Hola mundo’);
});*/

//Conexion con el archivo json
const pensumData = require('./datos.json');


//Importante
const bodyParser = require('body-parser');  // Importamos body-parser para trabajar con el cuerpo de las solicitudes

app.use(bodyParser.json());  // Middleware para interpretar JSON en las solicitudes



//RUTAS
//Ruta para prerrequisitos
app.get('/prerrequisitos/:codigo', (req, res) => {
    const codigoMateria = req.params.codigo;

    const materia = encontrarMateriaPorCodigo(codigoMateria);
    if (materia) {
        res.json({ prerrequisitos: materia.prerrequisitos });
    } else {
        res.status(404).json({ error: 'Materia no encontrada' });
    }
});



//Ruta para consultar materias por Ciclos
app.get('/materias/:carrera/:ciclo', (req, res) => {
    const carrera = req.params.carrera;
    const ciclo = req.params.ciclo;

    //Verifica que la carrera y ciclo son correctos
    if (!(carrera in pensumData.ciclos) || !(ciclo in pensumData.ciclos[carrera])) {
        return res.status(404).json({ error: 'Carrera ociclo no encontrados '});
    }

    const materiaPorCiclo = pensumData.ciclos[carrera][ciclo];

    res.json({ materias: materiaPorCiclo });
});



// Ruta para inscripción de materias
app.post('/inscripcion/:carrera', (req, res) => {
    const carrera = req.params.carrera;
    const materiasInscripcion = req.body.materias;

    // Verifica si la carrera es válida
    if (!(carrera in pensumData)) {
        return res.status(404).json({ error: 'Carrera no encontrada' });
    }

    // Verifica si se proporcionaron materias para inscripción
    if (!materiasInscripcion || materiasInscripcion.length !== 4) {
        return res.status(400).json({ error: 'Se deben proporcionar 3 materias para la inscripción' });
    }

    const uvRequeridas = 16;  // Asumiendo que se necesitan 19 UV en total para la inscripción

    const uvTotales = calcularUVTotales(materiasInscripcion, carrera);

    if (uvTotales < uvRequeridas) {
        return res.status(400).json({ error: `Se requieren exactamente ${uvRequeridas} UV para la inscripción` });
    }

    res.json({ mensaje: 'Inscripción exitosa de materias', materiasInscritas: materiasInscripcion });
});



// Ruta delete de inscripciones de las materias
app.delete('/eliminar/:carrera', (req, res) => {
    const carrera = req.params.carrera;
    const materiasEliminar = req.body.materias;

    // verificaremos si la carrera es valida
    if (!(carrera in pensumData)) {
        return res.status(404).json({ error: 'Carrera no encontrada' });
    }

    // verificamos si hay materias para eliminar
    if (!materiasEliminar || materiasEliminar.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron materias para eliminar' });
    }

    // proceso para poder eliminar las materias que fueron inscritas
    const materiasInscritas = obtenerMateriasInscritas(carrera); 

    for (const materiaEliminar of materiasEliminar) {
        const index = materiasInscritas.indexOf(materiaEliminar);
        if (index !== -1) {
            materiasInscritas.splice(index, 1); // Elimina la materia de la lista
        }
    }

    actualizarMateriasInscritas(carrera, materiasInscritas);

    res.json({ mensaje: 'Eliminación de materias inscritas con exitosa', materiasEliminadas: materiasEliminar });
});





//FUNCIONES
//Funcion encuentra una materia por su nombre
function encontrarMateriaPorCodigo(codigo) {
    for (const carrera in pensumData) {
        const materia = pensumData[carrera].find(materia => materia.codigo === codigo);
        if (materia) {
            return materia;
        }
    }
    return null;
}


// Función para calcular las UV totales de las materias a inscribir
function calcularUVTotales(materias, carrera) {
    let uvTotales = 0;

    // Suma las UV de cada materia
    for (const materia of materias) {
        const materiaData = pensumData[carrera].find(m => m.nombre === materia);
        if (materiaData) {
            uvTotales += materiaData.uv;
        }
    }

    return uvTotales;
}


function obtenerMateriasInscritas(carrera) {
    return [];
}

function actualizarMateriasInscritas(carrera, materiasInscritas) {
}



