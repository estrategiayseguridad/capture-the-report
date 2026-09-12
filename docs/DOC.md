LINEAMIENTOS DE SEGURIDAD 
PARA LOS PARTICIPANTES EN LAS 
CÁMARAS DE COMPENSACIÓN BANCARIA Y AUTOMATIZADA 
 
 
MARCO DE REFERENCIA PARA LA 
SEGURIDAD DE LA INFORMACIÓN v2023 
 	 
LINEAMIENTOS DE SEGURIDAD PARA LOS PARTICIPANTES EN 
LAS CÁMARAS DE COMPENSACIÓN BANCARIA Y AUTOMATIZADA 
 
1.	Introducción. Este documento establece un conjunto de controles de seguridad obligatorios para los participantes en la Cámara de Compensación Bancaria (CCB) y en la Cámara de Compensación Automatizada (CCA). Los controles de seguridad aquí definidos se basan en normas y buenas prácticas de seguridad de la información que Imágenes Computarizadas de Guatemala, Sociedad Anónima           -ICG- ha establecido para que cada participante implemente en su infraestructura. Asimismo, se incluye una descripción de cada control de seguridad, que detalla el alcance que deberá considerarse en la implementación. 
 
2.	Marco legal. Los presentes lineamientos de seguridad para los participantes en la CCB y en la CCA, se emiten con fundamento en lo dispuesto en el Reglamento de la Cámara de Compensación Bancaria y en el Reglamento de la Cámara de Compensación Automatizada, aprobados por la Junta Monetaria. 
 
3.	Marco de referencia. Los lineamientos establecen un marco de referencia en relación a las normas y buenas prácticas en materia de seguridad de la información, que son internacionalmente aceptadas y que permiten minimizar los riesgos asociados a los sistemas de información utilizados para la operación de la CCB y de la CCA, que aseguren la gestión de la integridad, disponibilidad y 
confidencialidad de la información procesada y almacenada en dichos sistemas.  En adelante la CCB y la CCA podrán ser identificadas como las Cámaras de Compensación. 
 
4.	Objetivo. Asegurar que los participantes tengan un nivel aceptable de seguridad de la información, garantizar que la información que es enviada o compartida a las Cámaras de Compensación tenga un nivel aceptable de integridad, disponibilidad y confidencialidad; así como que los procesos que gestionan la información sean aprobados y monitoreados dentro del marco de seguridad de las buenas prácticas establecidas por instituciones como NIST, ISO o ISACA. 
 
5.	Alcance. Los controles de seguridad de la información deben ser de observancia para todas las instituciones que son participantes en las Cámaras de Compensación, operadas por ICG. 
 
6.	Responsabilidad del participante. La responsabilidad de los participantes en las Cámaras de Compensación es implementar los controles establecidos en los presentes lineamientos, que se relacionan con el fortalecimiento de la infraestructura tecnológica de las entidades participantes, utilizada para la interconexión con las citadas cámaras de compensación, lo que deberá realizarse con sus propios medios y recursos.  
 
 
7.	Definiciones. Para los efectos del presente documento, se establecen las definiciones siguientes: 
 
7.1	Acceso lógico: Es la principal línea de defensa para la mayoría de sistemas informáticos, permitiendo prevenir el ingreso de personas no autorizadas. Para controlar el acceso se emplean dos procesos: identificación y autenticación. 
 
7.2	Ambiente de desarrollo: Entorno en el cual se crea, modifica y depura el código fuente de un proyecto o aplicación. 
 
7.3	Ambiente de producción: Entorno en el cual se ejecuta la aplicación que utilizan los usuarios finales. 
 
7.4	Ambiente de pruebas: Entorno donde se configura el software y hardware para ejecutar los casos de experimento definidos, para ser probados en la aplicación de pruebas, y donde se utilizan datos ofuscados. 
 
7.5	Antimalware (anti-malware): Programa diseñado para prevenir, detectar y remediar software malicioso en los dispositivos informáticos individuales y sistemas de Tecnología de Información (TI). 
 
7.6	Áreas restringidas: Hace referencia a cualquier centro de datos, sala de servidores o cualquier área que aloje sistemas que almacenan procesos o transmitan datos de las Cámaras de Compensación. 
 
7.7	Autenticación multifactor (MFA): Es un sistema de seguridad que requiere más de una forma de autenticación para verificar la legitimidad de la identidad del usuario.  
 
7.8	Back office: Es el conjunto de procesos, actividades, tareas y aplicaciones que apoyan al giro del negocio y ayudan a las áreas que no tienen contacto directo con el cuentahabiente.  
 
7.9	Componente crítico de sistema: Es aquel componente que su alteración o eliminación puede dañar o inutilizar el sistema y su funcionamiento (por ejemplo, System32, pagefile.sys, archivos dll, archivos de configuración, etc.). 
 
7.10	Cuenta privilegiada: Cuenta de sistemas operativos o aplicaciones con permisos de acceso elevado de administración mayor que el de un usuario normal.   
 
7.11	Equipo de usuario: Computadora personal utilizada por un usuario final o administrador para realizar sus tareas.  
 
7.12	Hardening: Proceso que trata de reducir las vulnerabilidades y agujeros de seguridad presentes en un sistema, creando un entorno lo más seguro posible siguiendo los principios de: mínima superficie de exposición, mínimos privilegios y defensa en profundidad. 
 
