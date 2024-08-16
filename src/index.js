const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGODB_URI

try {
    mongoose.connect(mongoURI);
    console.log("conectado a mongodb")
} catch (error) {
    console.log("error en conexion", error)
}

const libroSchema = new mongoose.Schema({
    titulo: String,
    autor: String,
})

const Libro = mongoose.model("Libro", libroSchema)


// autorizaciones
app.use((req, res, next) => {
    const authToken = req.headers["authorization"];
    if (authToken === "miTokenSecreto123") {
      next();
    } else {
      res.status(401).send("Acceso no autorizado");
    }
  });

//cargar libro
app.post("/libros", async (req,res) => {
    const libro = new Libro ({
        titulo: req.body.titulo,
        autor: req.body.autor,
    })

    try {
        await libro.save();
        res.json(libro);        
    } catch (error) {
        res.status(500).send("Error al guardar libro", error)
    }
})


//obtener libro
app.get("/libros", async (req,res) => {
    try {
        const libros = await Libro.find()
        res.json(libros)
    } catch (error) {
        res.status(500).send("Error al obtener libros" , error)
    }
})

//actualizar libro
app.put("/libros/:id", async (req, res) => {
    try {
      let id = req.params.id;
      const libro = await Libro.findByIdAndUpdate(
        id,
        { titulo: req.body.titulo, autor: req.body.autor },
        { new: true }
      );
      if (libro) {
        res.json(libro);
      } else {
        res.status(404).send("Libro no encontrado");
      }
    } catch (error) {
      res.status(500).send("Error al actualizar el libro", error);
    }
  });

//eliminar libro
app.delete("/libros/:id", async (req, res) => {
    try {
      const libro = await Libro.findByIdAndRemove(req.params.id);
      if (libro) {
        res.status(204).send();
      } else {
        res.status(404).send("Libro no encontrado");
      }
    } catch (error) {
      res.status(500).send("Error al eliminar el libro");
    }
  });

//consulta por id
app.get("/libros/:id", async (req,res) => {
    try {
        const libro = await Libro.findById(req.params.id)
        if(libro){
            res.json(libro);
        }
        else{
            res.status(404).send("libro no encontrado");
        }
    } catch (error) {
        res.status(500).send("Error al consnultar el libro");
    }
})

app.listen(3000, () => {
    console.log("El servidor esta ejecutandose en http://localhost/3000/")
})