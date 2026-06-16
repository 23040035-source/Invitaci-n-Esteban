const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ==========================================
   FRONTEND
========================================== */

app.use(express.static(path.join(__dirname, "public")));

/* ==========================================
   SQLITE
========================================== */

const db = new sqlite3.Database(
  path.join(__dirname, "database.db"),
  (err) => {
    if (err) {
      console.error("Error SQLite:", err.message);
    } else {
      console.log("SQLite conectado");
      inicializarBaseDatos();
    }
  }
);

/* ==========================================
   CREAR TABLAS
========================================== */

function inicializarBaseDatos() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS asistentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        asistentes INTEGER NOT NULL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id INTEGER PRIMARY KEY,
        password_admin TEXT NOT NULL
      )
    `);

    db.get(
      "SELECT COUNT(*) AS total FROM configuracion",
      [],
      (err, row) => {
        if (err) {
          console.error(err.message);
          return;
        }

        if (row.total === 0) {
          db.run(
            `
            INSERT INTO configuracion
            (id, password_admin)
            VALUES (1, 'admin123')
            `
          );

          console.log("Contraseña inicial creada");
        }
      }
    );

    console.log("Base de datos inicializada");
  });
}

/* ==========================================
   VALIDACIONES
========================================== */

function validarNombre(nombre) {
  if (!nombre) return false;

  if (typeof nombre !== "string") return false;

  if (nombre.trim().length < 2) return false;

  return true;
}

function validarAsistentes(cantidad) {
  if (
    cantidad === undefined ||
    cantidad === null
  ) {
    return false;
  }

  const numero = parseInt(cantidad);

  if (isNaN(numero)) return false;

  if (numero < 1) return false;

  if (numero > 20) return false;

  return true;
}

/* ==========================================
   LOGIN ADMIN
========================================== */

app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Contraseña requerida"
    });
  }

  db.get(
    `
    SELECT *
    FROM configuracion
    WHERE id = 1
    `,
    [],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error interno"
        });
      }

      if (
        row &&
        row.password_admin === password
      ) {
        return res.json({
          success: true,
          message: "Acceso autorizado"
        });
      }

      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta"
      });
    }
  );
});

/* ==========================================
   CONFIRMAR ASISTENCIA
========================================== */

app.post("/confirmar", (req, res) => {
  const {
    nombre,
    asistentes
  } = req.body;

  if (!validarNombre(nombre)) {
    return res.status(400).json({
      success: false,
      message: "Nombre inválido"
    });
  }

  if (!validarAsistentes(asistentes)) {
    return res.status(400).json({
      success: false,
      message: "Cantidad inválida"
    });
  }

  db.run(
    `
    INSERT INTO asistentes
    (
      nombre,
      asistentes
    )
    VALUES (?, ?)
    `,
    [
      nombre.trim(),
      parseInt(asistentes)
    ],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      return res.status(201).json({
        success: true,
        id: this.lastID,
        message: "Asistencia registrada"
      });
    }
  );
});

/* ==========================================
   ADMIN ASISTENTES
========================================== */

app.get("/admin/asistentes", (req, res) => {
  db.all(
    `
    SELECT *
    FROM asistentes
    ORDER BY fecha_registro DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json(rows);
    }
  );
});

/* ==========================================
   ESTADÍSTICAS
========================================== */

app.get("/admin/estadisticas", (req, res) => {
  db.get(
    `
    SELECT
      COUNT(*) AS registros,
      COALESCE(SUM(asistentes), 0) AS personas
    FROM asistentes
    `,
    [],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        registros: row.registros,
        personas: row.personas
      });
    }
  );
});

/* ==========================================
   ELIMINAR REGISTRO
========================================== */

app.delete("/admin/asistentes/:id", (req, res) => {
  const id = req.params.id;

  db.run(
    `
    DELETE FROM asistentes
    WHERE id = ?
    `,
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        deleted: this.changes
      });
    }
  );
});

/* ==========================================
   EXPORTAR CSV
========================================== */

app.get("/admin/exportar-csv", (req, res) => {
  db.all(
    `
    SELECT *
    FROM asistentes
    ORDER BY fecha_registro DESC
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      let csv = "ID,Nombre,Asistentes,Fecha\n";

      rows.forEach((item) => {
        csv += `${item.id},"${item.nombre}",${item.asistentes},"${item.fecha_registro}"\n`;
      });

      res.header("Content-Type", "text/csv");
      res.attachment("asistentes.csv");
      res.send(csv);
    }
  );
});

/* ==========================================
   CONFIGURACIÓN
========================================== */

app.get("/configuracion", (req, res) => {
  db.get(
    `
    SELECT id
    FROM configuracion
    LIMIT 1
    `,
    [],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false
        });
      }

      res.json(row);
    }
  );
});

/* ==========================================
   HEALTH CHECK
========================================== */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    proyecto: "Invitación Esteban",
    estado: "online"
  });
});

/* ==========================================
   INDEX
========================================== */

app.get("*", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});

/* ==========================================
   START
========================================== */

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});