7.13	Host: Es también conocido como hosting, hospedaje o anfitrión, es cualquier computadora o máquina conectada a una red mediante un número de IP definido y un dominio, que ofrece recursos, información y servicios a sus usuarios. 
 
7.14	Inicio de sesión / sesión interactiva: Modelo de sesión a un sistema que implica intercambio de datos (por ejemplo, un usuario que ingresa datos o un comando y el sistema devuelve datos). 
 
7.15	Licenciamiento: Contrato entre el cliente y el distribuidor de un sistema software para el uso del mismo cumpliendo con ciertas condiciones en sus cláusulas. 
 
7.16	Lista de control de acceso a la red (ACL, por sus siglas en inglés): Es un mecanismo de filtrado de paquetes en el tráfico de entrada y salida, basado en reglas conformado por la dirección IP de origen y el puerto utilizado. 
 
7.17	Mitigación del riesgo: Ejecución de medidas de intervención dirigidas a disminuir el riesgo existente. 
 
7.18	Network Time Protocol (NTP): Es un protocolo diseñado para sincronizar los relojes de las estaciones de trabajo a través de la red. 
 
7.19	Participante: Institución que hace uso de los servicios de las Cámaras de Compensación. 
 
7.20	Procedimiento: Es un conjunto de acciones u operaciones que tienen que realizarse de la misma forma, para obtener siempre el mismo resultado bajo las mismas circunstancias. Estas secuencias deben estar documentadas con el fin de garantizar el resultado.  
 
7.21	Puerto externo: Son todos los conectores que permiten la unión con los dispositivos externos al equipo, por ejemplo: puertos USB, teclado, mouse, impresora, etc.  
 
7.22	Red Privada Virtual (VPN, por sus siglas en inglés): Tecnología de red de computadoras que permite una extensión segura de la red de área local (LAN) sobre una red pública o no controlada como Internet. 
 
7.23	Servidor de salto: Servidor que permite el acceso a un dispositivo dentro de la red interna o segura, utilizando servicios de escritorio remoto o administración remota. 
 
7.24	Servicios de TI: Conjunto de componentes que ejecutan procesos de negocio dentro de la red interna o zona segura. 
 
7.25	Sistemas internos o Middleware: Capa de software entre el back office y la infraestructura local relacionada con las Cámaras de Compensación. 
 
7.26	Sistema de puntuación de vulnerabilidad común (CVSS, por sus siglas en inglés): Es un marco para evaluar la gravedad de las vulnerabilidades de seguridad en el software mediante la asignación de puntuaciones de severidad, lo que permite la priorización de respuestas y recursos en línea frente a la amenaza. 
 
7.27	Token de seguridad: Es un dispositivo o aplicación que provee un mecanismo o factor adicional de autenticación.  
 
7.28	Usuario: Se refiere a los responsables de realizar operaciones en los sistemas relacionados con las Cámaras de Compensación. 
 
7.29	Zona segura: Segmento de red asignado y ubicación física en las instalaciones del participante donde está instalada la infraestructura y sistemas relacionados a sus operaciones internas y los que corresponden a las Cámaras de Compensación. 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
8.	Principios y objetivos de los controles de seguridad. Los controles de seguridad definidos en el presente documento se basan en cuatro principios generales, respaldados por siete objetivos que muestran las distintas áreas de enfoque de prioridad dentro de cada principio. 
 
 
  
 
 
9.	Alcances de aplicación de los controles de seguridad. Los controles de seguridad de la información definidos en los presentes lineamientos son aplicables al entorno utilizado por el software y hardware para la interconexión y operación de las Cámaras de Compensación, tanto en los ambientes de desarrollo, como en los de pruebas y de producción, los cuales son gestionados por el participante. 
 
9.1	Capa de intercambio de datos. Es la infraestructura de conectividad utilizada para la transmisión y recepción de información segura entre: 
 
9.1.1	Las agencias del participante y su central de procesamiento (se incluyen puntos intermedios). 
 
9.1.2	La central de procesamiento del participante e ICG.  
 
Se incluye, pero no se limita a:  
 
a)	Redes de telecomunicaciones. 
b)	Servidores. 
c)	Sistemas operativos. 
d)	Aplicaciones. 
e)	Tokens y certificados. 
f)	Computadoras o estaciones de trabajo. 
g)	Usuarios operativos y administradores. 
 
Se excluyen del alcance los componentes siguientes: 
a)	Back office y sistemas internos del participante: Los sistemas responsables de la lógica de negocios, la generación de transacciones y otras actividades que se producen antes de la transmisión a la infraestructura de las Cámaras de Compensación. 
 
b)	Entorno de TI del participante: La infraestructura de TI en general utilizada para el soporte de la institución ajena a la interconexión o relación con las Cámaras de Compensación (por ejemplo: servidor de correo u otros servicios de TI, aplicaciones, etc.). 
 
10.	Tabla de resumen de controles de seguridad. La siguiente tabla proporciona una descripción general de todos los controles de seguridad obligatorios, estructurados de acuerdo con el principio al que soportan. 
 
  
 
11.	Descripción detallada de los controles. 
 
11.1	Segregación de ambientes y control de acceso a internet. 
 
