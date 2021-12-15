# Workabout

Una aplicacion simple que permite realizar intercambios entre personas.
Para poder correr el proyecto se debe de contar con Node v12.xx en adelante y con python3.
Adicionalmente se debe de contar con VENV instalado mediante python
**Todos el procedimiento es mediante terminal, consola o emulador de consola**
### FrontEnd
* Entrar en la carpeta del proyecto y ejecutar `npm i` para poder instalar todas las dependencias del proyecto de Node.
* Despues, se deberá ejecutar `npm run start` para poder correr el cliente web
### Backend
* Para poder correr el back end, se deberá de abrir una nueva terminal o consola dentro de la carpeta "api" y ejecutar lo siguiente
	`python3 -m venv venv` Esto con la finalidad de crear un entorno virtual
	
	`source venv/bin/activate` Para poder activar el entorno virtual
	
	`python3 -m pip install -r req.txt` Para poder instalar las dependencias
	
* Una vez instaladas las dependencias, se debe de correr el servicio web. Se puede realizar de 2 maneras

	`uvicorn main:app --reload` Para poder iniciar el servidor en modo desarrollo y ver los LOGS a detalle. Ademas con la bandera "reload" el servidor se recargará cada que haya un cambio en los archivos.
	
	`python3 main.py` Ejecutamos directamente el servidor, el cual escuchará en la direccion y puerto asignados (0.0.0.0:8000)
