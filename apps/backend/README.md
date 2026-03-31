# Cómo configurar el entorno de desarrollo

Este proyecto usa MySQL como sistema de gestión de base de datos. El backend de la web se conecta a una base de datos llamada `tesis` que debe contener la estructura y datos necesarios para el funcionamiento del sistema.

## MySQL

Instala MySQL Server en tu sistema:

```bash
sudo apt update -y && sudo apt upgrade -y && sudo apt install -y mysql-server
```

El comportamiento del servicio MySQL varía según el entorno. En Ubuntu, inicia el servicio y configúralo para que se ejecute automáticamente:

```bash
sudo systemctl start mysql.service
sudo systemctl enable mysql.service
```

En GitHub Codespaces, usa el comando de servicio:

```bash
sudo service mysql start
```

En Codespaces deberás ejecutar este comando cada vez que abras el workspace, ya que los servicios no persisten entre sesiones.

> [!CAUTION]
> Si no inicias el servicio e intentas ejecutar `sudo mysql`, es probable que te encuentres con este error:
>
> ```bash
> ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)
> ```

Una vez que MySQL esté ejecutándose, accede al cliente MySQL como administrador:

```bash
sudo mysql
```

Ejecuta los siguientes comandos SQL para crear la base de datos (por ahora estará vacía) y configurar las credenciales (establecidas en [`connection.js`](connection.js)):

```sql
CREATE DATABASE tesis;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';
FLUSH PRIVILEGES;
```

Si obtienes un error de política de contraseñas (`ERROR 1819`)[^1], configura una política menos restrictiva antes de continuar:

```sql
SET GLOBAL validate_password.policy=LOW;
SET GLOBAL validate_password.length=4;
```

Luego vuelve a ejecutar el comando `ALTER USER`.

Estos comandos crean la base de datos que utiliza la aplicación, configuran el usuario root con autenticación compatible y establecen la contraseña definida en [`connection.js`](connection.js). El comando `FLUSH PRIVILEGES` aplica los cambios.

El proyecto incluye el archivo [`gmcan.sql`](gmcan.sql) con la estructura de tablas y datos de prueba iniciales. Para importarlo, ejecuta:

```bash
mysql -u root -p tesis < gmcan.sql
```

Cuando se solicite, ingresa la contraseña: `1234` (establecimos esta contraseña en el paso anterior).

Si este comando falla por permisos, usa una de estas alternativas:

+ **Opción 1** - Usando sudo (recomendado):

  ```bash
  sudo mysql -u root -p tesis < gmcan.sql
  ```

+ **Opción 2** - Conexión TCP/IP:

  ```bash
  mysql -u root -p -h 127.0.0.1 tesis < gmcan.sql
  ```

Para desarrollo local, la aplicación utiliza estas credenciales:

| Campo      | Valor       |
|------------|-------------|
| Usuario    | `root`      |
| Contraseña | `1234`      |
| Base datos | `tesis`     |
| Host       | `localhost` |

> [!WARNING]  
> Estas credenciales son únicamente para desarrollo local

## Configuración del proyecto

Instala Bun como gestor de paquetes. Si deseas utilizar Node, puedes omitir este paso:

```bash
curl -fsSL https://bun.sh/install | bash
```

Instala las dependencias:

```bash
bun install
# o con npm
npm install
```

Para iniciar el servidor de desarrollo:

```bash
bun server.js
# o con Node.js
node server.js
```

Para verificar que MySQL está funcionando correctamente, ejecuta:

```bash
sudo mysql -u root -p -e "USE tesis; SHOW TABLES;"
```

Deberías ver las tablas importadas desde `gmcan.sql`.

Para tareas de desarrollo, estos comandos pueden serte útiles:

+ Conectarse a MySQL (no necesitas hacer esto normalmente, ya que el backend se conecta automáticamente):

  ```bash
  sudo mysql -u root -p
  ```

+ Verificar estado del servicio:

  ```bash
  sudo systemctl status mysql.service
  ```

+ Reiniciar MySQL si es necesario:

  ```bash
  sudo systemctl restart mysql.service
  ```

[^1]: El error completo es `ERROR 1819 (HY000): Your password does not satisfy the current policy requirements`