11.1.1	Segregación de ambientes y zonas seguras. Definir y mantener una zona segura segregada para disminuir o mitigar el compromiso ante cualquier ataque, tanto desde la red interna como externa del participante a la infraestructura relacionada a la interconexión y operación de las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Acceso a la zona segura. Hacer uso de métodos seguros para el acceso a la zona segura, por ejemplo, pero no limitado a: 
i.	Equipos físicos dedicados, situados en la zona segura. 
ii.	Servidor de salto, situado en la zona segura. 
iii.	El control de acceso para la administración de dispositivos en la zona segura de forma remota, debe utilizar los mismos métodos de acceso que los administradores y usuarios locales. 
iv.	El acceso para la administración de forma remota a la zona segura se debe realizar por medio de infraestructuras de soporte dedicadas y encriptadas, por ejemplo, pero no limitado a: instancia de VPN. 
 
b)	Protección perimetral. 
i.	Contar con una segregación o separación lógica entre la zona segura y el entorno de TI, Back office y sistemas internos del participante, por ejemplo, pero no limitado a: segregación mediante firewall, entre otros. 
 
ii.	La conexión entre la zona segura y el entorno de TI, Back office y sistemas internos de la institución debe ser únicamente con fines de administración, sistemas de seguridad y monitoreo, por ejemplo, pero no limitado a: recolección de bitácoras, copias de seguridad, entre otros. 
 
iii.	Llevar a cabo revisiones, como mínimo una vez al año, de las políticas y reglas del firewall (Firewall Assessment). 
 
iv.	Separar los entornos de desarrollo o pruebas de los entornos de producción y reforzar la separación a través de reglas del firewall y con controles de acceso. 
 
 
 
c)	Segregación de servicios del negocio. 
 
i.	Configurar el acceso a las aplicaciones y servidores dentro de la zona segura a través de autenticación local o mediante un sistema de autenticación dedicado a la zona segura. 
 
d)	Redes y Telecomunicaciones. 
i.	Restringir el tráfico dentro de la zona segura, host por host basado en listas de control de acceso mínimo requerido. 
ii.	Restringir el tráfico entrante y saliente en los protocolos y direcciones IP establecidos para la operación de las Cámaras de Compensación, negando el tráfico restante (Default Deny).  
 
e)	Restricción de acceso a internet. 
 
i.	Restringir el acceso a internet basado en una lista blanca. 
 
ii.	Permitir el acceso a internet, únicamente desde una máquina virtual debidamente protegida. 
iii.	Monitorear el historial de navegación para identificar URLs de destinos no autorizados. 
 
f)	Software. 
i.	Cualquier sistema o software en etapa de desarrollo o pruebas debe permanecer fuera de la zona segura. 
 
ii.	Mantener un inventario actualizado de los sistemas y software autorizado dentro de la zona segura. 
 
g)	Actualizaciones de seguridad. 
 
i.	Deben realizarse pruebas de las actualizaciones o parches de seguridad previo a su instalación en los servidores o aplicaciones en producción. La actualización se debe realizar desde un servidor de parcheo. 
 
ii.	Se debe revisar cada 30 días si las aplicaciones de los dispositivos de la zona segura tienen parches por aplicar, y estos se deben aplicar según lo especificado en el control 11.2.3 Licenciamiento y actualizaciones de seguridad de software.  
 
 
 
 
h)	Actualizaciones para el antimalware. 
 
i.	Descargar las actualizaciones de definiciones para el antimalware utilizando un método seguro y confiable desde fuera de la zona segura, para ser transferidos posteriormente a la zona segura y ser distribuidas. 
 
ii.	En los casos que amerite, únicamente los administradores podrán desactivar el monitoreo de antimalware o antivirus.  
 
iii.	El antimalware o antivirus debe tener activado el historial de actualizaciones realizadas con el fin de identificar cuando una actualización no se realiza.  
 
11.1.2	Proteger las plataformas de virtualización. Proteja las plataformas de virtualización y las máquinas virtuales (VM, por sus siglas en inglés) que alojan componentes relacionados con las Cámaras de Compensación.  
 
Alcance del control: 
Plataformas de virtualización, también denominadas hipervisor y máquinas virtuales, ya sea que estas sean administradas de forma local u operada por un tercero, o ambos, deben contener como mínimo los procedimientos y actividades siguientes: 
 
a)	Aplicar los controles al mismo nivel que los sistemas y la infraestructura física. 
 
b)	El alcance de los escaneos de vulnerabilidades debe considerar todas las plataformas de virtualización.  
 
c)	Asegurar que los hosts de las plataformas de virtualización estén protegidos a nivel físico.  
 
d)	Asegurar que la autenticación multifactor esté implementada a nivel de sistema operativo para tener acceso a los sistemas de las Cámaras de Compensación. 
 
e)	Tener una gestión de capacidades.  
 
f)	Aplicar políticas de hardening a los servidores virtuales previo a su puesta en producción. 
 
11.2	Mitigación de vulnerabilidades y ataques físicos y lógicos. 
 
11.2.1	Seguridad en el flujo de datos. Implementar mecanismos para proteger la confidencialidad, integridad, disponibilidad y autenticación en los flujos de datos. 
 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Utilizar protocolos seguros entre el origen y destino de las transacciones que aseguren la confidencialidad e integridad de los datos, entre los componentes que interactúan con las Cámaras de Compensación.  
 
b)	Los certificados en los esquemas de PKI deben ser renovados anualmente como mínimo.  
 
c)	Tener procedimientos documentados para verificar la validez de los certificados digitales utilizados entre los componentes que interactúan con las Cámaras de Compensación. 
 
