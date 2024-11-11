CREATE TABLE EMPLEADO
(
   ID_USUARIO           VARCHAR(30) NOT NULL,
   ID_EMPLEO            INT NOT NULL,
   ID_GERENTE           VARCHAR(30),
   FECHA_CONTRATACION   DATE NOT NULL,
   ESTADO               VARCHAR(1) NOT NULL,
   HORA_ENTRADA         TIME NOT NULL,
   HORA_SALIDA          TIME NOT NULL,
   PRIMARY KEY (ID_USUARIO)
);
ALTER TABLE EMPLEADO ADD CONSTRAINT FK_FK_IDEM FOREIGN KEY (ID_EMPLEO) REFERENCES EMPLEO (ID_EMPLEO);
ALTER TABLE EMPLEADO ADD CONSTRAINT FK_FK_IDGE FOREIGN KEY (ID_GERENTE) REFERENCES EMPLEADO (ID_USUARIO);
ALTER TABLE EMPLEADO ADD CONSTRAINT FK_FK_IDUS FOREIGN KEY (ID_USUARIO) REFERENCES USUARIO (ID_USUARIO);
ALTER TABLE EMPLEADO ADD CONSTRAINT CK_ESTADO CHECK(ESTADO IN ('A'/*ACTIVO*/,'N'/*NO ACTIVO*/));


CREATE TABLE EMPLEO
(
   ID_EMPLEO            INT NOT NULL,
   NOMBRE_EMPLEO        VARCHAR(30) NOT NULL,
   DESCRIPCION          VARCHAR(100) NOT NULL,
   PRIMARY KEY (ID_EMPLEO)
);


CREATE TABLE HABITACION
(
   ID_HABITACION        INT NOT NULL,
   NOMBRE               VARCHAR(20) NOT NULL,
   ESTADO_HABITACION    VARCHAR(3) NOT NULL,
   PRIMARY KEY (ID_HABITACION)
);
ALTER TABLE HABITACION ADD CONSTRAINT CK_EST_HAB CHECK(ESTADO_HABITACION IN ('OCU'/*OCUPADA*/,'NOC'/*NO OCUPADA*/));


CREATE TABLE HISTORIAL_NOTIFICACIONES
(
   ID_USUARIO           VARCHAR(30) NOT NULL,
   ID_NOTIFICACION      INT NOT NULL,
   PRIMARY KEY (ID_USUARIO)
);
ALTER TABLE HISTORIAL_NOTIFICACIONES ADD CONSTRAINT FK_FK_IDNO FOREIGN KEY (ID_NOTIFICACION) REFERENCES NOTIFICACION (ID_NOTIFICACION);
ALTER TABLE HISTORIAL_NOTIFICACIONES ADD CONSTRAINT FK_FK_ID_USUA FOREIGN KEY (ID_USUARIO) REFERENCES EMPLEADO (ID_USUARIO);


CREATE TABLE HISTORIAL_TAREAS
(
   ID_USUARIO           VARCHAR(30) NOT NULL,
   ID_TAREA             INT NOT NULL,
   PRIMARY KEY (ID_USUARIO)
);
ALTER TABLE HISTORIAL_TAREAS ADD CONSTRAINT FK_FK_IDTA FOREIGN KEY (ID_TAREA) REFERENCES TAREA (ID_TAREA);
ALTER TABLE HISTORIAL_TAREAS ADD CONSTRAINT FK_FK_IDUSU FOREIGN KEY (ID_USUARIO) REFERENCES EMPLEADO (ID_USUARIO);


