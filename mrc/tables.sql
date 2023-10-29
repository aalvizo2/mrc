CREATE TABLE IF NOT EXISTS ventas(
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(255),
    producto VARCHAR(255),
    precio INT(255),
    cantidad INT(255),
    fecha DATE,
    total INT(255)
)