d)	Mantener documentado y actualizado un diagrama del flujo que indique los procesos y dispositivos que se ejecutan en el esquema de PKI. 
 
11.2.2	Hardening de sistemas. Definir un procedimiento formal de hardening para la infraestructura relacionada a la interconexión y operación de las Cámaras de Compensación.   
 
Alcance del Control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
Componentes a considerar en la guía de hardening: 
 
a)	Servidores. 
 
b)	Equipos de usuarios o computadoras operativas. 
 
c)	Cualquier otro dispositivo que interactúe con las Cámaras de Compensación, por ejemplo: IPS, switches, routers y firewall. 
 
Notas: 
Puede ser utilizado como guía cualquiera de las opciones siguientes o una combinación de ellas: 
 
a)	Guía de configuración de seguridad del proveedor. 
 
b)	Guía de configuración de seguridad estándar de la industria, tales como: 
 
i.	CIS – Center for Internet Security. 
 
ii.	SANS – SysAdmin Audit Network Security. 
 
iii.	NIST – National Institute of Standards Technology. 
 
iv.	ISO – International Organization for Standardization. 
 
11.2.3	Licenciamiento y actualización de seguridad de software. Mantener el licenciamiento, soporte y aplicar de manera oportuna los parches y las actualizaciones de seguridad a todo hardware y software relacionado a la interconexión y operación de las Cámaras de Compensación.  
 
Alcance del Control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Licenciamiento. 
 
i.	Debe mantener un inventario de licencias del software instalado en la infraestructura relacionada a la interconexión y operación de las Cámaras de Compensación. Debe contener como mínimo, sin estar limitado a: nombre del producto, versión, fecha de instalación, número de contrato, fecha de compra, fecha de renovación, cantidad, proveedor, fabricante, responsable. 
 
ii.	Procedimientos para el monitoreo y control del uso de licencias y sus contratos. 
 
b)	Actualizaciones de seguridad. 
 
i.	Procedimientos para aplicar actualizaciones o parches de seguridad, de software y firmware, que mitiguen vulnerabilidades de día 0 o con una puntuación CVSS de 9.0 - 10.0 de forma inmediata posterior a su publicación. 
 
ii.	Aplicar las actualizaciones o parches de seguridad, de software y firmware, que atiendan vulnerabilidades con una puntuación CVSS de 7 o superior, dentro de los 2 meses posteriores a su publicación. 
 
iii.	Aplicar las actualizaciones o parches de seguridad, de software y firmware, que atiendan vulnerabilidades con una puntuación CVSS 6.9 o menor, dentro de los 6 meses posteriores a la publicación. 
 
c)	Puesta en producción y actualizaciones de software. 
 
i.	Procedimientos para el ciclo de desarrollo seguro, de pruebas y puestas en producción, donde el traslado de cada fase debe ser autorizado por el ejecutivo responsable, bajo la metodología de control dual, velando que quien autoriza no participa directamente en la ejecución de cada fase. 
 
11.2.4	Gestión de cambios. Se debe contar con procedimientos para cualquier cambio en la infraestructura relacionada con la interconexión y operación de las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Procedimiento que evidencie la autorización de los cambios a realizar. 
 
b)	Análisis de riesgos de los cambios a realizar. 
 
c)	Documentación de soporte asociada a los cambios a realizar. 
 
d)	Procedimiento de recuperación para cambios no exitosos. 
 
e)	Procedimiento para implementación de cambios de emergencia. 
 
f)	La gestión o control de cambios debe cumplir con lo definido en el procedimiento establecido en el control 11.2.3, literal c), Puesta en producción y actualizaciones de software. 
 
11.2.5	Análisis de vulnerabilidades. Identificar, evaluar y dar tratamiento oportuno a las vulnerabilidades técnicas de la infraestructura relacionada con la interconexión y operación de las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Tener documentada la gestión de vulnerabilidades (identificación, valoración y mitigación). 
 
b)	Realizar escaneos de vulnerabilidades al segmento de red donde se encuentre la infraestructura relacionada con la interconexión y operación de las Cámaras de Compensación y después de cualquier cambio significativo en el entorno. 
 
c)	Los escaneos de vulnerabilidades deben incluir todos los equipos conectados al segmento de red donde se encuentre la infraestructura relacionada con la interconexión y operación de las Cámaras de Compensación, considerando, pero no limitado a: 
 
i.	Software propietario. 
 
ii.	Software bajo licencia. 
 
iii.	Sistemas operativos. 
 
iv.	Firmware de equipo activo. 
 
v.	Periféricos. 
 
vi.	Equipos de usuario. 
 
vii.	Servidores. 
 
viii.	Switches, routers, entre otros. 
 
11.2.6	Protección Antimalware. Implementar y gestionar un sistema antimalware para proteger los sistemas relacionados con la conexión y operación de las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Mantener actualizado el sistema antimalware en todos los servidores y equipos de cómputo relacionados con las Cámaras de Compensación. 
 
b)	El sistema antimalware debe estar debidamente licenciado y que sea reconocido en la industria. 
 
c)	Validar que el sistema antimalware cuente con capacidades de detección basado en firmas y en análisis heurístico o con sistema EDR. 
 
d)	Establecer tareas programadas y periódicas para escaneos de antimalware en todos los servidores y equipos de cómputo relacionados con las Cámaras de Compensación. 
 