CREATE TABLE NOTIFICACION
(
   ID_NOTIFICACION      INT NOT NULL,
   ID_TAREA             INT NOT NULL,
   ID_USUARIO           VARCHAR(30) NOT NULL,
   MENSAJE              VARCHAR(50) NOT NULL,
   TIPO_NOTIFICACION    VARCHAR(4) NOT NULL,
   FECHA_ENVIO          DATETIME NOT NULL,
   PRIMARY KEY (ID_NOTIFICACION)
);
ALTER TABLE NOTIFICACION ADD CONSTRAINT FK_FK_ID_TA FOREIGN KEY (ID_TAREA) REFERENCES TAREA (ID_TAREA);
ALTER TABLE NOTIFICACION ADD CONSTRAINT FK_FK_ID_USU FOREIGN KEY (ID_USUARIO) REFERENCES EMPLEADO (ID_USUARIO);
ALTER TABLE NOTIFICACION ADD CONSTRAINT CK_TIPO_NOTI CHECK (TIPO_NOTIFICACION IN('NUTA'/*NUEVA TAREA ASIGNADA*/,'TACO'/*TAREA COMPLETADA*/,'TAIN'/*TAREA SIN COMPLETAR*/));


CREATE TABLE PERSONA
(
   ID_PERSONA           INT NOT NULL,
   TIPO_IDENTIFICACION  VARCHAR(2) NOT NULL,
   NOMBRES              VARCHAR(30) NOT NULL,
   APELLIDOS            VARCHAR(30) NOT NULL,
   GENERO               VARCHAR(1) NOT NULL,
   CORREO               VARCHAR(50) NOT NULL,
   DIRECCION            VARCHAR(50) NOT NULL,
   TELEFONO             NUMERIC(10,0) NOT NULL,
   PRIMARY KEY (ID_PERSONA)
);
ALTER TABLE PERSONA ADD CONSTRAINT DOM_TIPO_DOC CHECK (TIPO_IDENTIFICACION IN ('CC'/*CEDULA DE CIUDADANIA*/, 'CE'/*CEDULA DE EXTRANJERIA*/, 'PA'/*PASAPORTE*/));
ALTER TABLE PERSONA ADD CONSTRAINT DOM_GENERO CHECK (GENERO IN ('M'/*MASCULINO*/,'F'/*FEMENINO*/,'O'/*OTRO*/));

CREATE TABLE TAREA
(
   ID_TAREA             INT NOT NULL,
   ID_USUARIO           VARCHAR(30) NOT NULL,
   ID_HABITACION        INT,
   NOMBRE               VARCHAR(30) NOT NULL,
   DESCRIPCION          VARCHAR(100) NOT NULL,
   PRIORIDAD            VARCHAR(3) NOT NULL,
   FECHA_VENCIMIENTO    DATETIME NOT NULL,
   ESTADO               VARCHAR(3) NOT NULL,
   PRIMARY KEY (ID_TAREA)
);
ALTER TABLE TAREA ADD CONSTRAINT FK_FK_IDHA FOREIGN KEY (ID_HABITACION) REFERENCES HABITACION (ID_HABITACION);
ALTER TABLE TAREA ADD CONSTRAINT FK_FK_ID_US FOREIGN KEY (ID_USUARIO) REFERENCES EMPLEADO (ID_USUARIO);
ALTER TABLE TAREA ADD CONSTRAINT CK_EST_TAREA CHECK (ESTADO IN('ASG'/*ASIGNADA*/,'COM'/*COMPLETADA*/,'SCM'/*SIN COMPLETAR*/));
ALTER TABLE TAREA ADD CONSTRAINT CK_PRI_TAREA CHECK (PRIORIDAD IN('ALT'/*ALTA*/,'MED'/*MEDIA*/,'BAJ'/*BAJA*/));

CREATE TABLE USUARIO
(
   ID_USUARIO           VARCHAR(30) NOT NULL,
   ID_PERSONA           INT NOT NULL,
   CONTRASENA           VARCHAR(30) NOT NULL,
   TIPO_USUARIO         VARCHAR(3) NOT NULL,
   ESTADO               VARCHAR(1) NOT NULL,
   PRIMARY KEY (ID_USUARIO)
);
ALTER TABLE USUARIO ADD CONSTRAINT FK_FK_IDPE FOREIGN KEY (ID_PERSONA) REFERENCES PERSONA (ID_PERSONA);
ALTER TABLE USUARIO ADD CONSTRAINT CK_TIPO_USUARIO CHECK (TIPO_USUARIO IN ('ADM'/*ADMINISTRADOR*/,'GER'/*GERENTE DE AREA*/,'EMP'/*EMPLEADO*/));