e)	Revisar de forma periódica el resultado de las tareas programadas y las bitácoras del sistema antimalware. 
 
11.2.7	Hardening de aplicaciones. Realizar comprobaciones de todas las aplicaciones previo, durante y posterior a su instalación relacionadas con las Cámaras de Compensación, este proceso reduce en gran medida las capacidades, características y protocolos de las aplicaciones que pueden ser usados durante un ataque.  
 
Alcance del control: 
Este proceso asegura que se cambien las credenciales predeterminadas. Como mínimo, el proceso de hardening de aplicaciones debe considerar lo siguiente: 
 
a)	Aplicar la política de “menor privilegio”. 
 
b)	Cambiar las contraseñas por defecto existentes. 
 
c)	Deshabilitar o eliminar cuentas de usuario innecesarias. 
 
d)	Deshabilitar características y servicios que no son necesarios para las operaciones normales. 
 
e)	Ajustar cualquier configuración predeterminada que sea vulnerable. 
 
f)	Restringir el acceso a internet basado en una lista blanca de URLs específicas para el funcionamiento de la aplicación. 
 
11.3	Detección de actividades anómalas. 
 
11.3.1	Gestión de bitácoras. Registrar todos los eventos de los sistemas asociados con las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Implementar pistas de auditoría para vincular todo acceso a componentes del sistema con usuarios específicos. 
 
b)	Implementar pistas de auditoría automática en todos los componentes que intervengan en la operación de las Cámaras de Compensación, a fin de reconstruir los siguientes eventos: 
 
i.	Todo acceso por parte de usuarios a los datos de las Cámaras de Compensación. 
 
ii.	Todas las acciones realizadas por usuarios o cuentas privilegiadas. 
 
iii.	Intentos de acceso lógico fallidos o no válidos. 
 
iv.	Uso y cambios de los mecanismos de identificación y autenticación, incluidos, entre otros, la creación de nuevas cuentas de usuarios, cambio en los privilegios a las cuentas de los usuarios, principalmente a los usuarios o cuentas privilegiadas.  
 
v.	Inicialización, detención o pausa de los registros de auditoría. 
 
vi.	Creación, modificación y eliminación de objetos a nivel de los componentes de software, hardware y reglas de los firewalls, switches, IDS o IPS. 
 
vii.	Creación, modificación y eliminación de objetos en las bases de datos. 
 
viii.	Acceso directo a las bases de datos. 
 
ix.	Activación y desactivación de los sistemas de protección o seguridad. 
 
x.	Modificación y eliminación de archivos u objetos. 
 
c)	El registro de los eventos o bitácoras debe contar como mínimo con la siguiente información: 
 
i.	Fecha y hora del evento. 
 
ii.	Tipo de evento clave. 
 
iii.	Usuario origen o responsable del evento. 
 
iv.	Dirección IP del equipo que generó el evento. 
 
v.	Información del evento. 
 
d)	Los logs o bitácoras deben ser resguardados con las medidas de seguridad pertinentes para evitar cualquier alteración sin ser detectada.  
 
e)	Los logs o bitácoras deben almacenarse por un periodo no menor a un año y estar disponibles en línea tres meses. 
 
f)	Asegurar la sincronización de los relojes de los servidores y equipos operativos del participante con un protocolo NTP confiable (Network Time Protocol). 
 
11.3.2	Integridad de software. Realizar comprobaciones de integridad al software instalado en la infraestructura relacionada con las Cámaras de Compensación (servidores, equipos de cómputo operativo, entre otros). 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Implementar ambientes controlados o separados para validar la integridad y ejecución de cambios.  
 
b)	Implementar un proceso de verificación de cambios en los archivos y directorios críticos del sistema operativo al iniciar sesión o como mínimo una vez al día. 
 
c)	Implementar un procedimiento para el control de cambios de los archivos y directorios críticos de los componentes críticos (servidores, equipos de cómputo operativos, entre otros) relacionados con los sistemas de las Cámaras de Compensación.  
 
d)	Tener una gestión de control de cambios que permita evidenciar quién solicita, quién autoriza y dejar documentado los registros correspondientes. 
 
11.3.3	Integridad de base de datos. Realizar comprobaciones de integridad a las bases de datos de los sistemas relacionados con la operación de las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Implementar un proceso para verificar que no existan modificaciones no autorizadas en las bases de datos relacionadas con la operación de las Cámaras de Compensación desde cualquier aplicación, por ejemplo, herramientas de administración de bases de datos o aplicaciones desarrolladas internamente o bajo licencia. 
 
b)	Definir procedimientos que almacenen pistas de auditoría para el monitoreo de los cambios sobre las bases de datos asociados a la operación de las Cámaras de Compensación realizados por los administradores. 
 
c)	Mantener una lista de administradores debidamente autorizados. 
 
d)	Tener una gestión de backups y mantenimiento a las bases de datos relacionadas con las Cámaras de Compensación. 
 
e)	Tener una gestión de control de cambios que permita evidenciar: quién solicita, quién autoriza y dejar documentado los registros correspondientes. 
 
11.3.4	Pruebas de Pentest. Llevar a cabo pruebas de penetración cuyo alcance contemple los activos, incluyendo, pero no limitado a: servidores, equipos de telecomunicaciones, equipos operativos de usuarios y los sistemas relacionados con las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Realizar pruebas de penetración como mínimo una vez al año y después de cambios significativos en el entorno. 
 
b)	Realizar las pruebas de penetración en horarios que no comprometan las entregas de información a las Cámaras de Compensación. 
 
c)	Dar tratamiento a las brechas basado en los resultados de la prueba. 
 
 
 
 
 
 
 
 
11.4	Aseguramiento del entorno físico. 
 
11.4.1	Seguridad y accesos físicos. Implementar controles de seguridad física para la protección de la infraestructura relacionada con las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Acceso físico a las instalaciones, del personal interno y externo.  
 
i.	Registrar el ingreso y egreso a las áreas restringidas. El registro debe contener como mínimo hora de ingreso, hora de salida y la identificación (ID) del empleado o visitante; si es visitante o colaborador ajeno al área, nombre de quién autorizó el ingreso. 
 
ii.	En caso de ser visitante o colaborador ajeno al área, la persona debe estar acompañada en todo momento cuando éste se encuentre en las áreas restringidas. 
 
iii.	Conservar los registros de acceso físico como mínimo por un periodo de 12 meses. 
 
iv.	Revocar o modificar inmediatamente los accesos físicos, cuando un colaborador cambie de puesto o abandone la institución. 
 
v.	Revisar acorde a las políticas internas del participante las matrices de acceso físico a las áreas restringidas.     
 
b)	Seguridad física del centro de datos. 
 
i.	El centro de datos debe estar en un ambiente cerrado protegido con todos sus planos requeridos debidamente actualizados. 
 
ii.	Contar con controles ambientales que permitan monitorear: temperatura, humedad, sensores de inundación, entre otros. 
 
iii.	El centro de datos debe tener un equipo de supresión de incendios que cumpla con estándares reconocidos en la industria.   
 
iv.	Contar con circuito cerrado de televisión (CCTV) donde se encuentren ubicados los servidores y áreas adyacentes, las grabaciones se deben conservar como mínimo por un periodo de 90 días. 
 
v.	Remover etiquetas que contengan usuario y contraseñas de fábrica de los equipos y aplicaciones que se encuentran en el centro de datos. 
 
vi.	Se debe contar con una matriz de accesos físicos a las áreas restringidas, que permita identificar qué personas tienen acceso. 
 
c)	Dispositivos extraíbles. 
 
i.	Limitar el uso de dispositivos extraíbles, por ejemplo, pero no limitado a: 
memorias USB, discos externos, teléfonos celulares como medio de almacenamiento, entre otros. 
 
ii.	Se debe contar con un procedimiento de solicitud, análisis, autorización, monitoreo y revisión de los dispositivos extraíbles. 
 
iii.	El uso de dispositivos extraíbles debe cumplir con las medidas de seguridad pertinentes, entre otras, de cifrado. 
 
11.5	Control de accesos y administración de personal e identidades. 
 
11.5.1	Gestión de personal. Asegurar que los colaboradores y proveedores comprendan sus responsabilidades respecto a la seguridad de la información y que sus roles sean consistentes con sus capacidades y a la información que acceden relacionada con las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Expediente del colaborador. Todo colaborador debe tener dentro de su expediente, como mínimo, la información siguiente: 
 
i.	Referencias laborales y personales. 
 
ii.	Hoja de vida. 
 
iii.	Documentos de identificación personal. 
 
iv.	Información crediticia. 
 
v.	Antecedentes penales y policiacos. 
 
vi.	Evaluación socioeconómica. 
 
vii.	Tener un contrato y perfil de puesto donde se describan las responsabilidades y obligaciones de seguridad de la información del colaborador. 
 
b)	Convenio de confidencialidad y no divulgación firmado por el colaborador, el cual debe ser actualizado por lo menos una vez al año. Se exceptúan las instituciones que se rigen por un reglamento interno. 
 
c)	Constancia de capacitación del personal de nuevo ingreso donde se incluyan temas sobre seguridad de la información. 
 
d)	Constancia de la inducción a personal de nuevo ingreso donde se debe considerar temas de seguridad de la información.  
 
El participante deberá:  
 
a)	Informar a ICG acerca de los cambios del personal que participa en las autorizaciones directas y operaciones del participante en las Cámaras de Compensación. 
 
b)	Tener un programa de sensibilización y capacitación sobre la seguridad de la información y ciberseguridad a los colaboradores, consistente con sus roles y responsabilidades dentro de las operaciones de las Cámaras de Compensación.    
 
c)	Realizar evaluaciones de competencias laborales asociadas a la operación de las Cámaras de Compensación, por lo menos una vez al año. 
 
d)	Evaluar, medir y cuantificar el programa implementado. 
 
 
11.5.2	Políticas de contraseñas. Establecer reglas para la implementación de contraseñas seguras en la infraestructura relacionada con las Cámaras de Compensación. 
 
Alcance del control: 
Las características básicas de las contraseñas son: 
 
a)	La longitud de las contraseñas no debe ser menor a 12 caracteres. 
 
b)	Deben contener como mínimo 4 tipos de caracteres:  letras mayúsculas y minúsculas, números y caracteres especiales ($, #, -, etc.). 
 
c)	Deben cambiarse como máximo cada 60 días. 
 
d)	No se deben reutilizar las últimas 6 contraseñas. 
 
e)	Se deben bloquear después de 3 intentos fallidos de acceso. 
 
11.5.3	Gestión de accesos lógicos. Se debe contar con un proceso de gestión de accesos lógicos para la protección de la información relacionada con las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Asignar los privilegios de acceso basado en el principio del menor privilegio. 
 
b)	Accesos temporales deben ser otorgados con el principio de menor privilegio, documentando: para qué, cuándo, a quién, autorizador y la actividad a realizar. 
 
c)	Revocar los privilegios de usuario de forma inmediata cuando un empleado abandone la institución. 
 
d)	Revisar y actualizar los privilegios de un usuario cuando cambie de puesto para cumplir con el principio de menor privilegio acorde a las nuevas funciones. 
 
e)	Revisar las cuentas de usuario como mínimo una vez al año, actualizando los privilegios según sea necesario para cumplir con el principio de menor privilegio. 
 
f)	Contar con procedimientos de emergencia para acceder a cuentas privilegiadas cuando se requiera. 
 
g)	Monitorear en todo momento cuando el procedimiento de emergencia sea activado. 
 
h)	Todo usuario debe tener un identificador único, no deben existir usuarios o identificadores genéricos ni grupales.  
 
i)	Todo usuario y contraseñas predeterminadas de fábrica deberán ser eliminadas; salvo que, por requerimientos del proveedor deban ser conservadas. 
 
j)	La gestión de accesos lógicos y credenciales de accesos privilegiados debe ser administrada y monitoreada, por ejemplo, por un sistema de administración de accesos e identidades (IAM).  
 
11.5.4	Autenticación Multifactor (MFA). Implementar un sistema de autenticación multifactor tomando en cuenta: algo que tienes, algo que sabes y algo que eres. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Contar con un sistema de autenticación multifactor en los sistemas operativos de los equipos de cómputo y aplicaciones relacionados con las Cámaras de Compensación.  
 
b)	Establecer una debida gestión de dispositivos o mecanismos de autenticación multifactor que incluya la entrega, mantenimiento y revocación de los mismos. 
 
c)	Mantener un inventario de los dispositivos MFA físicos o móviles asignados a cada colaborador. 
 
11.6	Gestión de proveedores y actividades subcontratadas.  
 
11.6.1	Gestión de proveedores. Establecer una debida gestión de proveedores con el fin de asegurar que sus aportes contribuyan a que los participantes en las Cámaras de Compensación puedan operar cumpliendo con los niveles de servicio y horarios establecidos.  
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Clasificar a los proveedores acorde a la criticidad o acceso a la información relacionada a las Cámaras de Compensación. 
 
b)	Ejecutar una evaluación anual de cada proveedor, que incluya, por ejemplo: 
cumplimiento de SLA’s, calidad de servicio prestado, inconformidades, cumplimiento a estándares de seguridad de la información, entre otros. 
 
c)	Notificar a todas las áreas involucradas de la institución y partes interesadas, la baja de cualquier proveedor relacionado a las Cámaras de Compensación. 
 
d)	Actividades críticas subcontratadas: 
 
i.	Los proveedores de actividades críticas subcontratadas, deben cumplir con políticas de seguridad de la información, ciberseguridad y buenas prácticas dictadas por la institución. 
 
ii.	Deben establecerse cláusulas de confidencialidad para proveedores que deban tener acceso a información sensible de las Cámaras de Compensación. 
 
iii.	Deben establecerse acuerdos de confidencialidad y de nivel de servicio. 
El Banco de Guatemala, en su calidad de administrador del Sistema de Liquidación Bruta en Tiempo Real -LBTR-, queda excluido de lo indicado en los incisos b y d, literal i, del presente control. No obstante, el Banco de Guatemala implementará sus propios controles, de conformidad con su normativa interna y procedimientos administrativos aplicables. 
 
11.7	Prevención, detección, respuesta y recuperación a incidentes. 
 
11.7.1	Gestión de riesgos. Gestionar los riesgos es indispensable en cualquier ámbito de seguridad de la información, ya que siempre existe la probabilidad de que un evento desafortunado se materialice y cause algún impacto negativo, poniendo en riesgo la integridad, disponibilidad y confidencialidad de la información relacionada con las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Identificar los riesgos que puedan afectar los servicios de las Cámaras de Compensación. 
 
b)	Definir los criterios de aceptación del riesgo residual. 
 
c)	Realizar un análisis de los riesgos identificados en los procesos y activos relacionados con las Cámaras de Compensación, considerando lo siguiente: 
 
i.	Identificar los activos con sus criterios de confidencialidad, disponibilidad e integridad. 
 
ii.	Probabilidad de materialización del riesgo. 
 
iii.	Impacto de la ocurrencia del riesgo. 
 
iv.	Controles que mitiguen los riesgos identificados. 
 
v.	Evaluar los riesgos con base en el resultado del análisis de los mismos. 
 
d)	Dar tratamiento a los riesgos que superen el nivel aceptable. 
 
e)	Generar matriz de riesgos y mapa de calor o su equivalente. 
 
11.7.2	Gestión de incidentes. Establecer responsabilidades y procedimientos para la gestión de incidentes de seguridad de la información relacionados con la interconexión y operación de las Cámaras de Compensación, que aseguren una respuesta rápida, eficaz y ordenada, minimizando el impacto adverso en las operaciones y asegurando que se mantengan los niveles de calidad y disponibilidad de la información.  
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Tener debidamente documentada una gestión de incidentes de seguridad de la información. 
 
b)	Procedimientos para la identificación, detección y registro de eventos o incidentes operativos, de seguridad de la información y ciberseguridad relacionados con las Cámaras de Compensación. 
 
c)	Procedimientos para el análisis y respuesta a los eventos o incidentes operativos, de seguridad de la información y ciberseguridad. 
 
d)	Procedimientos para el tratamiento y mejora a los eventos o incidentes operativos, de seguridad de la información y ciberseguridad.  
 
e)	Documentar los planes de respuesta a los eventos o incidentes operativos, de seguridad de la información y ciberseguridad relacionados con las Cámaras de Compensación. 
 
f)	Probar los planes de respuesta a los eventos o incidentes operativos, de seguridad de la información y ciberseguridad como mínimo una vez al año. 
 
11.7.3	Gestión de continuidad del negocio. Definir y establecer los requisitos de seguridad de la información y continuidad del negocio en situaciones adversas, mediante un proceso formal para la recuperación de los servicios y sistemas relacionados con la interconexión y operación de las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Elaborar un análisis de impacto al negocio (BIA) para los servicios de las Cámaras de Compensación. 
 
b)	Establecer los periodos de recuperación de cada Cámara de Compensación (RTO, RPO, MBCO y MTPD) y periodos críticos (por ejemplo: horarios de liquidación, disponibilidad del servicio, entre otros).  
 
c)	Análisis de riesgos de interrupción (indisponibilidad) de las Cámaras de Compensación.  
 
d)	De acuerdo a los resultados del BIA establecer las estrategias (antes, durante y después) para estar preparados al momento de un incidente de interrupción que afecte las Cámaras de Compensación. 
 
e)	Documentar los planes (que respondan a las estrategias) de continuidad del negocio relacionados con las Cámaras de Compensación, por ejemplo, pero no limitado a: 
 
i.	Plan de comunicación de crisis. 
 
ii.	Plan de gestión de crisis. 
 
iii.	Plan de continuidad de cada Cámara de Compensación. 
 
iv.	Plan de continuidad de TI (DRP). 
 
v.	Plan de continuidad de áreas de soporte a las Cámaras de Compensación. 
 
f)	Tener un programa anual de pruebas y ejercicios de los planes, estrategias, data center primario y data center alterno para la continuidad del negocio de las Cámaras de Compensación. Incluir las pruebas o ejercicios organizados por el administrador de las Cámaras de Compensación. 
 
11.7.4	Ciberseguridad. Gestionar la ciberseguridad es indispensable en cualquier ámbito de seguridad de la información, ya que existe la probabilidad de que un evento desafortunado se materialice y cause algún impacto negativo, poniendo en riesgo la integridad, disponibilidad y confidencialidad de la información relacionada con las Cámaras de Compensación. 
 
Alcance del control: 
Como mínimo los procedimientos y actividades que deben contener son: 
 
a)	Identificar. Identificar los activos en el ciberespacio que soportan los servicios de las Cámaras de Compensación y el riesgo tecnológico asociado, considerando como mínimo lo siguiente:  
 
i.	Gestión de activos en el ciberespacio: deberán ser identificados, documentados y gestionados en forma consistente, en relación con los objetivos y la estrategia de riesgo de la institución. 
 
ii.	Evaluación: identificar, analizar, clasificar y documentar sus vulnerabilidades cibernéticas, ciberamenazas, ciberataques, incidentes cibernéticos y los efectos de estos, considerando:  
 
	El potencial impacto en la institución y la probabilidad de ocurrencia de estas. 
	Priorizar las respuestas a las mismas.  
	Definir los procedimientos para recibir información y alertas por parte de grupos y fuentes especializadas externas. 
 
b)	Proteger. Desarrollar e implementar políticas, procesos y procedimientos para proteger la confidencialidad, integridad y disponibilidad de sus activos en el ciberespacio, con el objeto de prevenir, limitar o contener el impacto de un ciberataque. 
 
c)	Detectar.  Monitorear sus activos en el ciberespacio, accesos, conexiones, las acciones que realizan los usuarios internos o externos, aplicaciones y acciones de los proveedores de servicios externos en la institución, para detectar vulnerabilidades cibernéticas, ciberamenazas, ciberataques e incidentes cibernéticos a través de la implementación, de forma interna o a través de la contratación, de un Centro de Operaciones de Seguridad Cibernética (Security Operation Center) con el objeto de proporcionar una visibilidad centralizada, monitoreo continuo y emisión de alertas, considerando como mínimo lo siguiente:. 
 
i.	Mantener contactos apropiados con grupos de interés especial u otros foros y asociaciones profesionales especializadas en seguridad y ciberseguridad.  
 
ii.	Ser miembro o pertenecer a un Equipo de Respuesta para Emergencias Informáticas (CERT). 
 
iii.	Contar con un Centro de Operaciones de Seguridad (SOC) ya sea administrado de forma interna o tercerizado. 
 
d)	Responder. Contar con procesos y procedimientos para garantizar una respuesta oportuna, durante y después de un incidente cibernético. 
 
e)	Recuperar. Establecer y mantener mecanismos para resistir, responder y recuperarse de un incidente cibernético, con el objeto de restaurar cualquier activo en el ciberespacio o servicios relacionados a este, que haya sido afectado debido a un incidente cibernético, de conformidad con lo establecido en el plan de recuperación ante desastres. 
 
 
 
 
